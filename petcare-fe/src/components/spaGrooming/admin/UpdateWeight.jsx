import React, { useState, useEffect } from "react";
import { Modal, Select, message } from "antd";
import BookingService from "../../../service/spaService/BookingService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const UpdateWeight = ({
  visible,
  onCancel,
  pet,
  weightOptions,
  onUpdateSuccess,
}) => {
  const [selectedWeightId, setSelectedWeightId] = useState(null);
  const [selectedWeightRange, setSelectedWeightRange] = useState(null);
  const [newPrice, setNewPrice] = useState(null);
  const [priceDiff, setPriceDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Lấy userId từ token khi component được mount
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token in UpdateWeight:", decoded);
        const id = decoded.userId || decoded.sub || decoded.id;
        if (!id) {
          throw new Error("Token không chứa userId, sub, hoặc id.");
        }
        setUserId(String(id));
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        message.error("Không thể xác định người dùng: " + error.message);
        setUserId(null);
      }
    } else {
      message.error("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (visible && pet) {
      setSelectedWeightId(pet.weightId || null);
      setSelectedWeightRange(pet.weightRange || "Không xác định");
      setNewPrice(pet.price || 0);
      setPriceDiff(0);
      // Log để kiểm tra petServiceId
      console.log("Pet data in UpdateWeight:", pet);
      console.log("Weight options in UpdateWeight:", weightOptions);
    }
  }, [visible, pet]);

  const handleWeightChange = async (value, option) => {
    try {
      setLoading(true);
      setSelectedWeightId(value);
      setSelectedWeightRange(option.label);

      // Kiểm tra petServiceId trước khi gọi API
      if (!pet.petServiceId) {
        throw new Error("Không tìm thấy ID dịch vụ của thú cưng");
      }

      const priceResponse = await BookingService.getServicePrice(pet.petServiceId, value);
      if (!priceResponse || typeof priceResponse.price !== "number") {
        throw new Error("Giá dịch vụ không hợp lệ");
      }

      // Làm tròn giá mới về 0 chữ số thập phân
      const updatedPrice = Math.round(priceResponse.price);
      const oldPrice = Math.round(pet.price || 0);
      const diff = updatedPrice - oldPrice;

      setNewPrice(updatedPrice);
      setPriceDiff(diff);
    } catch (error) {
      console.error("Error calculating new price:", error);
      message.error("Không thể tính giá mới: " + (error.message || "Lỗi không xác định"));
      setSelectedWeightId(pet.weightId || null);
      setSelectedWeightRange(pet.weightRange || "Không xác định");
      setNewPrice(pet.price || 0);
      setPriceDiff(0);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    if (!userId) {
      message.error("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    if (!selectedWeightId || selectedWeightId === pet.weightId) {
      message.info("Không có thay đổi để cập nhật");
      onCancel();
      return;
    }

    try {
      setLoading(true);
      message.loading({ content: "Đang cập nhật cân nặng...", key: "weightUpdate" });

      const reason = `Cân nặng thực tế thay đổi từ ${pet.weightRange || "Chưa xác định"} sang ${selectedWeightRange}, giá mới ${newPrice.toLocaleString("vi-VN")}đ (${priceDiff > 0 ? "tăng" : "giảm"} ${Math.abs(priceDiff).toLocaleString("vi-VN")}đ)`;

      // Cập nhật cân nặng và giá
      await BookingService.updatePetWeight(pet.petId, {
        petWeightId: selectedWeightId,
        price: newPrice,
        appointmentId: pet.appointmentId,
        reason: reason,
        userId: userId, // Sử dụng userId từ token
      });

      // Xử lý chênh lệch giá
      if (priceDiff !== 0) {
        try {
          if (priceDiff > 0) {
            // Giá tăng: Lưu phí phụ thu
            await BookingService.createAdditionalFee({
              appointmentId: pet.appointmentId,
              petId: pet.petId,
              amount: Math.abs(priceDiff),
              reason: `Chênh lệch giá do thay đổi cân nặng từ ${pet.weightRange || "Chưa xác định"} sang ${selectedWeightRange}`,
              userId: userId,
              transactionType: "PAYMENT",
            });
            message.info("Đã tạo phí phụ thu: " + Math.abs(priceDiff).toLocaleString("vi-VN") + "đ");
          } else {
            // Giá giảm: Lưu giao dịch hoàn tiền
            await BookingService.createAdditionalFee({
              appointmentId: pet.appointmentId,
              petId: pet.petId,
              amount: Math.abs(priceDiff),
              reason: `Hoàn tiền do giảm giá từ ${pet.weightRange || "Chưa xác định"} sang ${selectedWeightRange}`,
              userId: userId,
              transactionType: "REFUNDED",
            });
            message.info("Đã tạo giao dịch hoàn tiền: " + Math.abs(priceDiff).toLocaleString("vi-VN") + "đ");
          }
        } catch (error) {
          console.error("Failed to handle price difference:", error);
          message.warning("Cập nhật cân nặng thành công nhưng không thể xử lý chênh lệch giá: " + (error.message || "Lỗi không xác định"));
        }
      }

      message.success({ content: "Cập nhật cân nặng và giá thành công", key: "weightUpdate" });
      onUpdateSuccess();
      onCancel();
    } catch (error) {
      console.error("Error updating pet weight:", error);
      message.error({
        content: "Không thể cập nhật cân nặng: " + (error.message || "Lỗi không xác định"),
        key: "weightUpdate",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa cân nặng và giá"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      {pet ? (
        <div>
          <p><strong>Thú cưng:</strong> {pet.petName} ({pet.petType})</p>
          <p><strong>Dịch vụ:</strong> {pet.service || "Không xác định"}</p>
          <p><strong>Cân nặng hiện tại:</strong> {pet.weightRange || "Không xác định"}</p>
          <p><strong>Giá hiện tại:</strong> {(pet.price || 0).toLocaleString("vi-VN")}đ</p>

          <div style={{ marginTop: 16 }}>
            <label><strong>Chọn cân nặng mới:</strong></label>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={selectedWeightId || undefined}
              options={weightOptions}
              placeholder="Chọn cân nặng"
              onChange={handleWeightChange}
              dropdownMatchSelectWidth={false}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              disabled={loading}
            />
          </div>

          {newPrice !== null && (
            <div style={{ marginTop: 16 }}>
              <p><strong>Giá mới:</strong> {newPrice.toLocaleString("vi-VN")}đ</p>
              {priceDiff !== 0 && (
                <p><strong>Chênh lệch:</strong> {priceDiff > 0 ? "Tăng" : "Giảm"} {Math.abs(priceDiff).toLocaleString("vi-VN")}đ</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p>Không có thông tin thú cưng để chỉnh sửa.</p>
      )}
    </Modal>
  );
};

export default UpdateWeight;