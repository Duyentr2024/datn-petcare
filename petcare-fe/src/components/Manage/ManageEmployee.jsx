import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";
import EmployeeService from "../../service/adminService/EmployeeService.jsx";
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
    const [staffs, setStaffs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [employeeInput, setEmployeeInput] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        totalSpent: 0,
        isStatus: true,
        imageFile: null,
        imageUrl: "",
        userRoles: [],
        roleType: "STAFF",
        employeeType: "",
    });
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("STAFF");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const itemsPerPage = 5;

    const employeeTypes = [
        { value: "WAREHOUSE", label: "Nhân viên kho" },
        { value: "SPA", label: "Nhân viên spa" },
        { value: "VET", label: "Nhân viên thú y" },
    ];

    useEffect(() => {
        loadStaffs();
        loadEmployees();
    }, []);

    const loadStaffs = async () => {
        setLoading(true);
        try {
            const data = await EmployeeService.getAllEmployees();
            const filteredStaffs = data.filter((user) =>
                user.userRoles.some((role) => role.roleName === "STAFF")
            );
            const sortedData = filteredStaffs.sort((a, b) => {
                const dateComparison = new Date(b.registration_date) - new Date(a.registration_date);
                if (dateComparison !== 0) return dateComparison;
                return a.isStatus - b.isStatus;
            });
            setStaffs(sortedData);
            if (activeTab === "STAFF") handleSearch(sortedData);
        } catch (error) {
            console.error("Lỗi tải danh sách staff:", error);
            toast.error("Lỗi tải danh sách staff!");
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const data = await EmployeeService.getAllEmployeesFromEmployeeTable();
            const sortedData = data.sort((a, b) => (a.status === "active" ? 1 : 0) - (b.status === "active" ? 1 : 0));
            const mappedData = sortedData.map(emp => ({
                ...emp,
                isStatus: emp.status === "active",
            }));
            setEmployees(mappedData);
            if (activeTab === "EMPLOYEE") handleSearch(mappedData);
        } catch (error) {
            console.error("Lỗi tải danh sách employee:", error);
            toast.error("Lỗi tải danh sách employee!");
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

    const validateInput = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^0\d{9}$/;

        if (activeTab === "STAFF") {
            if (!employeeInput.email.trim()) return "Email không được để trống.";
            if (!emailRegex.test(employeeInput.email)) return "Email không đúng định dạng.";
            if (!editingEmployee && !employeeInput.password.trim()) return "Mật khẩu không được để trống.";
            if (!editingEmployee && employeeInput.password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
        }
        if (!employeeInput.fullName.trim()) return "Họ và tên không được để trống.";
        if (employeeInput.fullName.length < 2 || employeeInput.fullName.length > 50) return "Họ và tên phải từ 2 đến 50 ký tự.";
        if (!employeeInput.phone.trim()) return "Số điện thoại không được để trống.";
        if (!phoneRegex.test(employeeInput.phone)) return "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số.";
        if (activeTab === "EMPLOYEE" && !employeeInput.employeeType) return "Vui lòng chọn loại nhân viên.";
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
            if (activeTab === "STAFF" && employeeInput.imageFile) {
                imageUrl = await uploadImageToFirebase(employeeInput.imageFile);
            }

            const formData = activeTab === "STAFF"
                ? {
                    email: employeeInput.email,
                    password: editingEmployee ? undefined : employeeInput.password,
                    fullName: employeeInput.fullName,
                    phone: employeeInput.phone,
                    totalSpent: employeeInput.totalSpent,
                    isStatus: employeeInput.isStatus,
                    imageUrl: imageUrl,
                    userRoles: [{ roleId: 2, roleName: "STAFF" }],
                }
                : {
                    fullName: employeeInput.fullName,
                    phone: employeeInput.phone,
                    employeeType: employeeInput.employeeType,
                    status: employeeInput.isStatus ? "active" : "inactive",
                };

            if (editingEmployee) {
                if (activeTab === "STAFF") {
                    await EmployeeService.updateEmployee(editingEmployee.userId, formData);
                } else {
                    await EmployeeService.updateEmployeeInEmployeeTable(editingEmployee.employeeId, formData);
                }
                toast.success("Cập nhật nhân viên thành công!");
            } else {
                if (activeTab === "STAFF") {
                    await EmployeeService.createEmployee(formData);
                } else {
                    await EmployeeService.createEmployeeInEmployeeTable(formData);
                }
                toast.success("Thêm nhân viên thành công!");
            }

            resetForm();
            setIsFormOpen(false);
            activeTab === "STAFF" ? loadStaffs() : loadEmployees();
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
            totalSpent: 0,
            isStatus: true,
            imageFile: null,
            imageUrl: "",
            userRoles: [],
            roleType: activeTab,
            employeeType: "",
        });
        setPreviewImage(null);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        if (activeTab === "STAFF") {
            setEmployeeInput({
                ...employee,
                password: "",
                imageFile: null,
                isStatus: employee.isStatus !== undefined ? employee.isStatus : true,
                userRoles: employee.userRoles || [],
                roleType: "STAFF",
                employeeType: "",
            });
            setPreviewImage(employee.imageUrl || null);
        } else {
            setEmployeeInput({
                ...employee,
                email: "",
                password: "",
                totalSpent: 0,
                imageFile: null,
                imageUrl: "",
                userRoles: [],
                roleType: "EMPLOYEE",
                employeeType: employee.employeeType || "",
                isStatus: employee.status === "active",
            });
            setPreviewImage(null);
        }
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        const employee = activeTab === "STAFF" ? staffs.find(emp => emp.userId === id) : employees.find(emp => emp.employeeId === id);
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        setLoading(true);
        try {
            if (activeTab === "STAFF") {
                await EmployeeService.updateEmployeeStatus(employeeToDelete.userId, false);
            } else {
                await EmployeeService.updateEmployeeInEmployeeTable(employeeToDelete.employeeId, {
                    ...employeeToDelete,
                    status: "inactive"
                });
            }
            toast.success("Xóa nhân viên thành công!");
            activeTab === "STAFF" ? loadStaffs() : loadEmployees();
        } catch (error) {
            console.error("Lỗi khi xóa nhân viên:", error);
            toast.error("Lỗi khi xóa nhân viên: " + error.message);
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleSearch = (data = activeTab === "STAFF" ? staffs : employees) => {
        const query = searchQuery.toLowerCase();
        const filtered = data.filter((employee) =>
            activeTab === "STAFF"
                ? (employee.fullName.toLowerCase().includes(query) ||
                    employee.phone.includes(query) ||
                    (employee.email && employee.email.toLowerCase().includes(query)))
                : (employee.fullName.toLowerCase().includes(query) ||
                    employee.phone.includes(query))
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => setCurrentPage(page);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex">
            <div className="flex-1 p-6 bg-white rounded-lg shadow-md relative max-w-7xl mx-auto h-[664px]">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Danh sách nhân viên</h2>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={`flex-1 py-2 text-center font-medium ${activeTab === "STAFF" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"} transition-colors`}
                        onClick={() => {
                            setActiveTab("STAFF");
                            handleSearch(staffs);
                            resetForm();
                        }}
                    >
                        Quản lý Staff
                    </button>
                    <button
                        className={`flex-1 py-2 text-center font-medium ${activeTab === "EMPLOYEE" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"} transition-colors`}
                        onClick={() => {
                            setActiveTab("EMPLOYEE");
                            handleSearch(employees);
                            resetForm();
                        }}
                    >
                        Quản lý Employee
                    </button>
                </div>

                {/* Search and Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bằng tên, số điện thoại hoặc email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch();
                        }}
                        autoComplete="off"
                        className="p-3 border rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                    />
                    <button
                        onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }}
                        className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
                    >
                        Thêm nhân viên
                    </button>
                </div>

                {/* Sliding Form */}
                <div
                    className={`absolute top-0 left-0 h-full w-[1260px] bg-white shadow-2xl transform transition-transform duration-300 z-50 p-8 overflow-y-auto ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                        {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                    </h3>
                    {errorMessage && (
                        <div className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded">{errorMessage}</div>
                    )}

                    {/* Form Container */}
                    <div className="space-y-6">
                        {activeTab === "STAFF" ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={employeeInput.email}
                                            onChange={(e) => setEmployeeInput({ ...employeeInput, email: e.target.value })}
                                            disabled={editingEmployee}
                                            autoComplete="off"
                                            className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors disabled:bg-gray-100"
                                        />
                                    </div>
                                    {!editingEmployee && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                            <input
                                                type="password"
                                                value={employeeInput.password}
                                                onChange={(e) => setEmployeeInput({ ...employeeInput, password: e.target.value })}
                                                autoComplete="new-password"
                                                className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                        <input
                                            type="text"
                                            value={employeeInput.fullName}
                                            onChange={(e) => setEmployeeInput({ ...employeeInput, fullName: e.target.value })}
                                            autoComplete="off"
                                            className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={employeeInput.phone}
                                            onChange={(e) => setEmployeeInput({ ...employeeInput, phone: e.target.value })}
                                            autoComplete="off"
                                            className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="p-2 border rounded w-full"
                                        />
                                        {(previewImage || employeeInput.imageUrl) && (
                                            <img
                                                src={previewImage || employeeInput.imageUrl}
                                                alt="Preview"
                                                className="h-16 w-16 rounded-full border-2 border-gray-300 object-cover shadow-sm"
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={employeeInput.fullName}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, fullName: e.target.value })}
                                        autoComplete="off"
                                        className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={employeeInput.phone}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, phone: e.target.value })}
                                        autoComplete="off"
                                        className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                                    <select
                                        value={employeeInput.employeeType}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, employeeType: e.target.value })}
                                        className="p-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                    >
                                        <option value="">Chọn loại nhân viên</option>
                                        {employeeTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        {editingEmployee && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={employeeInput.isStatus}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, isStatus: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Hoạt động
                                </label>
                            </div>
                        )}
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSaveEmployee}
                                className="bg-blue-600 text-white p-3 rounded w-full hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium"
                            >
                                {editingEmployee ? "Cập nhật" : "Thêm mới"}
                            </button>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="bg-gray-500 text-white p-3 rounded w-full hover:bg-gray-600 active:bg-gray-700 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>

                {/* Employee List Table */}
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full max-w-5xl mx-auto border-collapse bg-white shadow-lg rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-blue-600 text-white text-sm font-semibold uppercase tracking-wider">
                            {activeTab === "STAFF" ? (
                                <>
                                    <th className="py-3 px-4 border-b">Hình ảnh</th>
                                    <th className="py-3 px-4 border-b">Họ và Tên</th>
                                    <th className="py-3 px-4 border-b">Email</th>
                                    <th className="py-3 px-4 border-b">Số điện thoại</th>
                                    <th className="py-3 px-4 border-b">Chức vụ</th>
                                    <th className="py-3 px-4 border-b">Trạng thái</th>
                                    <th className="py-3 px-4 border-b">Hành động</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-4 border-b">Họ và Tên</th>
                                    <th className="py-3 px-4 border-b">Số điện thoại</th>
                                    <th className="py-3 px-4 border-b">Chức vụ</th>
                                    <th className="py-3 px-4 border-b">Trạng thái</th>
                                    <th className="py-3 px-4 border-b">Hành động</th>
                                </>
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedData.map((employee) => (
                            <tr
                                key={activeTab === "STAFF" ? employee.userId : employee.employeeId}
                                className="hover:bg-gray-100 transition-colors text-gray-700 text-sm border-b border-gray-200"
                            >
                                {activeTab === "STAFF" ? (
                                    <>
                                        <td className="py-3 px-4 border-b">
                                            <img
                                                src={employee.imageUrl || "default-avatar.png"}
                                                alt="avatar"
                                                className="h-10 w-10 rounded-full mx-auto object-cover shadow-sm"
                                            />
                                        </td>
                                        <td className="py-3 px-4 border-b">{employee.fullName}</td>
                                        <td className="py-3 px-4 border-b">{employee.email}</td>
                                        <td className="py-3 px-4 border-b">{employee.phone}</td>
                                        <td className="py-3 px-4 border-b">
                                            {employee.userRoles.map((role) => role.roleName).join(", ")}
                                        </td>
                                        <td
                                            className={`py-3 px-4 border-b font-medium ${employee.isStatus ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {employee.isStatus ? "Hoạt động" : "Ngưng hoạt động"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.userId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <FiTrash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3 px-4 border-b">{employee.fullName}</td>
                                        <td className="py-3 px-4 border-b">{employee.phone}</td>
                                        <td className="py-3 px-4 border-b">{employee.employeeType}</td>
                                        <td
                                            className={`py-3 px-4 border-b font-medium ${employee.isStatus ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {employee.isStatus ? "Hoạt động" : "Ngưng hoạt động"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <FiEdit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.employeeId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <FiTrash size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center mt-4 gap-2">
                        {Array.from(
                            { length: Math.ceil(filteredData.length / itemsPerPage) },
                            (_, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} transition-colors`}
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96 transform transition-all duration-300 scale-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                Xác nhận xóa nhân viên
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Bạn có chắc chắn muốn xóa nhân viên{" "}
                                <span className="font-medium">{employeeToDelete?.fullName}</span> không?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setEmployeeToDelete(null);
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-gray-200 bg-opacity-50 z-50">
                        <ReactLoading type="spin" color="#3B82F6" height={64} width={64} />
                    </div>
                )}

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    toastClassName="bg-white text-gray-800 shadow-lg rounded-lg"
                    progressClassName="bg-blue-500"
                />
            </div>
        </div>
    );
};

export default ManageEmployee;