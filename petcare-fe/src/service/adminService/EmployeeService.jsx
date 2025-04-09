const BASE_URL = "http://localhost:8080/api";

const EmployeeService = {
    // API cho bảng user (Staff)
    getAllEmployees: async () => {
        try {
            const response = await fetch(`${BASE_URL}/users`);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi tải danh sách staff: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    createEmployee: async (data) => {
        try {
            console.log("Dữ liệu gửi đi (createEmployee):", JSON.stringify(data));
            const response = await fetch(`${BASE_URL}/users/create-staff`, { // Fixed endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi thêm staff: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateEmployee: async (id, data) => {
        try {
            console.log("Dữ liệu gửi đi (updateEmployee):", JSON.stringify(data));
            const response = await fetch(`${BASE_URL}/users/update-staff/${id}`, { // Fixed endpoint
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi cập nhật staff: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    // Thêm phương thức để cập nhật trạng thái (dùng cho xóa Staff)
    updateEmployeeStatus: async (id, status) => {
        try {
            console.log("Cập nhật trạng thái Staff:", { id, status });
            const response = await fetch(`${BASE_URL}/users/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(status), // Gửi trực tiếp boolean
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi cập nhật trạng thái staff: ${response.status} - ${errorData}`);
            }
            return response.ok; // Không cần JSON nếu API trả về 200 OK mà không có body
        } catch (error) {
            throw error;
        }
    },

    // API cho bảng employees (Employee)
    getAllEmployeesFromEmployeeTable: async () => {
        try {
            const response = await fetch(`${BASE_URL}/employees`);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi tải danh sách employee: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    createEmployeeInEmployeeTable: async (data) => {
        try {
            console.log("Dữ liệu gửi đi (createEmployeeInEmployeeTable):", JSON.stringify(data));
            const response = await fetch(`${BASE_URL}/employees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi thêm employee: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },

    updateEmployeeInEmployeeTable: async (id, data) => {
        try {
            console.log("Dữ liệu gửi đi (updateEmployeeInEmployeeTable):", JSON.stringify(data));
            const response = await fetch(`${BASE_URL}/employees/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Lỗi khi cập nhật employee: ${response.status} - ${errorData}`);
            }
            return response.json();
        } catch (error) {
            throw error;
        }
    },
};

export default EmployeeService;