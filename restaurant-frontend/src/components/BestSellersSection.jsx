import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';

export default function BestSellersSection({ dishes, onSelectDish }) {
  const { addToCart } = useCart();
  if (!dishes || dishes.length === 0) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  return (
    <section className="py-12 bg-white border-y border-[#4A2810]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
              Được Yêu Thích Nhất
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#4A2810]">
              Top Món Ăn Bán Chạy
            </h2>
          </div>
          <a href="#menu" className="text-xs font-bold text-[#8C3A27] uppercase tracking-wider hover:underline">
            Xem Toàn Bộ Thực Đơn →
          </a>
        </div>

        {/* Dish Horizontal List / Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#4A2810]/10 flex gap-4 items-center hover:border-[#8C3A27]/40 transition-all group"
            >
              <div className="h-24 w-24 rounded-xl overflow-hidden shrink-0 bg-[#4A2810]/5">
                <img
                  src={dish.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"}
                  alt={dish.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal ml-1">(4.9/5)</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#4A2810] font-serif group-hover:text-[#8C3A27] transition-colors line-clamp-1">
                    {dish.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold font-mono text-sm text-[#8C3A27]">
                    {formatCurrency(dish.price)}
                  </span>
                  <button
                    onClick={() => addToCart(dish)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-[#8C3A27] text-white px-3 py-1.5 rounded-lg hover:bg-[#A3432D] transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" /> Đặt Món
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
