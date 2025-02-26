import React, { useState } from 'react';

export function PriceFilter({ onPriceChange, selectedPriceRange }) {
    const [priceRange, setPriceRange] = useState(selectedPriceRange || [0, 1000000]);

    const handlePriceChange = (e) => {
        const newPrice = Number(e.target.value);
        setPriceRange([0, newPrice]);
        onPriceChange({ type: 'price', value: [0, newPrice] });
    };

    // Đồng bộ với selectedPriceRange từ cha
    React.useEffect(() => {
        setPriceRange(selectedPriceRange);
    }, [selectedPriceRange]);

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Khoảng giá</h3>
            <div className="space-y-2">
                <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer range-slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>0đ</span>
                    <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                </div>
            </div>

            <style jsx>{`
                .range-slider::-webkit-slider-runnable-track {
                    background: linear-gradient(to right, #fbb321 ${priceRange[1] / 10000}%, #e5e7eb ${priceRange[1] / 10000}%);
                    height: 4px;
                    border-radius: 5px;
                }
                .range-slider::-moz-range-track {
                    background: linear-gradient(to right, #fbb321 ${priceRange[1] / 10000}%, #e5e7eb ${priceRange[1] / 10000}%);
                    height: 4px;
                    border-radius: 5px;
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #fbb321;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: -6px;
                }
                .range-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #fbb321;
                    border-radius: 50%;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}