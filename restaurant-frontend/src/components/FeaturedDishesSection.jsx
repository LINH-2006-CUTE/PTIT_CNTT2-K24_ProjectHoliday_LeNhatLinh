import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Eye, Award } from 'lucide-react';

export default function FeaturedDishesSection({ dishes, onSelectDish }) {
  const { addToCart } = useCart();
  if (!dishes || dishes.length === 0) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  return (
    <section id="menu" className="py-12 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            Gợi Ý Từ Bếp Trưởng
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
            Món Ăn Nổi Bật Đặc Sắc
          </h2>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Dish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#4A2810]/10 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-60 overflow-hidden bg-[#4A2810]/5">
                <img
                  src={dish.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#8C3A27] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-300" /> Bếp Trưởng Khuyên Dùng
                  </span>
                </div>

                {/* Category Badge */}
                {dish.category && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full">
                    {dish.category.name}
                  </div>
                )}
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#4A2810] group-hover:text-[#8C3A27] transition-colors">
                    {dish.name}
                  </h3>
                  
                  <p className="text-xs text-[#4A2810]/70 font-light mt-2 line-clamp-2 leading-relaxed">
                    {dish.description || "Món ăn cao cấp chế biến thủ công từ nguyên liệu thượng hạng."}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="mt-6 pt-4 border-t border-[#4A2810]/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block font-sans">Giá thưởng thức</span>
                    <span className="text-lg font-bold font-mono text-[#8C3A27]">
                      {formatCurrency(dish.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(dish)}
                      className="bg-[#8C3A27] text-white hover:bg-[#A3432D] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Đặt Món
                    </button>
                    <button
                      onClick={() => onSelectDish && onSelectDish(dish)}
                      className="bg-[#FAF7F2] border border-[#8C3A27]/30 text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Chi Tiết
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
