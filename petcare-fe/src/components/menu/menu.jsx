import React, { useState, useEffect, useRef } from "react";
import { TbCategoryFilled } from "react-icons/tb";

const Menu = () => {
    const [showMenu, setShowMenu] = useState(false); // Trạng thái của menu
    const menuRef = useRef(null); // Tham chiếu đến menu
    const iconRef = useRef(null); // Tham chiếu đến icon

    // Hàm mở/đóng menu
    const toggleMenu = () => {
        setShowMenu((prev) => !prev); // Thay đổi trạng thái showMenu
    };

    // Xử lý khi click ra ngoài menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Kiểm tra nếu click không phải trên menu và icon
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                iconRef.current && !iconRef.current.contains(event.target)
            ) {
                setShowMenu(false); // Đóng menu nếu click ngoài
            }
        };

        // Gắn sự kiện click khi mount component
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup event listener khi component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full md:w-1/12 text-white flex flex-col items-center justify-center relative">
            <div className="relative">
                <div className="flex items-center mb-4">
                    {/* Icon luôn hiển thị và có thể mở/đóng menu khi click vào */}
                    <div
                        ref={iconRef}
                        className="bg-yellow-500 rounded-full p-2 cursor-pointer fixed z-50" // Đảm bảo icon có z-index cao hơn menu
                        onClick={toggleMenu} // Mở/đóng menu khi click vào icon
                    >
                        <TbCategoryFilled size={30} />
                    </div>
                </div>

                {/* Menu dropdown */}
                {showMenu && (
                    <div
                        ref={menuRef}
                        className="fixed z-40 w-[180px] left-0 top-[160px] mt-2 mx-2 bg-white shadow-lg rounded-lg border-2 space-y-4 transition-all duration-300"
                        style={{
                            transform: showMenu ? "translateX(0)" : "translateX(-100%)",
                            transition: "transform 0.3s ease-in-out", // Smooth transition
                        }}
                    >
                        <ul>
                            <li className="text-gray-800 font-medium mx-2">Mật ong</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium mx-2">Mật ong nhập khẩu</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium mx-2">Sáp ong</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium mx-2">Sữa ong chúa</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium mx-2">Tinh bột nghệ</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium mx-2">Phấn hoa</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
