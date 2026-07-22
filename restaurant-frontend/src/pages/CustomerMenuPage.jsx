import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useCart } from '../context/CartContext';
import {
  Utensils,
  Tag,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Eye,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Search,
  Plus,
  ShoppingBag,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function CustomerMenuPage() {
  const navigate = useNavigate();
  const { addToCart, selectedTable, setSelectedTable, setIsCartOpen } = useCart();

  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Search, Filter & Sort States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [sortOption, setSortOption] = useState('id,desc');

  // Dish Detail Modal & Table Selection Modal
  const [selectedDishModal, setSelectedDishModal] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [pendingDishToOrder, setPendingDishToOrder] = useState(null);
  const [tablesList, setTablesList] = useState([]);
  const [chosenTableId, setChosenTableId] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/public/menu/categories');
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublicTables = async () => {
    try {
      const res = await api.get('/api/public/menu/tables');
      if (res.data && res.data.success) {
        setTablesList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setTablesList([
        { id: 1, tableName: 'Bàn 01 (Tầng 1 - Sảnh Chính)' },
        { id: 2, tableName: 'Bàn 02 (Tầng 1 - Sảnh Chính)' },
        { id: 3, tableName: 'Bàn 03 (Tầng 1 - VIP)' },
        { id: 4, tableName: 'Bàn 04 (Tầng 2 - Cửa Sổ)' },
        { id: 5, tableName: 'Bàn 05 (Tầng 2 - Ban Công)' }
      ]);
    }
  };

  const fetchMenuDishes = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() ? search.trim() : null,
        categoryId: selectedCategory,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        hasDiscount: hasDiscount ? true : null,
        page: page,
        size: 12,
        sort: sortOption
      };

      const res = await api.get('/api/public/menu', { params });
      if (res.data && res.data.success) {
        setDishes(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuDishes();
  }, [search, selectedCategory, minPrice, maxPrice, hasDiscount, page, sortOption]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(selectedCategory === catId ? null : catId);
    setPage(0);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setHasDiscount(false);
    setSortOption('id,desc');
    setPage(0);
  };

  const getCategoryLabel = (catName) => {
    if (!catName) return 'Khai Vị';
    return catName;
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 VND';
    return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(val)} VND`;
  };

  // Order Dish Flow
  const handleOrderDish = (dish) => {
    if (selectedDishModal) setSelectedDishModal(null);

    // 1. Add dish to cart
    addToCart(dish);

    if (selectedTable) {
      // Table is already selected -> Add & show toast
      showToast(`Đã thêm món "${dish.name}" vào giỏ hàng!`);
    } else {
      // Table NOT selected -> Prompt Service Mode Confirmation Dialog
      setPendingDishToOrder(dish);
      fetchPublicTables();
      setShowTableModal(true);
    }
  };

  const handleConfirmTakeawayAndPay = () => {
    setSelectedTable(null);
    setShowTableModal(false);
    navigate('/checkout');
  };

  const handleConfirmTableSelection = (e) => {
    e.preventDefault();
    if (!chosenTableId) return;

    const found = tablesList.find(t => t.id === Number(chosenTableId));
    const tableObj = found
      ? { id: found.id, tableName: found.tableName }
      : { id: Number(chosenTableId), tableName: `Bàn ${chosenTableId}` };

    setSelectedTable(tableObj);
    setShowTableModal(false);
    showToast(`Đã chọn ${tableObj.tableName} cho đơn hàng của bạn!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#2B2625] relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Customer Header Navbar */}
      <CustomerNavbar search={search} setSearch={setSearch} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Section */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-2 leading-relaxed">
            HAUTE CUISINE MENU
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#4A2810] leading-tight pt-1">
            Thực Đơn Ẩm Thực Tinh Hoa
          </h1>
          <p className="text-xs sm:text-sm text-[#4A2810]/70 font-light leading-relaxed pt-1">
            Khám phá hương vị đỉnh cao được sáng tạo công phu bởi các siêu bếp trưởng quốc tế.
          </p>

          {/* Selected Table Indicator */}
          {selectedTable && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Đang chọn vị trí: <strong>{selectedTable.tableName}</strong></span>
              <button
                onClick={() => setSelectedTable(null)}
                className="ml-2 text-[10px] text-red-600 underline font-semibold hover:text-red-800 cursor-pointer"
              >
                (Đổi bàn)
              </button>
            </div>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
          <button
            onClick={() => { setSelectedCategory(null); setPage(0); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#8C3A27] text-white shadow-md'
                : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
            }`}
          >
            Tất Cả Món ({categories.reduce((acc, c) => acc + (c.dishesCount || 0), 0) || 'All'})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#8C3A27] text-white shadow-md'
                  : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
              }`}
            >
              {getCategoryLabel(cat.name)}
            </button>
          ))}
        </div>

        {/* Filters & Sorting Controls */}
        <div className="bg-white p-4.5 rounded-3xl border border-[#4A2810]/10 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-[#4A2810] flex items-center gap-1.5 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-[#E07A5F]" /> Bộ Lọc:
            </span>

            <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-xl border border-gray-200">
              <input
                type="number"
                placeholder="Giá từ..."
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 bg-transparent text-xs text-[#4A2810] placeholder:text-gray-400 focus:outline-none px-2 font-mono"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                placeholder="Đến giá..."
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 bg-transparent text-xs text-[#4A2810] placeholder:text-gray-400 focus:outline-none px-2 font-mono"
              />
            </div>

            <button
              onClick={() => setHasDiscount(!hasDiscount)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                hasDiscount
                  ? 'bg-[#8C3A27] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Đang Giảm Giá
            </button>

            {(search || selectedCategory || minPrice || maxPrice || hasDiscount) && (
              <button
                onClick={resetFilters}
                className="p-2 text-xs text-red-600 hover:text-red-800 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sắp xếp:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-[#FAF7F2] border border-gray-300 text-[#4A2810] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#8C3A27]"
            >
              <option value="id,desc">Mới nhất</option>
              <option value="price,asc">Giá: Thấp đến Cao</option>
              <option value="price,desc">Giá: Cao đến Thấp</option>
              <option value="name,asc">Tên món A-Z</option>
            </select>
          </div>
        </div>

        {/* Dish Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Đang tải thực đơn ẩm thực...
          </div>
        ) : dishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#4A2810]/10 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="relative h-60 overflow-hidden bg-[#4A2810]/5">
                  <img
                    src={dish.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
                    alt={dish.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {dish.discount > 0 && (
                    <span className="absolute top-4 left-4 bg-[#8C3A27] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                      <Tag className="w-3 h-3" /> GIẢM {dish.discount}%
                    </span>
                  )}
                  {dish.category && (
                    <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full">
                      {getCategoryLabel(dish.category.name)}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#4A2810] group-hover:text-[#8C3A27] transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#4A2810]/70 font-light mt-2 line-clamp-2 leading-relaxed">
                      {dish.description || "Món ăn chế biến công phu từ những nguyên liệu tươi ngon chọn lọc."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#4A2810]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-sans">Giá niêm yết</span>
                      <span className="text-lg font-bold font-mono text-[#8C3A27]">
                        {formatCurrency(dish.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDishModal(dish)}
                        className="bg-[#FAF7F2] border border-[#8C3A27]/30 text-[#8C3A27] hover:bg-[#8C3A27] hover:text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                        title="Xem chi tiết món"
                      >
                        <Eye className="w-3.5 h-3.5" /> Chi Tiết
                      </button>

                      <button
                        onClick={() => handleOrderDish(dish)}
                        className="bg-[#8C3A27] text-white hover:bg-[#A3432D] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                        title="Đặt món vào giỏ hàng"
                      >
                        <Plus className="w-4 h-4" /> Đặt Món
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#4A2810]/10 max-w-md mx-auto shadow-md space-y-3">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto" />
            <h4 className="text-base font-bold font-serif text-[#4A2810]">Không tìm thấy món ăn phù hợp</h4>
            <p className="text-xs text-gray-400 leading-relaxed px-4">Thử thay đổi từ khóa hoặc khoảng giá trong bộ lọc.</p>
            <button
              onClick={resetFilters}
              className="bg-[#8C3A27] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Đặt lại bộ lọc
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-[#4A2810]/20 bg-white text-[#4A2810] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <span className="text-xs font-mono text-gray-500 font-bold">Trang {page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-[#4A2810]/20 bg-white text-[#4A2810] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </main>

      {/* DISH DETAIL MODAL */}
      {selectedDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl overflow-hidden animate-fade-in my-6 relative">
            <button
              onClick={() => setSelectedDishModal(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center font-bold z-10 hover:bg-black/60 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-72 overflow-hidden relative">
              <img
                src={selectedDishModal.image || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"}
                alt={selectedDishModal.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-4 left-4 bg-[#8C3A27] text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase">
                {getCategoryLabel(selectedDishModal.category?.name)}
              </div>
            </div>

            <div className="p-7 space-y-4">
              <h3 className="text-2xl font-bold font-serif text-[#4A2810]">{selectedDishModal.name}</h3>
              <p className="text-xs text-[#4A2810]/70 font-light leading-relaxed">
                {selectedDishModal.description || "Món ăn cao cấp chế biến thủ công từ nguồn nguyên liệu tuyển chọn khắt khe bởi Bếp trưởng 5 sao L'ÉCLAT."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#4A2810]/10">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Giá thưởng thức</span>
                  <span className="text-xl font-bold font-mono text-[#8C3A27]">{formatCurrency(selectedDishModal.price)}</span>
                </div>

                <button
                  onClick={() => handleOrderDish(selectedDishModal)}
                  className="bg-[#8C3A27] text-white px-7 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-lg active:scale-95 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> Đặt Món Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE MODE & TABLE SELECTION MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-6 animate-fade-in space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#4A2810] font-serif flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#E07A5F]" /> Xác Nhận Hình Thức Phục Vụ
              </h3>
              <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed text-center font-medium">
              Bạn chưa chọn vị trí bàn. Vui lòng chọn hình thức bạn muốn thưởng thức món ăn:
            </p>

            <div className="space-y-3">
              {/* Option A: Takeaway & Checkout */}
              <button
                onClick={handleConfirmTakeawayAndPay}
                className="w-full p-4 rounded-2xl border-2 border-[#8C3A27] bg-[#FAF7F2] hover:bg-[#8C3A27] hover:text-white transition-all text-left flex items-center gap-4 cursor-pointer group shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-[#8C3A27] text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#8C3A27]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-serif">1. Mua Mang Về (Takeaway)</h4>
                  <p className="text-[11px] opacity-80 mt-0.5">Xác nhận mang về và chuyển sang màn hình Thanh Toán Ngay.</p>
                </div>
              </button>

              {/* Option B: Choose Table */}
              <form onSubmit={handleConfirmTableSelection} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-[#4A2810] font-serif flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" /> 2. Ăn Tại Bàn (Dine-in)
                </h4>
                <select
                  value={chosenTableId}
                  onChange={(e) => setChosenTableId(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs font-bold border border-gray-300 bg-[#FAF7F2] focus:outline-none focus:border-[#8C3A27] cursor-pointer"
                >
                  <option value="">-- Chọn số bàn đang ngồi --</option>
                  {tablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableName || `Bàn ${t.tableNumber || t.id}`} ({t.area || 'Sảnh Chính'})
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!chosenTableId}
                  className="w-full bg-emerald-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Xác Nhận Chọn Bàn này
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Footer */}
      <CustomerFooter />

    </div>
  );
}
