import React from 'react';

export function PriceFilter() {
    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Khoảng giá</h3>
            <div className="space-y-2">
                <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    className="w-full h-1 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-[#fbb321]"
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>0đ</span>
                    <span>500.000đ</span>
                </div>
            </div>
        </div>
    );
}