import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerBanner from '../components/CustomerBanner';
import CategorySection from '../components/CategorySection';
import FeaturedDishesSection from '../components/FeaturedDishesSection';
import BestSellersSection from '../components/BestSellersSection';
import PromotionsSection from '../components/PromotionsSection';
import AboutSection from '../components/AboutSection';
import ReviewsSection from '../components/ReviewsSection';
import CustomerFooter from '../components/CustomerFooter';
import { Sparkles, Calendar, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CustomerHome() {
  const { addToCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDishModal, setSelectedDishModal] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/public/home');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Filter dishes by search and category
  const filterDishes = (dishes) => {
    if (!dishes) return [];
    return dishes.filter((d) => {
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCategory === null || (d.category && d.category.id === selectedCategory);
      return matchSearch && matchCat;
    });
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B2625] relative selection:bg-[#8C3A27] selection:text-white">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <CustomerNavbar
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {loading ? (
        /* Skeleton Loading */
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-pulse">
          <div className="h-[480px] bg-[#4A2810]/20 rounded-3xl w-full"></div>
          <div className="flex gap-4">
            <div className="h-10 w-28 bg-[#8C3A27]/20 rounded-2xl"></div>
            <div className="h-10 w-28 bg-[#8C3A27]/20 rounded-2xl"></div>
            <div className="h-10 w-28 bg-[#8C3A27]/20 rounded-2xl"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-72 bg-white rounded-3xl"></div>
            <div className="h-72 bg-white rounded-3xl"></div>
            <div className="h-72 bg-white rounded-3xl"></div>
          </div>
        </div>
      ) : (
        <main>
          {/* Hero Banner Slider */}
          <CustomerBanner banners={data?.banners} />

          {/* Categories Bar */}
          <CategorySection
            categories={data?.categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Featured Dishes Section */}
          <FeaturedDishesSection
            dishes={filterDishes(data?.featuredDishes)}
            onSelectDish={(dish) => setSelectedDishModal(dish)}
          />

          {/* Best Sellers Section */}
          <BestSellersSection
            dishes={filterDishes(data?.bestSellingDishes)}
            onSelectDish={(dish) => setSelectedDishModal(dish)}
          />

          {/* Promotions & Voucher Cards */}
          <PromotionsSection
            promotions={data?.activePromotions}
            onClaimCode={(code) => showToast(`Đã sao chép mã ${code}!`)}
          />

          {/* About Restaurant & Story */}
          <AboutSection info={data?.restaurantInfo} />

          {/* Reviews & Testimonials */}
          <ReviewsSection
            reviews={data?.reviews}
            onReviewSubmitted={() => fetchHomeData()}
          />
        </main>
      )}

      {/* Dish Detail Modal */}
      {selectedDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl overflow-hidden animate-fade-in my-6 relative">
            <button
              onClick={() => setSelectedDishModal(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center font-bold z-10 hover:bg-black/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-72 overflow-hidden relative">
              <img
                src={selectedDishModal.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"}
                alt={selectedDishModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-[#8C3A27] text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase">
                {selectedDishModal.category?.name || "Thực đơn cao cấp"}
              </div>
            </div>

            <div className="p-7">
              <h3 className="text-2xl font-bold font-serif text-[#4A2810] mb-2">{selectedDishModal.name}</h3>
              <p className="text-xs text-[#4A2810]/70 font-light leading-relaxed mb-6">
                {selectedDishModal.description || "Món ăn cao cấp chế biến thủ công từ nguồn nguyên liệu tuyển chọn khắt khe bởi Bếp trưởng 5 sao L'ÉCLAT."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#4A2810]/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Giá niêm yết</span>
                  <span className="text-xl font-bold font-mono text-[#8C3A27]">{formatCurrency(selectedDishModal.price)}</span>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedDishModal);
                    setSelectedDishModal(null);
                    showToast(`Đã thêm món "${selectedDishModal.name}" vào giỏ hàng!`);
                  }}
                  className="bg-[#8C3A27] text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Đặt Món Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <CustomerFooter info={data?.restaurantInfo} />

    </div>
  );
}
