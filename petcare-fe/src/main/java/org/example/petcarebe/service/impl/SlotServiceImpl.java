package org.example.petcarebe.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.petcarebe.dto.SlotDTO;
import org.example.petcarebe.enums.SlotStatus;
import org.example.petcarebe.model.Slot;
import org.example.petcarebe.repository.SlotRepository;
import org.example.petcarebe.service.SlotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;

    @Override
    @Transactional
    public List<Slot> addSlots(LocalDate date, LocalTime time, int quantity) {
        List<Slot> existingSlots = slotRepository.findByDateAndTime(date, time);
        int startIndex = existingSlots.isEmpty() ? 1 : existingSlots.size() + 1;
        
        List<Slot> newSlots = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Slot slot = new Slot();
            slot.setDate(date);
            slot.setTime(time);
            slot.setSlotIndex(startIndex + i);
            slot.setStatus(SlotStatus.AVAILABLE);
            newSlots.add(slot);
        }
        
        return slotRepository.saveAll(newSlots);
    }

    @Override
    @Transactional
    public void addDefaultSlots(LocalTime time, int quantity) {
        // Thêm slot mặc định (4 slots) cho khung giờ
        LocalDate today = LocalDate.now();
        addSlots(today, time, quantity);
    }

    @Override
    @Transactional
    public void deleteSlots(LocalDate date, LocalTime time, int quantity) {
        if (!canDeleteSlots(date, time, quantity)) {
            throw new IllegalStateException("Không thể xóa slot đã được đặt");
        }

        List<Slot> slots = slotRepository.findSlotsForDateAndTimeOrderByIndexDesc(date, time);
        List<Slot> slotsToDelete = slots.stream()
            .limit(quantity)
            .collect(Collectors.toList());
            
        slotRepository.deleteAll(slotsToDelete);
    }

    @Override
    @Transactional
    public void deleteDefaultSlots(LocalTime time, int quantity) {
        // Xóa slot mặc định cho khung giờ
        LocalDate today = LocalDate.now();
        deleteSlots(today, time, quantity);
    }

    @Override
    public List<SlotDTO> getSlotsByDateAndTime(LocalDate date, LocalTime time) {
        List<Slot> slots = slotRepository.findByDateAndTime(date, time);
        return slots.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public int getAvailableSlotCount(LocalDate date, LocalTime time) {
        return (int) slotRepository.countByDateAndTimeAndStatus(date, time, SlotStatus.AVAILABLE);
    }

    @Override
    public boolean canDeleteSlots(LocalDate date, LocalTime time, int quantity) {
        List<Slot> availableSlots = slotRepository.findAvailableSlotsForDateAndTime(date, time, SlotStatus.AVAILABLE);
        return availableSlots.size() >= quantity;
    }

    private SlotDTO convertToDTO(Slot slot) {
        SlotDTO dto = new SlotDTO();
        dto.setSlotId(slot.getSlotId());
        dto.setDate(slot.getDate());
        dto.setTime(slot.getTime());
        dto.setSlotIndex(slot.getSlotIndex());
        dto.setStatus(slot.getStatus());
        return dto;
    }
} 