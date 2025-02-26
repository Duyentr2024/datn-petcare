import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import EmployeeService from "../../service/manageService/EmployeeService";
import {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "../../firebaseConfig";
import ReactLoading from "react-loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeInput, setEmployeeInput] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    registration_date: "",
    totalSpent: 0,
    isStatus: true,
    imageFile: null,
    imageUrl: "",
    userRoles: [],
  });
  const [roles, setRoles] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await EmployeeService.getAllEmployees();
      const sortedData = data.sort((a, b) => {
        const dateComparison = new Date(b.registration_date) - new Date(a.registration_date);
        if (dateComparison !== 0) {
          return dateComparison;
        }
        return a.isStatus - b.isStatus;
      });
      setEmployees(sortedData);
      handleSearch(sortedData);
    } catch (error) {
      console.error("Lỗi tải danh sách nhân viên:", error);
      toast.error("Lỗi tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 1MB!");
        return;
      }
      setEmployeeInput({ ...employeeInput, imageFile: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadImageToFirebase = async (file) => {
    if (!file) return "";
    const storageRef = ref(storage, `employees/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(new Error("Không thể tải ảnh lên Firebase: " + error.message)),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // Hàm validate input
  const validateInput = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\d{9}$/;

    if (!employeeInput.email.trim()) {
      return "Email không được để trống.";
    }
    if (!emailRegex.test(employeeInput.email)) {
      return "Email không đúng định dạng.";
    }

    if (!editingEmployee && !employeeInput.password.trim()) {
      return "Mật khẩu không được để trống.";
    }
    if (!editingEmployee && employeeInput.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!employeeInput.fullName.trim()) {
      return "Họ và tên không được để trống.";
    }
   
    if (employeeInput.fullName.length < 2 || employeeInput.fullName.length > 50) {
      return "Họ và tên phải từ 2 đến 50 ký tự.";
    }

    if (!employeeInput.phone.trim()) {
      return "Số điện thoại không được để trống.";
    }
    if (!phoneRegex.test(employeeInput.phone)) {
      return "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số.";
    }

    if (employeeInput.registration_date) {
      const selectedDate = new Date(employeeInput.registration_date);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        return "Ngày đăng ký không được vượt quá ngày hiện tại.";
      }
    }

    return "";
  };

  const handleSaveEmployee = async () => {
    setErrorMessage("");
    const validationError = validateInput();
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      let imageUrl = employeeInput.imageUrl;
      if (employeeInput.imageFile) {
        imageUrl = await uploadImageToFirebase(employeeInput.imageFile);
      }

      const formData = {
        email: employeeInput.email,
        password: editingEmployee ? undefined : employeeInput.password,
        fullName: employeeInput.fullName,
        phone: employeeInput.phone,
        registration_date:
          employeeInput.registration_date || new Date().toISOString().split("T")[0],
        totalSpent: employeeInput.totalSpent,
        isStatus: employeeInput.isStatus,
        imageUrl,
        userRoles:
          employeeInput.userRoles.length > 0
            ? employeeInput.userRoles
            : [{ roleId: 2, roleName: "STAFF" }],
      };

      if (editingEmployee) {
        await EmployeeService.updateEmployee(editingEmployee.userId, formData);
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        await EmployeeService.createEmployee(formData);
        toast.success("Thêm nhân viên thành công!");
      }

      resetForm(); // Clear form sau khi thêm/cập nhật thành công
      loadEmployees();
    } catch (error) {
      setErrorMessage(error.message);
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setEmployeeInput({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      registration_date: "",
      totalSpent: 0,
      isStatus: true,
      imageFile: null,
      imageUrl: "",
      userRoles: [],
    });
    setPreviewImage(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setEmployeeInput({
      ...employee,
      password: "",
      imageFile: null,
      registration_date: employee.registration_date,
      isStatus: employee.isStatus !== undefined ? employee.isStatus : true,
      userRoles: employee.userRoles || [],
    });
    setPreviewImage(employee.imageUrl);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      setLoading(true);
      try {
        const employee = employees.find((emp) => emp.userId === id);
        await EmployeeService.updateEmployee(id, {
          ...employee,
          isStatus: false,
        });
        toast.success("Xóa nhân viên thành công!");
        loadEmployees();
      } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        toast.error("Lỗi khi xóa nhân viên!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = (data = employees) => {
    const query = searchQuery.toLowerCase();
    const filtered = data.filter(
      (employee) =>
        employee.fullName.toLowerCase().includes(query) ||
        employee.phone.includes(query) ||
        employee.email.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-md relative">
      <h2 className="text-2xl font-semibold mb-4">Quản lý nhân viên</h2>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      {/* Form nhập liệu */}
      <div className="mb-6 p-4 border rounded">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Email"
              value={employeeInput.email}
              onChange={(e) =>
                setEmployeeInput({ ...employeeInput, email: e.target.value })
              }
              disabled={editingEmployee}
              autoComplete="off" // Tắt tự động điền
              className="p-2 border rounded w-full"
            />
          </div>
          {!editingEmployee && (
            <div className="flex items-center">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={employeeInput.password}
                onChange={(e) =>
                  setEmployeeInput({
                    ...employeeInput,
                    password: e.target.value,
                  })
                }
                autoComplete="new-password" // Ngăn tự động điền mật khẩu
                className="p-2 border rounded w-full"
              />
            </div>
          )}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Họ và tên"
              value={employeeInput.fullName}
              onChange={(e) =>
                setEmployeeInput({ ...employeeInput, fullName: e.target.value })
              }
              autoComplete="off" // Tắt tự động điền
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Số điện thoại"
              value={employeeInput.phone}
              onChange={(e) =>
                setEmployeeInput({ ...employeeInput, phone: e.target.value })
              }
              autoComplete="off" // Tắt tự động điền
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="date"
              value={employeeInput.registration_date}
              onChange={(e) =>
                setEmployeeInput({
                  ...employeeInput,
                  registration_date: e.target.value,
                })
              }
              disabled={editingEmployee}
              autoComplete="off" // Tắt tự động điền
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="file"
              onChange={handleFileChange}
              className="p-2 border rounded w-full"
            />
          </div>
          <div className="flex items-center justify-center">
            {(previewImage || employeeInput.imageUrl) && (
              <img
                src={previewImage || employeeInput.imageUrl}
                alt="Preview"
                className="h-16 w-16 rounded-full border-2 border-gray-300"
              />
            )}
          </div>
          {editingEmployee && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={employeeInput.isStatus}
                onChange={(e) =>
                  setEmployeeInput({
                    ...employeeInput,
                    isStatus: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Hoạt động
            </label>
          )}
        </div>
        <button
          onClick={handleSaveEmployee}
          className="mt-4 bg-blue-500 text-white p-2 rounded"
        >
          {editingEmployee ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>

      {/* Bảng danh sách nhân viên */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Danh sách nhân viên</h3>
        <input
          type="text"
          placeholder="Tìm kiếm bằng tên, số điện thoại hoặc email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch();
          }}
          autoComplete="off" // Tắt tự động điền cho tìm kiếm
          className="p-2 border rounded w-full mb-4"
        />
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Hình ảnh</th>
              <th className="border p-2">Họ và Tên</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Số điện thoại</th>
              <th className="border p-2">Chức vụ</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((employee) => (
              <tr key={employee.userId} className="text-center">
                <td className="border p-2">
                  <img
                    src={employee.imageUrl}
                    alt="avatar"
                    className="h-12 w-12 rounded-full mx-auto"
                  />
                </td>
                <td className="border p-2">{employee.fullName}</td>
                <td className="border p-2">{employee.email}</td>
                <td className="border p-2">{employee.phone}</td>
                <td className="border p-2">
                  {employee.userRoles && employee.userRoles.length > 0
                    ? employee.userRoles
                        .map((role) => role.roleName)
                        .join(", ")
                    : "Không có"}
                </td>
                <td
                  className={`border p-2 ${
                    employee.isStatus ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {employee.isStatus === true || employee.isStatus === 1
                    ? "Hoạt động"
                    : "Ngưng hoạt động"}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-500"
                  >
                    <FiEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.userId)}
                    className="text-red-500"
                  >
                    <FiTrash size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-4">
          {Array.from(
            { length: Math.ceil(filteredEmployees.length / itemsPerPage) },
            (_, index) => (
              <button
                key={index}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-200 bg-opacity-50 z-50">
          <ReactLoading type="spin" color="#F59E0B" height={64} width={64} />
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default ManageEmployee;