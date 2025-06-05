import React, { useEffect } from 'react';

export function ProductTypeFilter({ categories, onCategoryChange, selectedCategories }) {
    const handleCategoryChange = (categoryName) => {
        const updatedCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((name) => name !== categoryName)
            : [...selectedCategories, categoryName];
        onCategoryChange({ type: 'category', value: updatedCategories });
    };

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Loại sản phẩm</h3>
            <div className="space-y-2">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.name)}
                                onChange={() => handleCategoryChange(category.name)}
                                className="w-4 h-4 text-[#fbb321] border-gray-300 rounded focus:ring-[#fbb321]"
                            />
                            <span className="text-sm text-gray-600">{category.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Không có danh mục nào</p>
                )}
            </div>
        </div>
    );
}