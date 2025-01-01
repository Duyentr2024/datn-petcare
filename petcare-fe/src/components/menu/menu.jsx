import React, { useState, useEffect, useRef } from "react";
import { TbCategoryFilled } from "react-icons/tb";

const Menu = () => {
    const [showMenu, setShowMenu] = useState(false); // Hiển thị menu
    const menuRef = useRef(null); // Reference for the menu container
    const iconRef = useRef(null); // Reference for the icon

    const toggleMenu = () => {
        setShowMenu((prev) => !prev); // Hiển thị/ẩn menu
    };

    // Close the menu if clicking outside of the menu or icon
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                iconRef.current && !iconRef.current.contains(event.target)
            ) {
                setShowMenu(false); // Close the menu if clicked outside
            }
        };

        // Add event listener for clicks outside
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full md:w-1/12 text-white flex flex-col items-center justify-center p-4 relative">
            <div className="relative">
                <div className="flex items-center mb-4">
                    {/* Icon (hidden when menu is shown) */}
                    {!showMenu && (
                        <div
                            ref={iconRef}
                            className="bg-yellow-500 rounded-full p-2 cursor-pointer"
                            onClick={toggleMenu}
                        >
                            <TbCategoryFilled size={30} /> {/* Adjust size here */}
                        </div>
                    )}
                </div>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div
                        ref={menuRef}
                        className="absolute left-0 top-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-4 space-y-4 transition-all duration-300 transform z-10"
                        style={{
                            transform: showMenu ? "translateX(0)" : "translateX(-100%)",
                            transition: "transform 0.3s ease-in-out", // Smooth transition
                        }}
                    >
                        <ul>
                            <li className="text-gray-800 font-medium">Mật ong</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium">Mật ong nhập khẩu</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium">Sáp ong</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium">Sữa ong chúa</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium">Tinh bột nghệ</li>
                            <li className="border-t border-gray-200 pt-4 text-gray-800 font-medium">Phấn hoa</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
