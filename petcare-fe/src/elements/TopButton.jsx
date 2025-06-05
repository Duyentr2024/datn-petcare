import React, { useState, useEffect } from 'react';

const TopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Xử lý hiển thị button khi cuộn
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Xử lý click để cuộn lên đầu trang
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`
        fixed bottom-8 right-8
        w-12 h-12
        bg-[#fbb321] hover:bg-[#e6a01e]
        rounded-lg
        flex items-center justify-center
        shadow-lg
        transition-all duration-300 ease-in-out
        hover:-translate-y-1
        hover:shadow-xl
        group
        ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
      `}
        >
            <div className="relative w-6 h-6">
                <div className="w-0 h-0
          border-l-[8px] border-l-transparent
          border-b-[8px] border-b-white
          border-r-[8px] border-r-transparent
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          animate-arrow-1"
                />
                <div className="w-0 h-0
          border-l-[8px] border-l-transparent
          border-b-[8px] border-b-white
          border-r-[8px] border-r-transparent
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          animate-arrow-2"
                />
                <div className="w-0 h-0
          border-l-[8px] border-l-transparent
          border-b-[8px] border-b-white
          border-r-[8px] border-r-transparent
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          animate-arrow-3"
                />
            </div>
        </button>
    );
};

export default TopButton;
