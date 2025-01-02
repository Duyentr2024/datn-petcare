import React from 'react';
import { Plus } from 'lucide-react';

export function ProductCard({ name, price, oldPrice, image }) {
    return (
        <div className="w-[250px] bg-white rounded-lg overflow-hidden shadow group">
            <div className="relative w-[250px] h-[250px] overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    width={250}
                    height={250}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-3">
                <h3 className="font-medium text-gray-800 mb-3 line-clamp-2">{name}</h3>
                <span className="w-2/6 mb-3 bg-[#e8dfd8] text-[#8a5e3b] p-0.5 font-medium rounded-lg flex items-center justify-center">
                    Bán chạy
                </span>
                <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[#fbb321] font-bold text-lg">{price.toLocaleString()}đ</span>
                        <span className="text-gray-400 line-through text-sm">{oldPrice.toLocaleString()}đ</span>
                    </div>
                    <button className="bg-[#fbb321] text-white p-2 rounded-full hover:bg-[#e88a19] transition-colors flex items-center justify-center gap-2">
                        <Plus size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );
}