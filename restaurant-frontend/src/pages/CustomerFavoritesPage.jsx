import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag } from 'lucide-react';

export default function CustomerFavoritesPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customer/favorites', {
        params: { email: user?.email }
      });
      if (res.data && res.data.success) {
        setFavoriteDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (dishId) => {
    try {
      await api.delete(`/api/customer/favorites/${dishId}`, {
        params: { email: user?.email }
      });
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount)} VND`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2810] flex flex-col font-sans">
      <CustomerNavbar search={search} setSearch={setSearch} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Banner Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            L'ÉCLAT Favorite Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
            Món Ăn Yêu Thích Của Tôi ❤️
          </h1>
          <p className="text-xs text-gray-500 font-light mt-1">Danh sách thực đơn cao cấp bạn đã đánh dấu ưu tiên.</p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 font-mono">
            Đang tải bộ sưu tập yêu thích...
          </div>
        ) : favoriteDishes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-[#4A2810]/10 shadow-lg space-y-4">
            <Heart className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold font-serif text-[#4A2810]">Chưa có món ăn yêu thích nào</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Khám phá thực đơn phong phú của L'ÉCLAT và bấm vào biểu tượng trái tim để lưu các món ăn bạn ưa thích!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {favoriteDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl p-5 border border-[#4A2810]/10 shadow-lg hover:border-[#8C3A27]/40 transition-all flex flex-col justify-between relative group"
              >
                {/* Heart Toggle */}
                <button
                  onClick={() => handleRemoveFavorite(dish.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Bỏ yêu thích"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>

                <div>
                  <div className="h-44 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={dish.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"}
                      alt={dish.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E07A5F] block mb-1">
                    {dish.category ? dish.category.name : 'Thực đơn'}
                  </span>
                  
                  <h4 className="font-bold text-base font-serif text-[#4A2810] line-clamp-1">{dish.name}</h4>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                    {dish.description || 'Món ăn cao cấp chế biến thủ công từ nguyên liệu thượng hạng.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold font-mono text-base text-[#8C3A27]">
                    {formatCurrency(dish.price)}
                  </span>

                  <button
                    onClick={() => addToCart(dish)}
                    className="bg-[#8C3A27] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" /> Thêm Vô Giỏ
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      <CustomerFooter />
    </div>
  );
}
