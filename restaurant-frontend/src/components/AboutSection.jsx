import React from 'react';

export default function AboutSection({ info }) {
  return (
    <section id="about" className="py-16 bg-[#4A2810] text-[#FAF7F2] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Fine Dining Story */}
          <div className="space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] text-xs font-bold uppercase tracking-widest">
              Về Nhà Hàng L'Étoile
            </span>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[#FAF7F2] leading-tight">
              {info?.tagline || "Nơi Lưu Giữ Tinh Hoa Ẩm Thực Cao Cấp"}
            </h2>

            <p className="text-sm sm:text-base text-[#FAF7F2]/80 font-light leading-relaxed">
              {info?.story || "L'Étoile được thành lập với sứ mệnh mang đến trải nghiệm thưởng thức ẩm thực đỉnh cao. Mỗi món ăn là một tác phẩm nghệ thuật hòa quyện giữa hương vị truyền thống tinh tế và phong cách chế biến hiện đại."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-[#FAF7F2]/10">
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#E07A5F] block">15+</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF7F2]/60">Năm Kinh Nghiệm</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#E07A5F] block">5★</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF7F2]/60">Đạt Chuẩn Quốc Tế</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#E07A5F] block">100%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF7F2]/60">Nguyên Liệu Tươi Ngon</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#reservation"
                className="inline-block bg-[#8C3A27] text-white px-7 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all shadow-xl active:scale-95"
              >
                Đặt Bàn Trải Nghiệm Ngay
              </a>
            </div>
          </div>

          {/* Right: Fine Dining Image Collage */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-[#E07A5F]/20">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                alt="L'Étoile Fine Dining Interior"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-[#8C3A27] p-5 rounded-2xl shadow-xl hidden sm:block border border-[#E07A5F]/30 max-w-xs">
              <p className="text-xs italic text-[#FAF7F2]/90 font-serif">
                "Ẩm thực không chỉ là ăn uống, đó là nghệ thuật đánh thức mọi giác quan."
              </p>
              <span className="text-[10px] font-bold text-[#E07A5F] uppercase block mt-2 tracking-wider">
                — Chef Jean-Paul (Executive Chef)
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
