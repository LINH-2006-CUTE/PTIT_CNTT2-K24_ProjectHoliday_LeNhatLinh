import React, { useState } from 'react';

export default function PromotionsSection({ promotions, onClaimCode }) {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!promotions || promotions.length === 0) return null;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onClaimCode) onClaimCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section id="promotions" className="py-12 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            Ưu Đãi Đặc Biệt
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
            Voucher Khuyến Mãi HOT
          </h2>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Voucher Cards Carousel/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#E07A5F]/40 shadow-md relative flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-[#8C3A27]/10 text-[#8C3A27] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    {p.discountType === 'PERCENTAGE' ? `GIẢM ${p.discountValue}%` : `GIẢM $${p.discountValue}`}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Hạn: {new Date(p.endDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold font-serif text-lg text-[#4A2810] mb-1 font-mono tracking-wider">{p.code}</h4>
                <p className="text-xs text-gray-500 font-light line-clamp-2 leading-relaxed mb-4">
                  {p.description || "Áp dụng cho các đơn hàng thưởng thức ẩm thực tại L'Étoile."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#4A2810]/10 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400">
                  {p.minOrderValue ? `Đơn từ $${p.minOrderValue}` : 'Mọi đơn hàng'}
                </span>

                <button
                  onClick={() => handleCopy(p.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    copiedCode === p.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#8C3A27] text-white hover:bg-[#A3432D]'
                  }`}
                >
                  {copiedCode === p.code ? 'Đã sao chép ✓' : 'Lấy Mã'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
