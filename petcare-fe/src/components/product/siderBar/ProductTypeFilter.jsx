import React from 'react';

export function ProductTypeFilter() {
    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Loại sản phẩm</h3>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    className="w-4 h-4 text-[#fbb321] border-gray-300 rounded focus:ring-[#fbb321]"
                />
                <span className="text-sm text-gray-600">Sản phẩm giảm giá</span>
            </label>
        </div>
    );
}