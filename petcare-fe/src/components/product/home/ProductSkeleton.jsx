import React from 'react';

const ProductSkeleton = () => {
    return (
        <div className="w-[250px] bg-white rounded-lg overflow-hidden shadow">
            {/* Image skeleton */}
            <div className="relative w-[250px] h-[250px]">
                <div className="w-full h-full bg-gray-200"></div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 animate-pulse">
                {/* Title skeleton */}
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>

                {/* Badge skeleton */}
                <div className="w-2/6 h-6 bg-gray-200 rounded-lg mb-3"></div>

                {/* Price and button skeleton */}
                <div className="flex justify-between items-baseline">
                    <div className="space-y-2">
                        {/* Price */}
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        {/* Old price */}
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    {/* Button skeleton */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;