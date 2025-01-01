import React from 'react';
import {PriceFilter} from './PriceFilter';
import {ProductTypeFilter} from './ProductTypeFilter';

export function Sidebar() {
    return (
        <div className="w-64">
            <div className="bg-[#fef0d3] rounded-3xl p-6 shadow">
                <h2 className="font-bold text-xl text-gray-800 mb-6">BỘ LỌC SẢN PHẨM</h2>
                <PriceFilter/>
                <ProductTypeFilter/>
                <button
                    className="w-full bg-[#fbb321] border-2 border-[#fbb321] text-white py-2.5 rounded-full hover:bg-[#fef0d3] hover:text-[#fbb321] transition-colors font-medium">
                    Lọc sản phẩm
                </button>
                <button
                    className="w-full mt-4 bg-[#fef0d3] border-2 border-[#fbb321] text-[#fbb321] py-2.5 rounded-full hover:bg-[#fbb321] hover:text-white transition-colors font-medium">
                    Đặt lại
                </button>
            </div>
        </div>
    );
}