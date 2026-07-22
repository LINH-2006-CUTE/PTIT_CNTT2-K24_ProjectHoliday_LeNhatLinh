import React from 'react';
import { Globe, Share2, MessageCircle, Mail, MapPin, Phone, Send } from 'lucide-react';

export default function CustomerFooter({ info }) {
  return (
    <footer id="reservation" className="bg-[#4A2810] text-[#FAF7F2] border-t border-[#E07A5F]/20 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="L'ÉCLAT Logo" className="h-10 w-10 rounded-xl object-cover border border-[#E07A5F]/30 shadow-md" />
              <span className="text-xl font-bold font-serif text-[#FAF7F2]">
                L'ÉCLAT Gastronomie
              </span>
            </div>
            
            <p className="text-xs text-[#FAF7F2]/70 font-light leading-relaxed">
              {info?.tagline || "Nơi Lưu Giữ Tinh Hoa Ẩm Thực Cao Cấp"}
            </p>

            <div className="pt-2 flex gap-4 text-[#E07A5F]">
              <a href="#" className="hover:text-white transition-colors" title="Website"><Globe className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" title="Chia sẻ"><Share2 className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" title="Nhắn tin"><MessageCircle className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" title="Email"><Mail className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Col 2: Operating Hours & Reservation */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#E07A5F] mb-4 uppercase tracking-wider">
              Giờ Mở Cửa & Đặt Bàn
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80 font-light">
              <li className="flex justify-between border-b border-[#FAF7F2]/10 pb-1.5">
                <span>Thứ 2 - Thứ 6:</span>
                <span className="font-mono font-bold text-white">10:00 - 23:00</span>
              </li>
              <li className="flex justify-between border-b border-[#FAF7F2]/10 pb-1.5">
                <span>Thứ 7 - Chủ Nhật:</span>
                <span className="font-mono font-bold text-white">09:00 - 23:30</span>
              </li>
              <li className="pt-2 text-[#E07A5F] font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Hotline: <span className="text-white font-mono">{info?.phone || "1900 8888"}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Address & Contact */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#E07A5F] mb-4 uppercase tracking-wider">
              Địa Chỉ Nhà Hàng
            </h4>
            <p className="text-xs text-[#FAF7F2]/80 font-light leading-relaxed mb-3 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
              <span>{info?.address || "123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội"}</span>
            </p>
            <p className="text-xs text-[#FAF7F2]/80 font-light flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#E07A5F] shrink-0" />
              <span>Email: {info?.email || "reservation@letoile-restaurant.vn"}</span>
            </p>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#E07A5F] mb-4 uppercase tracking-wider">
              Đăng Ký Ưu Đãi
            </h4>
            <p className="text-xs text-[#FAF7F2]/70 font-light mb-3">
              Nhận thông tin ưu đãi đặc biệt và thực đơn mùa mới sớm nhất.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="w-full bg-[#FAF7F2]/10 border border-[#E07A5F]/30 rounded-xl py-2 px-3 text-xs text-white placeholder:text-[#FAF7F2]/40 focus:outline-none focus:border-[#E07A5F]"
              />
              <button className="bg-[#8C3A27] hover:bg-[#A3432D] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase shrink-0 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#FAF7F2]/10 flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#FAF7F2]/50 font-mono">
          <span>© 2026 L'ÉCLAT Fine Dining Restaurant. All Rights Reserved.</span>
          <span className="mt-2 sm:mt-0">Thiết kế bởi Đội ngũ Công nghệ Nhà hàng L'ÉCLAT</span>
        </div>

      </div>
    </footer>
  );
}
