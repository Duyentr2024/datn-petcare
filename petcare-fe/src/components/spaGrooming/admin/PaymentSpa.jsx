import React, { useState, useEffect } from "react";
import { Modal, Radio, Button, Descriptions, Table, Tag, Space, message, Divider } from "antd";
import { DollarCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import BookingService from "../../../service/spaService/BookingService";

const PaymentSpa = ({ visible, onCancel, appointment, petDetails }) => {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [petsList, setPetsList] = useState([]);

  const fetchPaymentData = async (appointmentId) => {
    try {
      setLoading(true);

      const petsData = await BookingService.getPetsByAppointmentId(appointmentId);
      console.log("Pets data from API:", petsData);
      if (!petsData || petsData.length === 0) {
        message.warning("Không tìm thấy thú cưng cho lịch hẹn này");
        setPetsList([]);
        setTotalAmount(0);
        setPaidAmount(0);
        setRemainingAmount(0);
        return;
      }

      const processedPets = petsData.map(pet => {
        let petDisplayName;
        if (typeof pet.namePet === 'string') {
          petDisplayName = pet.namePet;
        } else if (typeof pet.name === 'string') {
          petDisplayName = pet.name;
        } else {
          petDisplayName = `Thú cưng ${pet.id}`;
        }

        const petType = pet.petType || "Không xác định";
        return {
          ...pet,
          petName: petDisplayName,
          petType: petType === "DOG" ? "Chó" : petType === "CAT" ? "Mèo" : petType,
          service: pet.serviceName || "Không có dịch vụ",
        };
      });

      setPetsList(processedPets);

      const total = processedPets.reduce((sum, pet) => sum + (pet.price || 0), 0);
      setTotalAmount(total);

      const transactionsData = await BookingService.getTransactionsByAppointmentId(appointmentId);
      setTransactions(transactionsData);

      let paid = transactionsData.reduce((sum, transaction) => {
        if (transaction.type === "REFUNDED") {
          return sum - transaction.amount;
        } else if (transaction.type !== "NON_REFUNDED_DEPOSIT") {
          return sum + transaction.amount;
        }
        return sum;
      }, 0);

      if (transactionsData.length === 0) {
        paid = processedPets.reduce((sum, pet) => sum + (pet.paidAmount || 0), 0);
      }

      setPaidAmount(paid);

      const remaining = total - paid;
      setRemainingAmount(remaining);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      message.error("Không thể tải dữ liệu thanh toán: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointment && appointment.key) {
      fetchPaymentData(appointment.key);
    }
  }, [appointment]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      
      // Xác định paymentMethod dựa trên remainingAmount
      let finalPaymentMethod;
      if (remainingAmount <= 0) {
        finalPaymentMethod = "ONLINE"; // Mặc định là ONLINE khi không có chênh lệch
      } else {
        finalPaymentMethod = (paymentMethod === "MOMO" || paymentMethod === "VNPAY" || paymentMethod === "BANK_TRANSFER") ? "ONLINE" : "CASH";
      }

      const payload = {
        paymentMethod: finalPaymentMethod, // ONLINE hoặc CASH
        paymentChannel: paymentMethod === "CASH" ? null : paymentMethod, // null nếu CASH, nếu không là MOMO/VNPAY/BANK_TRANSFER
        amount: remainingAmount > 0 ? remainingAmount : 0,
      };
      
      await BookingService.completeService(appointment.key, payload);
      
      message.success("Thanh toán thành công!");
      onCancel(true);
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error("Không thể hoàn thành thanh toán: " + (error.message || "Lỗi không xác định"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Thú cưng",
      dataIndex: "petName",
      key: "petName",
      render: (_, record) => (
        <div>
          {record.petName || "Không xác định"} ({record.petType || "Không xác định"})
        </div>
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (serviceName) => serviceName || "Không có dịch vụ",
    },
    {
      title: "Nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (employeeName) => employeeName || "Chưa phân công",
    },
    {
      title: "Cân nặng",
      dataIndex: "weightRange",
      key: "weightRange",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => (price || 0).toLocaleString("vi-VN") + "đ",
    },
    {
      title: "Trạng thái thanh toán",
      key: "paymentStatus",
      render: (_, record) => {
        const paid = record.paidAmount || 0;
        const price = record.price || 0;
        return (
          <Tag color={paid >= price ? "green" : "orange"}>
            {paid >= price ? "Đã thanh toán toàn bộ" : paid === 50000 ? "Đã thanh toán cọc" : "Chưa thanh toán đủ"}
          </Tag>
        );
      },
    },
  ];

  const getStatusTag = (status) => {
    if (status === "confirmed") {
      return <Tag color="blue">Đã xác nhận</Tag>;
    } else if (status === "in_progress") {
      return <Tag color="processing">Đang sử dụng</Tag>;
    } else if (status === "completed") {
      return <Tag color="success">Đã hoàn thành</Tag>;
    } else {
      return <Tag color="error">Đã hủy</Tag>;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "Tiền cọc";
      case "PAYMENT":
        return "Phụ thu chênh lệch"; // Đổi nhãn để phù hợp với chênh lệch cân nặng
      case "ADDITIONAL_FEE":
        return "Phụ thu chênh lệch";
      case "REFUNDED":
        return "Hoàn tiền chênh lệch";
      case "NON_REFUNDED_DEPOSIT":
        return "Tiền cọc không hoàn lại";
      default:
        return type;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center text-blue-700">
          <DollarCircleOutlined className="mr-2 text-xl" />
          <span className="text-lg font-bold">Thanh toán dịch vụ Spa/Grooming</span>
        </div>
      }
      open={visible}
      onCancel={() => onCancel(false)}
      width={800}
      footer={null}
      className="payment-modal"
    >
      {appointment && (
        <div>
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <Descriptions
              bordered
              size="small"
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Mã lịch hẹn">
                #{appointment.key}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(appointment.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {appointment.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {appointment.phone}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <h3 className="font-bold text-gray-700 mb-2">Chi tiết dịch vụ</h3>
          <Table
            columns={columns}
            dataSource={petsList}
            pagination={false}
            rowKey="id"
            size="small"
            className="mb-4 border border-gray-200 rounded-lg"
            locale={{ emptyText: "Không có thú cưng" }}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} className="text-right font-bold">
                    Tổng cộng:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="text-right font-bold">
                    <span className="text-red-600">
                      {totalAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div className="mb-4">
            <h3 className="font-bold text-gray-700 mb-2">Thông tin giao dịch</h3>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Đã thanh toán">
                <span className="text-green-600">
                  {paidAmount.toLocaleString("vi-VN")}đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền còn lại">
                <span className={remainingAmount >= 0 ? "text-red-600" : "text-green-600"}>
                  {remainingAmount.toLocaleString("vi-VN")}đ
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {transactions.some(t => ["PAYMENT", "ADDITIONAL_FEE", "REFUNDED"].includes(t.type)) && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Giao dịch phát sinh</h3>
              <Table
                columns={[
                  {
                    title: "Loại giao dịch",
                    dataIndex: "type",
                    key: "type",
                    render: (type) => getTransactionTypeLabel(type),
                  },
                  {
                    title: "Số tiền",
                    dataIndex: "amount",
                    key: "amount",
                    align: "right",
                    render: (amount, record) => (
                      <span className={record.type === "REFUNDED" ? "text-green-600" : "text-red-600"}>
                        {(record.type === "REFUNDED" ? -amount : amount).toLocaleString("vi-VN")}đ
                      </span>
                    ),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => (
                      <Tag color={status === "PENDING" ? "orange" : "green"}>
                        {status === "PENDING" ? "Đang chờ" : "Hoàn thành"}
                      </Tag>
                    ),
                  },
                ]}
                dataSource={transactions.filter(t => ["PAYMENT", "ADDITIONAL_FEE", "REFUNDED"].includes(t.type))}
                pagination={false}
                rowKey="id"
                size="small"
                className="border border-gray-200 rounded-lg"
              />
            </div>
          )}

          <Divider />

          {/* Ẩn phần "Phương thức thanh toán" nếu remainingAmount = 0 */}
          {remainingAmount > 0 && (
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Phương thức thanh toán</h3>
              <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
                <Space direction="vertical">
                  <Radio value="CASH" className="payment-option">
                    <div className="flex items-center">
                      <CreditCardOutlined className="text-green-600 mr-2" />
                      <span>Tiền mặt</span>
                    </div>
                  </Radio>
                  <Radio value="BANK_TRANSFER" className="payment-option">
                    <div className="flex items-center">
                      <CreditCardOutlined className="text-blue-600 mr-2" />
                      <span>Chuyển khoản</span>
                    </div>
                  </Radio>
                  <Radio value="MOMO" className="payment-option">
                    <div className="flex items-center">
                      <CreditCardOutlined className="text-pink-600 mr-2" />
                      <span>MoMo</span>
                    </div>
                  </Radio>
                  <Radio value="VNPAY" className="payment-option">
                    <div className="flex items-center">
                      <CreditCardOutlined className="text-blue-500 mr-2" />
                      <span>VNPay</span>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => onCancel(false)}>Đóng</Button>
            <Button
              type="primary"
              className="bg-green-500 hover:bg-green-600"
              onClick={handlePaymentConfirm}
              loading={loading}
              disabled={remainingAmount < 0}
            >
              Xác nhận thanh toán
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentSpa;