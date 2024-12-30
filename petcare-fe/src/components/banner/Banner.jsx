import React, { useState, useEffect } from "react";
import Menu from "../menu/menu";
import '../../components/banner/textbanner.css'
const Banner = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
   


   

    // Get the image URL based on the current index for the dots
    const getSlideImage = (index) => {
        if (index === 0) {
            return "https://placehold.co/1920x712"; // Image 1
        } else if (index === 1) {
            return "https://placehold.co/1920x712"; // Image 2
        }
        return ""; // Default return if no valid index is provided
    };

    // Handle the mouse down event
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setScrollLeft(e.target.scrollLeft);
        e.target.style.cursor = "grabbing"; // Change cursor to grabbing
    };

    // Handle the mouse move event (dragging)
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const distance = e.clientX - startX;
        if (distance > 100) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % 2); // 2 is the number of slides
            setIsDragging(false); // Stop dragging when moved enough
        } else if (distance < -100) {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? 1 : prevIndex - 1));
            setIsDragging(false); // Stop dragging when moved enough
        }
    };

    // Handle the mouse up event
    const handleMouseUp = (e) => {
        setIsDragging(false);
        e.target.style.cursor = "grab"; // Revert cursor to grab when not dragging
    };

    // Handle the mouse leave event (in case the mouse leaves the image area while dragging)
    const handleMouseLeave = (e) => {
        setIsDragging(false);
        e.target.style.cursor = "grab"; // Revert cursor to grab
    };

    return (
        <div className="flex flex-col md:flex-row">
            {/* Left part (20%) */}

            <div className="w-full md:w-1/12 text-white flex flex-col items-center justify-center p-4 relative">


                <Menu/>

            </div>



            {/* Right part (80%) */}
            <div className="w-full md:w-10/12 flex items-center justify-center bg-gray-100 p-4">
                <div
                    className="relative max-w-full h-[712px] overflow-hidden rounded-lg"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }} // Change cursor based on dragging state
                >
                    {/* Show image based on currentIndex */}
                    <div className="h-full w-full transition-transform duration-500 ease-in-out">
                        {currentIndex === 0 && (
                            <img
                                src="https://placehold.co/1920x712"
                                alt="Slide 1"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {currentIndex === 1 && (
                            <img
                                src="https://placehold.co/1920x712"
                                alt="Slide 2"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Slide navigation dots */}
                    <div className="absolute bottom-4 left-4 transform flex space-x-4">
                        <div
                            onClick={() => setCurrentIndex(0)}
                            className={`w-16 h-16 rounded-full cursor-pointer bg-cover bg-center ${currentIndex === 0 ? "border-4 border-" : "bg-gray-400 hover:bg-gray-200"}`}
                            style={{
                                backgroundImage: `url(${getSlideImage(0)})`
                            }}
                        />
                        <div
                            onClick={() => setCurrentIndex(1)}
                            className={`w-16 h-16 rounded-full cursor-pointer bg-cover bg-center ${currentIndex === 1 ? "border-4 border-white" : "bg-gray-400 hover:bg-gray-200"}`}
                            style={{
                                backgroundImage: `url(${getSlideImage(1)})`
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;


