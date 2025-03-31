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
            handleSearch([...sortedData, ...employees]);
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
            handleSearch([...staffs, ...mappedData]);
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

        if (employeeInput.roleType === "STAFF") {
            if (!employeeInput.email?.trim()) return "Email không được để trống.";
            if (!emailRegex.test(employeeInput.email || "")) return "Email không đúng định dạng.";
            if (!editingEmployee && !employeeInput.password?.trim()) return "Mật khẩu không được để trống.";
            if (!editingEmployee && (employeeInput.password?.length || 0) < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
        }
        if (!employeeInput.fullName?.trim()) return "Họ và tên không được để trống.";
        if ((employeeInput.fullName?.length || 0) < 2 || (employeeInput.fullName?.length || 0) > 50) return "Họ và tên phải từ 2 đến 50 ký tự.";
        if (!employeeInput.phone?.trim()) return "Số điện thoại không được để trống.";
        const phoneValue = String(employeeInput.phone || "").trim();
        if (!phoneRegex.test(phoneValue)) return "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số.";
        if (employeeInput.roleType === "EMPLOYEE" && !employeeInput.employeeType) return "Vui lòng chọn chức vụ.";
        return "";
    };

    const handleSaveEmployee = async () => {
        setErrorMessage("");
        const validationError = validateInput();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }
    
        // Check for duplicate phone number
        const isDuplicatePhone = checkDuplicatePhone();
        if (isDuplicatePhone) {
            setErrorMessage("Số điện thoại này đã được sử dụng. Vui lòng chọn số khác.");
            return;
        }
    
        setLoading(true);
        try {
            let imageUrl = employeeInput.imageUrl;
            if (employeeInput.roleType === "STAFF" && employeeInput.imageFile) {
                imageUrl = await uploadImageToFirebase(employeeInput.imageFile);
            }
    
            const formData = employeeInput.roleType === "STAFF"
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
    
            let response;
            if (editingEmployee) {
                if (employeeInput.roleType === "STAFF") {
                    response = await EmployeeService.updateEmployee(editingEmployee.userId, formData);
                } else {
                    response = await EmployeeService.updateEmployeeInEmployeeTable(editingEmployee.employeeId, formData);
                }
                toast.success("Cập nhật nhân viên thành công!");
            } else {
                if (employeeInput.roleType === "STAFF") {
                    response = await EmployeeService.createEmployee(formData);
                } else {
                    response = await EmployeeService.createEmployeeInEmployeeTable(formData);
                }
                toast.success("Thêm nhân viên thành công!");
            }
    
            resetForm();
            setIsFormOpen(false);
            employeeInput.roleType === "STAFF" ? loadStaffs() : loadEmployees();
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message || "Đã xảy ra lỗi!";
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const checkDuplicatePhone = () => {
        if (!employeeInput.phone) return false;
        
        const phoneToCheck = employeeInput.phone.trim();
        const currentData = employeeInput.roleType === "STAFF" ? staffs : employees;
        
        // When editing, we should exclude the current employee from the duplicate check
        return currentData.some(item => {
            // Skip the current user being edited
            if (editingEmployee) {
                if (employeeInput.roleType === "STAFF" && item.userId === editingEmployee.userId) {
                    return false;
                }
                if (employeeInput.roleType === "EMPLOYEE" && item.employeeId === editingEmployee.employeeId) {
                    return false;
                }
            }
            
            // Check if phone numbers match
            return item.phone && item.phone.trim() === phoneToCheck;
        });
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
            roleType: "STAFF",
            employeeType: "",
        });
        setPreviewImage(null);
        setErrorMessage("");
    };

    const handleEdit = (employee) => {
        setErrorMessage("");
        setEditingEmployee(employee);
        
        const isStaff = !!employee.userId;
        
        if (isStaff) {
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
        const isStaff = id && paginatedData.find(emp => emp.userId === id);
        const employee = isStaff ? staffs.find(emp => emp.userId === id) : employees.find(emp => emp.employeeId === id);
        setEmployeeToDelete(employee);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        const isStaff = !!employeeToDelete.userId;
        
        setLoading(true);
        try {
            if (isStaff) {
                await EmployeeService.updateEmployeeStatus(employeeToDelete.userId, false);
            } else {
                await EmployeeService.updateEmployeeInEmployeeTable(employeeToDelete.employeeId, {
                    ...employeeToDelete,
                    status: "inactive"
                });
            }
            toast.success("Xóa nhân viên thành công!");
            isStaff ? loadStaffs() : loadEmployees();
        } catch (error) {
            console.error("Lỗi khi xóa nhân viên:", error);
            toast.error("Lỗi khi xóa nhân viên: " + error.message);
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    const handleSearch = (data = [...staffs, ...employees]) => {
        const query = searchQuery.toLowerCase().trim();
        
        if (!query) {
            setFilteredData(data);
            return;
        }
        
        const filtered = data.filter((employee) =>
            employee.fullName?.toLowerCase().includes(query) ||
            employee.phone?.includes(query) ||
            (employee.email && employee.email.toLowerCase().includes(query)) ||
            (employee.employeeType && employee.employeeType.toLowerCase().includes(query))
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    useEffect(() => {
        handleSearch([...staffs, ...employees]);
    }, [searchQuery, staffs, employees]);

    const handlePageChange = (page) => setCurrentPage(page);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="flex">
            <div className="flex-1 p-8 bg-white rounded-lg shadow-md relative max-w-7xl mx-auto h-[664px]">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
                    <i className="fas fa-users mr-3 text-[#f0b040]"></i>
                    Danh sách nhân viên
                </h2>
    
                {/* Search and Add Button */}
                <div className="flex justify-between items-center mb-6 space-x-3">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bằng tên, số điện thoại, email hoặc chức vụ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors"
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }}
                        className="whitespace-nowrap bg-[#f0b040] text-white px-4 py-3 rounded-md hover:bg-[#e0a030] transition-colors font-medium flex items-center flex-shrink-0"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Thêm nhân viên
                    </button>
                </div>
    
                {/* Sliding Form */}
                <div
                    className={`absolute top-0 left-0 h-full w-[1260px] bg-white shadow-xl transform transition-transform duration-300 z-50 p-6 overflow-y-auto ${
                        isFormOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-700">
                            {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
                        </h3>
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
    
                    {errorMessage && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                            {errorMessage}
                        </div>
                    )}
    
                    {/* Form Container */}
                    <div className="space-y-5">
                        {!editingEmployee && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại nhân viên</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="STAFF"
                                            checked={employeeInput.roleType === "STAFF"}
                                            onChange={(e) => setEmployeeInput({ ...employeeInput, roleType: e.target.value })}
                                            className="w-4 h-4 text-[#f0b040] focus:ring-[#f0b040]"
                                        />
                                        <span className="ml-2 text-gray-700">Nhân viên hệ thống</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="EMPLOYEE"
                                            checked={employeeInput.roleType === "EMPLOYEE"}
                                            onChange={(e) => setEmployeeInput({ ...employeeInput, roleType: e.target.value })}
                                            className="w-4 h-4 text-[#f0b040] focus:ring-[#f0b040]"
                                        />
                                        <span className="ml-2 text-gray-700">Nhân viên dịch vụ</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {employeeInput.roleType === "STAFF" && (
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={employeeInput.email}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, email: e.target.value })}
                                        disabled={editingEmployee}
                                        autoComplete="off"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors disabled:bg-gray-50"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={employeeInput.fullName}
                                    onChange={(e) => setEmployeeInput({ ...employeeInput, fullName: e.target.value })}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    value={employeeInput.phone}
                                    onChange={(e) => setEmployeeInput({ ...employeeInput, phone: e.target.value })}
                                    autoComplete="off"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors"
                                />
                            </div>
                        </div>

                        {employeeInput.roleType === "STAFF" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    {(previewImage || employeeInput.imageUrl) && (
                                        <div className="relative">
                                            <img
                                                src={previewImage || employeeInput.imageUrl}
                                                alt="Preview"
                                                className="h-16 w-16 rounded-full border border-gray-300 object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {employeeInput.roleType === "EMPLOYEE" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                                <select
                                    value={employeeInput.employeeType}
                                    onChange={(e) => setEmployeeInput({ ...employeeInput, employeeType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f0b040] transition-colors"
                                >
                                    <option value="">Chọn loại nhân viên</option>
                                    {employeeTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {editingEmployee && (
                            <div className="flex items-center space-x-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={employeeInput.isStatus}
                                        onChange={(e) => setEmployeeInput({ ...employeeInput, isStatus: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#fff2d9] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f0b040]"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Hoạt động</span>
                                </label>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleSaveEmployee}
                                className="flex-1 px-5 py-2 bg-[#f0b040] text-white rounded-md font-medium transition-colors hover:bg-[#e0a030]"
                            >
                                {editingEmployee ? "Cập nhật" : "Thêm mới"}
                            </button>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 px-5 py-2 bg-red-500 text-white rounded-md font-medium transition-colors hover:bg-red-600"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
    
                {/* Employee List Table */}
                <div className="mt-4 overflow-auto max-h-[500px] relative border border-gray-200 rounded-md">
                    <table className="w-full border-collapse bg-white overflow-hidden">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#f0b040] text-white text-sm font-medium">
                                <th className="py-3 px-5 border-b text-center">Hình ảnh</th>
                                <th className="py-3 px-5 border-b">Họ và Tên</th>
                                <th className="py-3 px-5 border-b">Email</th>
                                <th className="py-3 px-5 border-b">Số điện thoại</th>
                                <th className="py-3 px-5 border-b">Chức vụ</th>
                                <th className="py-3 px-5 border-b text-center">Trạng thái</th>
                                <th className="py-3 px-5 border-b text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((employee) => (
                                    <tr
                                        key={employee.userId || employee.employeeId}
                                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                    >
                                        <td className="py-3 px-5 text-center">
                                            {employee.userId ? (
                                                <div className="flex justify-center">
                                                    <img
                                                        src={employee.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                                                        alt="avatar"
                                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <span className="text-gray-400">-</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-5 font-medium text-gray-700">{employee.fullName || "-"}</td>
                                        <td className="py-3 px-5 text-gray-600">{employee.userId ? (employee.email || "-") : "-"}</td>
                                        <td className="py-3 px-5 text-gray-600">{employee.phone || "-"}</td>
                                        <td className="py-3 px-5">
                                            <span className="px-2 py-1 bg-[#fdf5e6] text-[#e0a030] rounded-full text-xs">
                                                {employee.userRoles && employee.userRoles.length > 0 
                                                    ? employee.userRoles.map((role) => role.roleName).join(", ")
                                                    : employee.employeeType || "-"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                employee.isStatus 
                                                ? "bg-green-100 text-green-700" 
                                                : "bg-red-100 text-red-700"
                                            }`}>
                                                {employee.isStatus ? "Hoạt động" : "Ngưng hoạt động"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-5">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="text-[#f0b040] hover:text-[#e0a030] transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee.userId || employee.employeeId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td 
                                        colSpan={7}
                                        className="py-6 text-center text-gray-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fas fa-search text-2xl mb-2 text-gray-300"></i>
                                            <p>Không tìm thấy nhân viên nào phù hợp với từ khóa tìm kiếm</p>
                                            {searchQuery && (
                                                <button 
                                                    onClick={() => setSearchQuery("")}
                                                    className="mt-2 text-[#f0b040] hover:underline"
                                                >
                                                    Xóa bộ lọc
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
    
                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-96">
                            <h3 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
                                <i className="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
                                Xác nhận xóa nhân viên
                            </h3>
                            <p className="mb-5 text-gray-600">
                                Bạn có chắc chắn muốn xóa nhân viên{" "}
                                <span className="font-medium text-gray-700">{employeeToDelete?.fullName}</span> không?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setEmployeeToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
    
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
                        <ReactLoading type="spin" color="#f0b040" height={50} width={50} />
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
                    toastClassName="bg-white text-gray-800 shadow-md rounded-md"
                    progressClassName="bg-[#f0b040]"
                />
            </div>
        </div>
    );
};

export default ManageEmployee;