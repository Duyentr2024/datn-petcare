import React from 'react';
import { PriceFilter } from './PriceFilter';
import { ProductTypeFilter } from './ProductTypeFilter';
import { BrandFilter } from './BrandFilter';

export function Sidebar({ onFilterChange, categories, brands, onReset, selectedFilters }) {
    return (
        <div className="w-64 sticky top-37.5 h-fit">
            <div className="bg-[#fef0d3] rounded-3xl p-6 shadow">
                <h2 className="font-bold text-xl text-gray-800 mb-6">BỘ LỌC SẢN PHẨM</h2>
                <PriceFilter onPriceChange={onFilterChange} selectedPriceRange={selectedFilters.priceRange} />
                <ProductTypeFilter
                    categories={categories}
                    onCategoryChange={onFilterChange}
                    selectedCategories={selectedFilters.categories}
                />
                <BrandFilter
                    brands={brands}
                    onBrandChange={onFilterChange}
                    selectedBrands={selectedFilters.brands}
                />

                <button
                    className="w-full bg-[#fbb321] border-2 border-[#fbb321] text-white py-2.5 rounded-full hover:bg-[#fef0d3] hover:text-[#fbb321] transition-colors font-medium"
                    onClick={onReset} // Đảm bảo onReset được gọi đúng
                >
                    Đặt lại
                </button>
            </div>
        </div>
    );
}