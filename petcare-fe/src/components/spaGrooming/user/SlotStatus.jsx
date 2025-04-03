import React, { useState, useEffect } from 'react';
import { FaCheck, FaLock } from 'react-icons/fa';

const SlotStatus = ({ 
  slotId, 
  isBooked, 
  isUserBooked, 
  isSelected, 
  onClick, 
  disabled 
}) => {
  // Track animation state for newly booked slots
  const [isNewlyBooked, setIsNewlyBooked] = useState(false);
  
  useEffect(() => {
    // If this slot is booked by the user and wasn't before, show animation
    if (isUserBooked && !isNewlyBooked) {
      setIsNewlyBooked(true);
      
      // After animation completes, reset the state
      const timer = setTimeout(() => {
        setIsNewlyBooked(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isUserBooked]);
  
  // Determine the style based on slot status
  let className = "flex items-center justify-center rounded-md p-2 relative overflow-hidden ";
  
  if (isUserBooked) {
    // User's booked slot
    className += "bg-green-500 text-white cursor-default";
  } else if (isBooked) {
    // Slot booked by someone else
    className += "bg-gray-500 text-white cursor-not-allowed";
  } else if (isSelected) {
    // Selected but not yet booked
    className += "bg-blue-500 text-white cursor-pointer hover:bg-blue-600";
  } else if (disabled) {
    // Disabled slot
    className += "bg-gray-200 text-gray-500 cursor-not-allowed";
  } else {
    // Available slot
    className += "bg-white text-blue-500 border border-blue-500 cursor-pointer hover:bg-blue-50";
  }
  
  // Add animation class for newly booked slots
  if (isNewlyBooked) {
    className += " animate-pulse";
  }
  
  return (
    <div 
      className={className}
      onClick={disabled || isBooked ? undefined : onClick}
      data-slot-id={slotId}
    >
      {isUserBooked && (
        <FaCheck className="mr-1" />
      )}
      
      {isBooked && !isUserBooked && (
        <FaLock className="mr-1" />
      )}
      
      <span>
        {slotId.split('-')[1] ? `Slot ${parseInt(slotId.split('-')[1]) + 1}` : 'Slot'}
      </span>
      
      {isNewlyBooked && (
        <div className="absolute inset-0 bg-green-500 opacity-30 animate-pulse"></div>
      )}
    </div>
  );
};

export default SlotStatus; 