import React, { useState, useEffect } from "react";

export default function CountdownTimer({ initialTime }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex space-x-3">
      <div className="text-center flex items-center justify-center bg-green-500 rounded-md h-10 w-9">
        <span className="block font-semibold text-xl select-none text-white">
          {hours}
        </span>
      </div>
      <span className="block font-semibold text-2xl text-white">:</span>
      <div className="text-center flex items-center justify-center bg-green-500 rounded-md h-10 w-9">
        <span className="block font-semibold text-xl select-none text-white">
          {minutes}
        </span>
      </div>
      <span className="block font-semibold text-2xl text-white">:</span>
      <div className="text-center flex items-center justify-center bg-green-500 rounded-md h-10 w-9">
        <span className="block font-semibold text-xl select-none text-white">
          {seconds}
        </span>
      </div>
    </div>
  );
}
