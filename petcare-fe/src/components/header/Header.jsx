import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { FaPhoneAlt, FaSearch, FaShoppingCart, FaUser, FaBars } from 'react-icons/fa';

export default function Header() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeMenuItem, setActiveMenuItem] = useState('');

    const toggleMobileMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };




    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const menuItems = document.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            const underline = item.querySelector('.underline');

            item.addEventListener('mouseenter', () => {
                gsap.to(underline, { width: '100%', duration: 0.5, ease: 'power4.out' });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(underline, { width: '0%', duration: 0.5, ease: 'power4.in' });
            });

            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    gsap.to(window, {
                        scrollTo: { y: targetSection.offsetTop, autoKill: false },
                        duration: 1,
                        ease: 'power2.inOut'
                    });
                }
            });
        });

        return () => {
            menuItems.forEach(item => {
                const underline = item.querySelector('.underline');

                item.removeEventListener('mouseenter', () => {
                    gsap.to(underline, { width: '100%', duration: 0.5, ease: 'power4.out' });
                });

                item.removeEventListener('mouseleave', () => {
                    gsap.to(underline, { width: '0%', duration: 0.5, ease: 'power4.in' });
                });
            });
        };
    }, []);

    return (
        <>
            <div className="bg-[#FBB321] text-center py-2 text-white rounded-b-2xl px-4 w-full sm:w-full lg:w-full">
                <span className="text-xs sm:text-sm md:text-base lg:text-lg">
                    Giảm <span className="font-bold">25.000đ</span> phí ship cho đơn hàng trên
                    <span className="font-bold">600.000đ</span>
                </span>
            </div>

            <header className="sticky top-0 z-50 bg-white transition-all duration-300 ease-in-out shadow-md">
                <div className="mx-auto flex items-center justify-center w-full h-[120px] gap-5 ">
                    <div className="flex items-center space-x-4 w-[164px] pt-2">
                        <img
                            src="http://nongsan.monamedia.net/wp-content/uploads/2023/11/nongsan-logo.png"
                            alt="Honey The Mona logo"
                            className="h-auto w-full"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-start space-x-8">
                        <div className="flex-1 w-full sm:w-auto">
                            <div className="flex items-center space-x-4 relative w-full max-w-lg hidden sm:block">
                                <input
                                    type="text"
                                    placeholder="Nhập từ khoá tìm kiếm..."
                                    className="border border-yellow-500 rounded-2xl px-4 py-2 pl-4 pr-12 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                                />
                                <button
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500">
                                    <FaSearch size={18}/>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8">
                            {/* Hotline */}
                            <div className="hidden sm:block">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="bg-yellow-100 p-3 rounded-full flex items-center justify-center hover:ring-2 hover:ring-black transition-all duration-300">
                                        <FaPhoneAlt className="text-yellow-500 text-xl"/>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-700">Hotline</span>
                                        <br/>
                                        <span className="font-bold text-yellow-500">0313728397</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tài khoản */}
                            <div className="flex items-center space-x-3">
                                <div
                                    className="bg-amber-200 p-3 rounded-full flex items-center justify-center hover:ring-2 hover:ring-black transition-all duration-300">
                                    <FaUser className="text-amber-100 text-xl"/>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-sm text-gray-700">Tài khoản</span>
                                    <br/>
                                    <span className="font-bold text-brown-700">Đăng nhập</span>
                                </div>
                            </div>

                            {/* Giỏ hàng */}
                            <div className="flex items-center space-x-3">
                                <div
                                    className="bg-green-100 p-3 rounded-full flex items-center justify-center hover:ring-2 hover:ring-black transition-all duration-300">
                                    <FaShoppingCart className="text-green-700 text-xl"/>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-sm text-gray-700">Giỏ hàng</span>
                                    <br/>
                                    <span className="font-bold text-green-700">0 Sản phẩm</span>
                                </div>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <div className="lg:hidden flex items-center">
                                <button onClick={toggleMobileMenu}>
                                    <FaBars size={24} className="text-gray-700"/>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </header>


            {/* Mobile Menu */}
            <div
                className={`fixed z-50 top-0 left-0 w-[250px] h-full bg-white transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out shadow-lg lg:hidden`}
            >
                <div className="flex justify-between items-center pl-3 mt-10">
                    <span className="text-lg font-bold">Menu</span>
                    <button
                        className="text-xl font-bold text-gray-700"
                        onClick={() => toggleMobileMenu()} // Close the menu when clicked
                    >
                        &times; {/* This is the "X" symbol */}
                    </button>
                </div>
                <div className="flex flex-col items-start pl-3 mt-10 space-y-6">
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'home' ? 'text-yellow-500' : ''}`}
                            href="#home"
                            onClick={() => {
                                setActiveMenuItem('home');
                                toggleMobileMenu();
                            }}
                        >
                            Trang chủ
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'about' ? 'text-yellow-500' : ''}`}
                            href="#about"
                            onClick={() => {
                                setActiveMenuItem('about');
                                toggleMobileMenu();
                            }}
                        >
                            Giới thiệu
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'products' ? 'text-yellow-500' : ''}`}
                            href="#products"
                            onClick={() => {
                                setActiveMenuItem('products');
                                toggleMobileMenu();
                            }}
                        >
                            Sản phẩm
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'services' ? 'text-yellow-500' : ''}`}
                            href="#services"
                            onClick={() => {
                                setActiveMenuItem('services');
                                toggleMobileMenu();
                            }}
                        >
                            Dịch vụ doanh nghiệp
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'news' ? 'text-yellow-500' : ''}`}
                            href="#news"
                            onClick={() => {
                                setActiveMenuItem('news');
                                toggleMobileMenu();
                            }}
                        >
                            Tin tức
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'policy' ? 'text-yellow-500' : ''}`}
                            href="#policy"
                            onClick={() => {
                                setActiveMenuItem('policy');
                                toggleMobileMenu();
                            }}
                        >
                            Chính sách
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'guides' ? 'text-yellow-500' : ''}`}
                            href="#guides"
                            onClick={() => {
                                setActiveMenuItem('guides');
                                toggleMobileMenu();
                            }}
                        >
                            Hướng dẫn mua hàng
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                    <div className="border-b w-full">
                        <a
                            className={`menu-item text-sm relative ${activeMenuItem === 'contact' ? 'text-yellow-500' : ''}`}
                            href="#contact"
                            onClick={() => {
                                setActiveMenuItem('contact');
                                toggleMobileMenu();
                            }}
                        >
                            Liên hệ
                            <span
                                className="underline absolute left-0 bottom-0 h-0.5 bg-yellow-500 w-0"></span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

