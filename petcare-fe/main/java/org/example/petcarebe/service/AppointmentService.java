package org.example.petcarebe.service;

import org.example.petcarebe.model.Appointment;
import org.example.petcarebe.model.AppointmentRequest;
import org.example.petcarebe.model.AppointmentSlot;
import org.example.petcarebe.model.DefaultTimeSlot;
import org.example.petcarebe.model.SlotUpdateMessage;
import org.example.petcarebe.repository.AppointmentRepository;
import org.example.petcarebe.repository.AppointmentSlotRepository;
import org.example.petcarebe.repository.DefaultTimeSlotRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final DefaultTimeSlotRepository defaultTimeSlotRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public AppointmentService(AppointmentRepository appointmentRepository,
                             AppointmentSlotRepository appointmentSlotRepository,
                             DefaultTimeSlotRepository defaultTimeSlotRepo,
                             SimpMessagingTemplate messagingTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.defaultTimeSlotRepo = defaultTimeSlotRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Appointment updateAppointment(Long appointmentId, AppointmentRequest request) {
        // Tìm lịch hẹn
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại: " + appointmentId));

        // Kiểm tra trạng thái
        if (appointment.getStatus() != AppointmentStatus.PAID) {
            throw new IllegalStateException("Chỉ có thể chuyển lịch hẹn ở trạng thái PAID");
        }

        // Parse ngày và giờ mới
        LocalDate newDate;
        LocalTime newTime;
        try {
            newDate = LocalDate.parse(request.getDate());
            newTime = LocalTime.parse(request.getTime());
        } catch (Exception e) {
            throw new IllegalArgumentException("Định dạng ngày hoặc giờ không hợp lệ");
        }

        // Kiểm tra nếu ngày/giờ mới giống cũ
        if (newDate.equals(appointment.getDate()) && newTime.equals(appointment.getTime())) {
            throw new IllegalArgumentException("Ngày và giờ mới phải khác với hiện tại");
        }

        // Kiểm tra slot trống cho thời gian mới
        int requiredSlots = appointment.getPets().size();
        
        // Tìm hoặc tạo slot mới
        AppointmentSlot newSlot = appointmentSlotRepository.findByDateAndTime(newDate, newTime)
                .orElseGet(() -> {
                    DefaultTimeSlot defaultSlot = defaultTimeSlotRepo.findByTime(newTime)
                            .orElseThrow(() -> new IllegalArgumentException("Khung giờ không tồn tại: " + newTime));
                    AppointmentSlot slot = new AppointmentSlot();
                    slot.setDate(newDate);
                    slot.setTime(newTime);
                    slot.setTotalSlots(defaultSlot.getTotalSlots());
                    slot.setBookedSlots(0);
                    slot.setAvailableSlots(defaultSlot.getTotalSlots());
                    slot.setIsActive(true);
                    slot.setDefaultTimeSlot(defaultSlot);
                    appointmentSlotRepository.save(slot); // Lưu slot trước khi liên kết với appointment
                    return slot;
                });

        if (newSlot.getAvailableSlots() < requiredSlots) {
            throw new IllegalArgumentException("Không đủ slot trống cho khung giờ mới");
        }

        // Tìm slot cũ - có thể có nhiều slots
        Optional<AppointmentSlot> oldSlotOptional = appointmentSlotRepository.findByDateAndTime(appointment.getDate(), appointment.getTime());
        if (oldSlotOptional.isPresent()) {
            AppointmentSlot oldSlot = oldSlotOptional.get();
            
            // Cập nhật slot cũ: giảm booked_slots
            oldSlot.setBookedSlots(Math.max(0, oldSlot.getBookedSlots() - requiredSlots));
            oldSlot.setAvailableSlots(Math.min(oldSlot.getTotalSlots(), oldSlot.getAvailableSlots() + requiredSlots));
            appointmentSlotRepository.save(oldSlot);
            
            // Gửi thông báo WebSocket cho slot cũ
            SlotUpdateMessage oldSlotMessage = new SlotUpdateMessage(
                    oldSlot.getDate().toString(),
                    oldSlot.getTime().toString(),
                    -requiredSlots
            );
            messagingTemplate.convertAndSend("/topic/slots", oldSlotMessage);
        }

        // Xóa liên kết của appointment với các slot cũ
        if (appointment.getAppointmentSlots() != null) {
            // Xóa liên kết 2 chiều giữa appointment và slots cũ
            for (AppointmentSlot slot : new HashSet<>(appointment.getAppointmentSlots())) {
                slot.setAppointment(null);
                appointmentSlotRepository.save(slot);
            }
            appointment.getAppointmentSlots().clear();
            appointmentRepository.save(appointment);
            // Flush để đảm bảo thay đổi được áp dụng trước khi thực hiện thay đổi tiếp theo
            appointmentRepository.flush();
            appointmentSlotRepository.flush();
        }

        // Cập nhật lịch hẹn
        appointment.setDate(newDate);
        appointment.setTime(newTime);
        
        // Lưu lịch hẹn sau khi cập nhật ngày/giờ nhưng trước khi thiết lập liên kết mới
        appointmentRepository.save(appointment);
        
        // Tạo mới danh sách slot nếu chưa có
        if (appointment.getAppointmentSlots() == null) {
            appointment.setAppointmentSlots(new HashSet<>());
        }
        
        // Cập nhật slot mới: tăng booked_slots
        newSlot.setBookedSlots(newSlot.getBookedSlots() + requiredSlots);
        newSlot.setAvailableSlots(Math.max(0, newSlot.getAvailableSlots() - requiredSlots));
        appointmentSlotRepository.save(newSlot);
        
        // Thiết lập liên kết mới một cách riêng biệt
        // Đảm bảo không có liên kết hiện tại giữa appointment và newSlot
        if (newSlot.getAppointment() != null && newSlot.getAppointment().getAppointmentId().equals(appointment.getAppointmentId())) {
            newSlot.setAppointment(null);
            appointmentSlotRepository.save(newSlot);
        }
        
        // Thực hiện riêng biệt: lưu slot trước
        newSlot.setAppointment(appointment);
        appointmentSlotRepository.save(newSlot);
        
        // Sau đó thiết lập liên kết từ appointment đến slot
        appointment.getAppointmentSlots().add(newSlot);
        
        // Lưu lại lịch hẹn với liên kết mới
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Gửi thông báo WebSocket cho slot mới
        SlotUpdateMessage newSlotMessage = new SlotUpdateMessage(
                newDate.toString(),
                newTime.toString(),
                requiredSlots
        );
        messagingTemplate.convertAndSend("/topic/slots", newSlotMessage);

        // Gửi thông báo cập nhật lịch hẹn
        Map<String, Object> updateMessage = new HashMap<>();
        updateMessage.put("type", "APPOINTMENT_UPDATED");
        updateMessage.put("appointmentId", appointmentId);
        updateMessage.put("date", newDate.toString());
        updateMessage.put("time", newTime.toString());
        updateMessage.put("petCount", requiredSlots);
        messagingTemplate.convertAndSend("/topic/appointments", updateMessage);

        return updatedAppointment;
    }
} 