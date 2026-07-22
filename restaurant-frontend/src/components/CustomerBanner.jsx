import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Utensils } from 'lucide-react';

export default function CustomerBanner({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultBanners = [
    {
      id: 1,
      title: "Trải Nghiệm Ẩm Thực Pháp Thượng Hạng",
      subtitle: "Hương vị tinh tế hòa quyện cùng nghệ thuật phục vụ chuẩn 5 sao tại L'ÉCLAT Gastronomie.",
      imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80",
      buttonText: "Khám Phá Thực Đơn",
      buttonLink: "/menu"
    },
    {
      id: 2,
      title: "Không Gian Tiệc Lãng Mạn & Sang Trọng",
      subtitle: "Điểm hẹn tuyệt vời cho những dịp kỷ niệm ý nghĩa, tiếp đón đối tác và gia đình.",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=80",
      buttonText: "Đặt Bàn Ngay",
      buttonLink: "/reservation"
    },
    {
      id: 3,
      title: "Tuyệt Kỹ Sáng Tạo Từ Siêu Bếp Trưởng",
      subtitle: "Mỗi món ăn là một kiệt tác ẩm thực được chuẩn bị từ nguồn nguyên liệu đắt giá nhất.",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
      buttonText: "Thưởng Thức Ngay",
      buttonLink: "/menu"
    }
  ];

  const slideList = banners && banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideList.length]);

  const getValidBannerImageUrl = (url, index) => {
    const fallbackList = [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80"
    ];
    if (!url || url.startsWith('/uploads/') || !url.startsWith('http')) {
      return fallbackList[index % fallbackList.length];
    }
    return url;
  };

  return (
    <section id="home" className="relative w-full overflow-hidden bg-[#2B170B]">
      
      {/* Background Slides */}
      <div className="relative h-[500px] sm:h-[580px] md:h-[640px] w-full">
        {slideList.map((slide, index) => {
          const bannerImg = getValidBannerImageUrl(slide.imageUrl, index);
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Dark Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B170B]/95 via-[#2B170B]/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B170B] via-transparent to-black/30 z-10" />

              <img
                src={bannerImg}
                alt={slide.title}
                className="h-full w-full object-cover object-center scale-105 transform transition-transform duration-10000"
              />

              {/* Slide Content */}
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
                  <div className="max-w-2xl animate-fade-in space-y-6">
                    
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E07A5F]/20 border border-[#E07A5F]/40 text-[#E07A5F] text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg">
                      <Utensils className="w-3.5 h-3.5" /> L'ÉCLAT Fine Dining Experience
                    </span>
                    
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-[#FAF7F2] leading-tight drop-shadow-md">
                      {slide.title}
                    </h1>

                    <p className="text-xs sm:text-base text-[#FAF7F2]/85 font-light leading-relaxed max-w-xl drop-shadow-xs">
                      {slide.subtitle}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-4">
                      <Link
                        to={slide.buttonLink || "/menu"}
                        className="bg-[#8C3A27] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all shadow-xl active:scale-95 flex items-center gap-2 border border-[#E07A5F]/40 cursor-pointer"
                      >
                        <span>{slide.buttonText || "Khám Phá Thực Đơn"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to="/reservation"
                        className="bg-white/10 backdrop-blur-md border border-white/30 text-[#FAF7F2] px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-[#E07A5F]" />
                        <span>Đặt Bàn Ngay</span>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3">
        {slideList.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex ? 'w-8 bg-[#E07A5F] shadow-md' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
