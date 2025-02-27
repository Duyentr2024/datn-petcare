import React, { useEffect } from 'react';

export function BrandFilter({ brands, onBrandChange, selectedBrands }) {
    const handleBrandChange = (brandName) => {
        const updatedBrands = selectedBrands.includes(brandName)
            ? selectedBrands.filter((name) => name !== brandName)
            : [...selectedBrands, brandName];
        onBrandChange({ type: 'brand', value: updatedBrands });
    };

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Thương hiệu</h3>
            <div className="space-y-2">
                {brands.length > 0 ? (
                    brands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand.name)}
                                onChange={() => handleBrandChange(brand.name)}
                                className="w-4 h-4 text-[#fbb321] border-gray-300 rounded focus:ring-[#fbb321]"
                            />
                            <span className="text-sm text-gray-600">{brand.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Không có thương hiệu nào</p>
                )}
            </div>
        </div>
    );
}