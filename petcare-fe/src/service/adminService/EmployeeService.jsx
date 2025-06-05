import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const BASE_URL = API_BASE_URL;

const EmployeeService = {
    // API cho bảng user (Staff)
    getAllEmployees: async () => {
        try {
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/users`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/users/create-staff`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/users/update-staff/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/users/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/employees`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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
            const token = Cookies.get("accessToken"); // Lấy token từ cookie
            const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
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