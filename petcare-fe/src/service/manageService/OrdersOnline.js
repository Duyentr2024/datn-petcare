import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/orders";

// Lấy tất cả đơn hàng ORDER ONLINE với statusId = 4
export const getAllOrdersOnline = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/completed-online`);
        return response.data.map(order => ({
            orderId: order.orderId,
            orderDate: order.orderDate,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress,
            shippingCost: order.shippingCost,
            totalAmount: order.totalAmount,
            type: order.type,
            userId: order.userId,
            userName: order.userName,
            phone: order.phone,
            statusId: order.statusId,
            statusName: order.statusName,
            voucherId: order.voucherId,
            orderDetails: order.orderDetails.map(detail => ({
                orderDetailId: detail.orderDetailId,
                quantity: detail.quantity,
                price: detail.price,
                imageUrl: detail.imageUrl,
                colorValue: detail.colorValue,
                sizeValue: detail.sizeValue,
                weightValue: detail.weightValue,
                productDetailId: detail.productDetailId,
                productName: detail.productName
            }))
        }));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn online:", error);
        throw error;
    }
};

// Lấy đơn hàng ORDER ONLINE theo khoảng thời gian với statusId = 4
export const getOrdersByDateRange = async (startDate, endDate) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/online-by-date-range`, {
            params: {
                startDate: startDate,
                endDate: endDate
            }
        });
        return response.data.map(order => ({
            orderId: order.orderId,
            orderDate: order.orderDate,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress,
            shippingCost: order.shippingCost,
            totalAmount: order.totalAmount,
            type: order.type,
            userId: order.userId,
            userName: order.userName,
            phone: order.phone,
            statusId: order.statusId,
            statusName: order.statusName,
            voucherId: order.voucherId,
            orderDetails: order.orderDetails.map(detail => ({
                orderDetailId: detail.orderDetailId,
                quantity: detail.quantity,
                price: detail.price,
                imageUrl: detail.imageUrl,
                colorValue: detail.colorValue,
                sizeValue: detail.sizeValue,
                weightValue: detail.weightValue,
                productDetailId: detail.productDetailId,
                productName: detail.productName
            }))
        }));
    } catch (error) {
        console.error("Lỗi khi lấy hóa đơn theo khoảng thời gian:", error);
        throw error;
    }
};