package org.example.petcarebe.service;

import org.example.petcarebe.dto.SlotDTO;
import org.example.petcarebe.model.Slot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface SlotService {
    // Thêm slot mới
    List<Slot> addSlots(LocalDate date, LocalTime time, int quantity);
    
    // Thêm slot mặc định cho tất cả các ngày
    void addDefaultSlots(LocalTime time, int quantity);
    
    // Xóa slot
    void deleteSlots(LocalDate date, LocalTime time, int quantity);
    
    // Xóa slot mặc định
    void deleteDefaultSlots(LocalTime time, int quantity);
    
    // Lấy danh sách slot theo ngày và giờ
    List<SlotDTO> getSlotsByDateAndTime(LocalDate date, LocalTime time);
    
    // Lấy số lượng slot trống theo ngày và giờ
    int getAvailableSlotCount(LocalDate date, LocalTime time);
    
    // Kiểm tra slot có thể xóa không
    boolean canDeleteSlots(LocalDate date, LocalTime time, int quantity);
} 