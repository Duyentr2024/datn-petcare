package org.example.petcarebe.controller;

import lombok.RequiredArgsConstructor;
import org.example.petcarebe.dto.SlotDTO;
import org.example.petcarebe.service.SlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SlotController {

    private final SlotService slotService;

    @PostMapping("/add")
    public ResponseEntity<?> addSlots(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
        @RequestParam int quantity,
        @RequestParam(defaultValue = "false") boolean isDefault
    ) {
        try {
            if (isDefault) {
                slotService.addDefaultSlots(time, quantity);
                return ResponseEntity.ok(Map.of(
                    "message", "Đã thêm " + quantity + " slot mặc định cho khung giờ " + time
                ));
            } else {
                if (date == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Ngày không được để trống khi thêm slot cụ thể"
                    ));
                }
                slotService.addSlots(date, time, quantity);
                return ResponseEntity.ok(Map.of(
                    "message", "Đã thêm " + quantity + " slot cho ngày " + date + " khung giờ " + time
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteSlots(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
        @RequestParam int quantity,
        @RequestParam(defaultValue = "false") boolean isDefault
    ) {
        try {
            if (isDefault) {
                slotService.deleteDefaultSlots(time, quantity);
                return ResponseEntity.ok(Map.of(
                    "message", "Đã xóa " + quantity + " slot mặc định cho khung giờ " + time
                ));
            } else {
                if (date == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Ngày không được để trống khi xóa slot cụ thể"
                    ));
                }
                slotService.deleteSlots(date, time, quantity);
                return ResponseEntity.ok(Map.of(
                    "message", "Đã xóa " + quantity + " slot cho ngày " + date + " khung giờ " + time
                ));
            }
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi xóa slot"));
        }
    }

    @GetMapping
    public ResponseEntity<List<SlotDTO>> getSlots(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time
    ) {
        List<SlotDTO> slots = slotService.getSlotsByDateAndTime(date, time);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/available")
    public ResponseEntity<Map<String, Integer>> getAvailableSlotCount(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time
    ) {
        int count = slotService.getAvailableSlotCount(date, time);
        return ResponseEntity.ok(Map.of("availableSlots", count));
    }
} 