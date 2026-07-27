import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

export default function MenuManagement() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Search, Filter, Sort, Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [availableFilter, setAvailableFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Form
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [detailDish, setDetailDish] = useState(null);

  const openDetailModal = (dish) => {
    setDetailDish(dish);
    setShowDetailModal(true);
  };

  // Form Fields (15 Detailed Fields)
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [calories, setCalories] = useState('');
  const [spiciness, setSpiciness] = useState('Không cay');
  const [dishSize, setDishSize] = useState('Vừa (M)');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [available, setAvailable] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Toast
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        page,
        size,
        sort: `${sortField},${sortOrder}`
      };

      if (categoryFilter !== 'All') {
        params.categoryId = categoryFilter;
      }
      if (availableFilter !== 'All') {
        params.available = availableFilter === 'true';
      }

      const res = await api.get('/api/admin/dishes', { params });
      if (res.data && res.data.success) {
        setDishes(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách món ăn.');
      showToast('Tải thực đơn thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/admin/categories/list');
      if (res.data && res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [search, categoryFilter, statusFilter, availableFilter, sortField, sortOrder, page, size]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/admin/dishes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setImage(res.data.data);
        showToast('Tải ảnh món ăn lên thành công.', 'success');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Tải ảnh thất bại.';
      setFormError(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setSelectedDish(null);
    setCode('');
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setPrice('');
    setCostPrice('');
    setDiscount('0');
    setDescription('');
    setImage('');
    setIngredients('');
    setPrepTime('15');
    setCalories('');
    setSpiciness('Không cay');
    setDishSize('Vừa (M)');
    setNotes('');
    setStatus('ACTIVE');
    setAvailable(true);
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const openEditModal = (dish) => {
    setSelectedDish(dish);
    setCode(dish.code || `DISH-${String(dish.id).padStart(3, '0')}`);
    setName(dish.name);
    setCategoryId(dish.categoryId);
    setPrice(dish.price);
    setCostPrice(dish.costPrice || '');
    setDiscount(dish.discount || '0');
    setDescription(dish.description || '');
    setImage(dish.image || '');
    setIngredients(dish.ingredients || '');
    setPrepTime(dish.prepTime || '15');
    setCalories(dish.calories || '');
    setSpiciness(dish.spiciness || 'Không cay');
    setDishSize(dish.dishSize || 'Vừa (M)');
    setNotes(dish.notes || '');
    setStatus(dish.status);
    setAvailable(dish.available);
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    // 1. Validate Code (Mã món)
    if (code && code.trim()) {
      const codeRegex = /^[A-Za-z0-9_-]+$/;
      if (!codeRegex.test(code.trim())) {
        newErrors.code = 'Mã món chỉ gồm chữ cái, số, dấu - hoặc _';
      } else if (code.trim().length > 30) {
        newErrors.code = 'Mã món tối đa 30 ký tự.';
      }
    }

    // 2. Validate Name (Tên món)
    if (!name || !name.trim()) {
      newErrors.name = 'Vui lòng nhập Tên món ăn.';
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      newErrors.name = 'Tên món ăn từ 2 đến 100 ký tự.';
    }

    // 3. Validate Category (Danh mục)
    if (!categoryId) {
      newErrors.categoryId = 'Vui lòng chọn Danh mục món ăn.';
    }

    // 4. Validate Price (Giá bán)
    if (price === '' || price === null || price === undefined || isNaN(parseFloat(price))) {
      newErrors.price = 'Vui lòng nhập Giá bán hợp lệ (> 0).';
    } else if (parseFloat(price) <= 0) {
      newErrors.price = 'Giá bán phải lớn hơn 0 VNĐ.';
    } else if (parseFloat(price) > 100000000) {
      newErrors.price = 'Giá bán tối đa 100.000.000 VNĐ.';
    }

    // 5. Validate Cost Price (Giá vốn)
    if (costPrice !== '' && costPrice !== null && costPrice !== undefined) {
      if (isNaN(parseFloat(costPrice))) {
        newErrors.costPrice = 'Giá vốn phải là số.';
      } else if (parseFloat(costPrice) < 0) {
        newErrors.costPrice = 'Giá vốn không được âm.';
      } else if (price && !isNaN(parseFloat(price)) && parseFloat(costPrice) > parseFloat(price)) {
        newErrors.costPrice = 'Giá vốn không nên cao hơn Giá bán!';
      }
    }

    // 6. Validate Discount (Chiết khấu)
    if (discount !== '' && discount !== null && discount !== undefined) {
      if (isNaN(parseFloat(discount))) {
        newErrors.discount = 'Chiết khấu phải là số.';
      } else if (parseFloat(discount) < 0 || parseFloat(discount) > 100) {
        newErrors.discount = 'Chiết khấu từ 0% đến 100%.';
      }
    }

    // 7. Validate Prep Time (Thời gian làm)
    if (prepTime !== '' && prepTime !== null && prepTime !== undefined) {
      if (isNaN(parseInt(prepTime)) || parseInt(prepTime) < 1 || parseInt(prepTime) > 300) {
        newErrors.prepTime = 'Thời gian từ 1 - 300 phút.';
      }
    }

    // 8. Validate Calories
    if (calories !== '' && calories !== null && calories !== undefined) {
      if (isNaN(parseInt(calories)) || parseInt(calories) < 0 || parseInt(calories) > 5000) {
        newErrors.calories = 'Calories từ 0 - 5000 Kcal.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setFormError('Vui lòng kiểm tra lại thông tin các ô bị lỗi màu đỏ.');
      return;
    }

    setFieldErrors({});
    setActionLoading(true);
    try {
      const payload = {
        code: code.trim() || null,
        name: name.trim(),
        categoryId: Number(categoryId),
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : null,
        discount: parseFloat(discount || 0),
        description: description.trim(),
        image: image || null,
        ingredients: ingredients.trim(),
        prepTime: prepTime ? parseInt(prepTime) : 15,
        calories: calories ? parseInt(calories) : null,
        spiciness,
        dishSize,
        notes: notes.trim(),
        status,
        available
      };

      if (selectedDish) {
        // Edit
        const res = await api.put(`/api/admin/dishes/${selectedDish.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật món ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchDishes();
        }
      } else {
        // Add
        const res = await api.post('/api/admin/dishes', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm món ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          setSortField('id');
          setSortOrder('desc');
          setPage(0);
          fetchDishes();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDish = async () => {
    if (!selectedDish) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/dishes/${selectedDish.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa món ăn ${selectedDish.name} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedDish(null);
        fetchDishes();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể xóa món ăn này.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(0);
  };

  return (
    <div className="relative">
      
      {/* Toast alert stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4.5 py-3.5 rounded-xl shadow-xl border text-sm max-w-sm transition-all duration-300 transform translate-x-0 ${
              t.type === 'success'
                ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]/30'
                : 'bg-red-800 text-white border-red-900'
            }`}
          >
            {t.type === 'success' ? (
              <svg className="h-5 w-5 shrink-0 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 shrink-0 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-semibold tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý Thực đơn (Menu)</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Xem danh sách món ăn, cài đặt giá, ưu đãi chiết khấu và quản lý tình trạng phục vụ.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm món ăn mới
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="restaurant-card p-4.5 mb-6 flex flex-col xl:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="w-full xl:w-80 relative">
          <input
            type="text"
            placeholder="Tìm theo tên món ăn, mô tả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#C5A059] shadow-xs placeholder:text-gray-400"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="w-full xl:w-auto flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Danh mục:</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value="All">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ẩn món (Inactive)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phục vụ:</span>
            <select
              value={availableFilter}
              onChange={(e) => { setAvailableFilter(e.target.value); setPage(0); }}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value="All">Tất cả</option>
              <option value="true">Sẵn sàng (Available)</option>
              <option value="false">Tạm hết (Sold out)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A]"
            >
              <option value={5}>5 món</option>
              <option value={10}>10 món</option>
              <option value={20}>20 món</option>
              <option value={50}>50 món</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh sách món ăn...</span>
        </div>
      ) : dishes.length === 0 ? (
        <div className="restaurant-card p-12 text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-sm font-medium">Không tìm thấy món ăn nào trong thực đơn.</span>
        </div>
      ) : (
        <div className="restaurant-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E2D9] text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Hình ảnh</th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-[#4A121A]" onClick={() => handleSort('name')}>
                    Tên món ăn {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3.5 px-5">Danh mục</th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-[#4A121A]" onClick={() => handleSort('price')}>
                    Đơn giá (VNĐ) {sortField === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3.5 px-5 cursor-pointer hover:text-[#4A121A]" onClick={() => handleSort('discount')}>
                    Chiết khấu {sortField === 'discount' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5">Phục vụ</th>
                  <th className="py-3.5 px-5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]/40 text-xs font-medium text-gray-700">
                {dishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#FAF7F2]/60 transition-colors group">
                    <td className="py-3 px-5">
                      {dish.image ? (
                        <img
                          src={dish.image.startsWith('http') ? dish.image : `http://localhost:8080${dish.image}`}
                          alt={dish.name}
                          className="h-11 w-16 rounded-lg object-cover object-center border border-[#C5A059]/30 shadow-xs"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'; }}
                        />
                      ) : (
                        <div className="h-11 w-16 rounded-lg bg-[#FAF7F2] text-[#C5A059] flex items-center justify-center border border-[#E8E2D9]">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-serif font-bold text-[#4A121A] text-sm group-hover:text-[#C5A059] transition-colors">
                        {dish.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-gray-400">
                          {dish.code || `DISH-${String(dish.id).padStart(3, '0')}`}
                        </span>
                        {dish.spiciness && dish.spiciness !== 'Không cay' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            {dish.spiciness}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center gap-1 bg-[#C5A059]/10 text-[#4A121A] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#C5A059]/30 uppercase tracking-wide">
                        {dish.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-bold font-mono text-gray-800 text-xs">
                      {Number(dish.price).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="py-3 px-5 font-bold font-mono text-[#1B3B2B]">
                      {dish.discount > 0 ? `${dish.discount}%` : '0%'}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          dish.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dish.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                        {dish.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          dish.available
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dish.available ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                        {dish.available ? 'Còn món' : 'Hết món'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Eye Detail Icon Button */}
                        <button
                          onClick={() => openDetailModal(dish)}
                          title="Xem chi tiết món ăn"
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] hover:border-[#C5A059] hover:bg-[#FAF7F2] transition-all cursor-pointer shadow-2xs"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Icon Button */}
                        <button
                          onClick={() => openEditModal(dish)}
                          title="Chỉnh sửa món ăn"
                          className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-600 hover:text-[#4A121A] hover:border-[#C5A059] hover:bg-[#FAF7F2] transition-all cursor-pointer shadow-2xs"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete Icon Button */}
                        <button
                          onClick={() => { setSelectedDish(dish); setShowDeleteConfirm(true); }}
                          title="Xóa món ăn"
                          className="p-1.5 rounded-lg border border-red-100 bg-white text-red-500 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer shadow-2xs"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="py-4.5 px-6 bg-[#FAF7F2]/60 border-t border-[#E8E2D9] flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Tổng số món ăn: <span className="font-bold text-[#4A121A]">{totalElements}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-[#E8E2D9] rounded-xl hover:bg-white text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="text-xs font-bold text-gray-600">
                Trang {page + 1} / {totalPages || 1}
              </span>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-[#E8E2D9] rounded-xl hover:bg-white text-gray-500 disabled:opacity-40 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add & Edit Modal (15 Detailed Fields - Viewport Fit & Clean Layout) */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in">
            {/* Header (Fixed) */}
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8E2D9] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#4A121A] text-[#C5A059] flex items-center justify-center font-bold text-sm shadow-sm">
                  {selectedDish ? '✎' : '＋'}
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#4A121A]">
                    {selectedDish ? `Chỉnh sửa món: ${name}` : 'Thêm món ăn mới vào thực đơn'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Quản lý đầy đủ 15 thông số món ăn (Giá bán, Giá vốn, Nguyên liệu, Độ cay, Kích cỡ...)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 cursor-pointer transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {formError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <svg className="h-4 w-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              <form id="dish-form" noValidate onSubmit={handleSaveDish} className="space-y-4">
                
                {/* Block 1: Ảnh & Định danh cơ bản */}
                <div className="p-4 bg-[#FAF7F2]/80 rounded-xl border border-[#E8E2D9]">
                  <h4 className="text-xs font-bold text-[#4A121A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Hình ảnh & Định danh cơ bản</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Dish Image Upload */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-[#C5A059]/40 bg-white shadow-inner shrink-0 flex items-center justify-center">
                        {image ? (
                          <img
                            src={image.startsWith('http') ? image : `http://localhost:8080${image}`}
                            alt="dish"
                            className="h-full w-full object-cover object-center"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'; }}
                          />
                        ) : (
                          <div className="h-full w-full text-gray-300 flex items-center justify-center bg-gray-50/20">
                            <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold animate-pulse">
                            Uploading...
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          id="dish-image-upload"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="dish-image-upload"
                          className="py-1 px-3 border border-[#C5A059] rounded-lg text-[11px] font-bold text-[#4A121A] hover:bg-[#C5A059]/10 uppercase tracking-wider cursor-pointer inline-block shadow-2xs"
                        >
                          Tải ảnh từ máy
                        </label>
                        <input
                          type="text"
                          placeholder="Hoặc dán URL ảnh..."
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="form-input text-[11px] py-1 px-2.5 rounded-lg border-gray-200 w-full"
                        />
                      </div>
                    </div>

                    {/* Mã món, Tên món, Danh mục */}
                    <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Mã món</label>
                        <input
                          type="text"
                          placeholder="VD: DISH-001"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, code: null }));
                          }}
                          className={`form-input text-xs py-1.5 ${fieldErrors.code ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                        />
                        {fieldErrors.code && (
                          <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.code}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Tên món ăn *</label>
                        <input
                          type="text"
                          placeholder="Filet Mignon Wagyu..."
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, name: null }));
                          }}
                          className={`form-input text-xs py-1.5 ${fieldErrors.name ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                        />
                        {fieldErrors.name && (
                          <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Danh mục *</label>
                        <select
                          value={categoryId}
                          onChange={(e) => {
                            setCategoryId(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, categoryId: null }));
                          }}
                          className={`form-input text-xs py-1.5 font-medium border-[#E8E2D9] focus:border-[#C5A059] bg-[#FAF7F2]/50 rounded-xl ${fieldErrors.categoryId ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                        >
                          <option value="" disabled>-- Chọn danh mục --</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        {fieldErrors.categoryId && (
                          <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.categoryId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Block 2: Thông số Giá & Thuộc tính kinh doanh */}
                <div className="p-4 bg-white rounded-xl border border-[#E8E2D9] shadow-2xs">
                  <h4 className="text-xs font-bold text-[#4A121A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-[#1B3B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Giá cả & Thuộc tính món ăn</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        placeholder="580000"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, price: null }));
                        }}
                        className={`form-input text-xs py-1.5 ${fieldErrors.price ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.price && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Giá vốn nội bộ (VNĐ)</label>
                      <input
                        type="number"
                        placeholder="250000"
                        value={costPrice}
                        onChange={(e) => {
                          setCostPrice(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, costPrice: null }));
                        }}
                        className={`form-input text-xs py-1.5 ${fieldErrors.costPrice ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.costPrice && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.costPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Chiết khấu (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={discount}
                        onChange={(e) => {
                          setDiscount(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, discount: null }));
                        }}
                        className={`form-input text-xs py-1.5 ${fieldErrors.discount ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.discount && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.discount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Độ cay</label>
                      <select
                        value={spiciness}
                        onChange={(e) => setSpiciness(e.target.value)}
                        className="form-input text-xs py-1.5 font-medium border-[#E8E2D9] focus:border-[#C5A059] bg-[#FAF7F2]/30 rounded-xl"
                      >
                        <option value="Không cay">Không cay (Mild)</option>
                        <option value="Cay nhẹ">Cay nhẹ (Low Spice)</option>
                        <option value="Cay vừa">Cay vừa (Medium Spice)</option>
                        <option value="Cay nồng">Cay nồng (Hot & Spicy)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Kích cỡ (Size)</label>
                      <select
                        value={dishSize}
                        onChange={(e) => setDishSize(e.target.value)}
                        className="form-input text-xs py-1.5 font-medium border-[#E8E2D9] focus:border-[#C5A059] bg-[#FAF7F2]/30 rounded-xl"
                      >
                        <option value="Nhỏ (S)">Kích cỡ Nhỏ (S)</option>
                        <option value="Vừa (M)">Kích cỡ Vừa (M)</option>
                        <option value="Lớn (L)">Kích cỡ Lớn (L)</option>
                        <option value="Combo">Combo Tiệc (Family)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Thời gian làm (phút)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={prepTime}
                        onChange={(e) => {
                          setPrepTime(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, prepTime: null }));
                        }}
                        className={`form-input text-xs py-1.5 ${fieldErrors.prepTime ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.prepTime && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.prepTime}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Calories (Kcal)</label>
                      <input
                        type="number"
                        placeholder="650"
                        value={calories}
                        onChange={(e) => {
                          setCalories(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, calories: null }));
                        }}
                        className={`form-input text-xs py-1.5 ${fieldErrors.calories ? 'is-invalid border-red-500 bg-red-50/30' : ''}`}
                      />
                      {fieldErrors.calories && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">{fieldErrors.calories}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Trạng thái *</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-input text-xs py-1.5 font-bold text-[#4A121A] border-[#E8E2D9] focus:border-[#C5A059] bg-[#FAF7F2]/30 rounded-xl"
                      >
                        <option value="ACTIVE">Hoạt động (Active)</option>
                        <option value="INACTIVE">Tạm ẩn (Inactive)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={available}
                        onChange={(e) => setAvailable(e.target.checked)}
                        className="h-4 w-4 rounded text-[#4A121A] focus:ring-[#4A121A] cursor-pointer"
                      />
                      <span>Có bán (Sẵn sàng phục vụ cho khách)</span>
                    </label>
                    <span className="text-[10px] text-gray-400">Bỏ chọn nếu món ăn tạm thời hết hàng (Sold out)</span>
                  </div>
                </div>

                {/* Block 3: Mô tả, Nguyên liệu & Ghi chú */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Mô tả món ăn</label>
                    <textarea
                      rows={2}
                      placeholder="Mô tả thành phần, hương vị, cách chế biến..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="form-input text-xs py-1.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Nguyên liệu chế biến</label>
                    <textarea
                      rows={2}
                      placeholder="VD: Thăn bò Wagyu 200g, Nấm Truffle, Vang đỏ..."
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      className="form-input text-xs py-1.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Ghi chú nội bộ</label>
                  <input
                    type="text"
                    placeholder="Ghi chú dành riêng cho Đầu bếp / Quản lý..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input text-xs py-1.5"
                  />
                </div>

              </form>
            </div>

            {/* Footer Buttons (Fixed Sticky at Bottom) */}
            <div className="px-6 py-3 bg-[#FAF7F2] border-t border-[#E8E2D9] flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="btn-secondary py-1.5 px-4 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="dish-form"
                disabled={actionLoading || uploadingImage}
                className="btn-primary py-1.5 px-5 text-xs uppercase tracking-wider font-bold shadow-md"
              >
                {actionLoading ? 'Đang lưu...' : 'Lưu món ăn'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl p-6 animate-fade-in text-center">
            
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-1M4 7h16" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa món ăn</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn món <span className="font-bold text-gray-800">{selectedDish?.name}</span> khỏi thực đơn nhà hàng?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedDish(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteDish}
                disabled={actionLoading}
                className="btn-primary bg-gradient-to-r from-red-700 to-red-800 border-red-800 text-white py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                {actionLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dish View Details Modal (15 Detailed Fields) */}
      {showDetailModal && detailDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2 bg-[#4A121A]"></div>
            
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/40 text-[#4A121A] flex items-center justify-center font-bold">
                    <svg className="h-5 w-5 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#4A121A]">{detailDish.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-[#C5A059] font-bold">
                        {detailDish.code || `DISH-${String(detailDish.id).padStart(3, '0')}`}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-500">{detailDish.categoryName}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="mt-5 space-y-4">
                {/* Image & Quick Stats */}
                <div className="flex flex-col sm:flex-row gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9]">
                  <div className="h-32 w-48 rounded-xl overflow-hidden border border-[#C5A059]/40 bg-white shrink-0 shadow-xs">
                    {detailDish.image ? (
                      <img
                        src={detailDish.image.startsWith('http') ? detailDish.image : `http://localhost:8080${detailDish.image}`}
                        alt={detailDish.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'; }}
                      />
                    ) : (
                      <div className="h-full w-full text-gray-300 flex items-center justify-center">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block">Giá bán kinh doanh:</span>
                      <span className="font-bold text-[#4A121A] text-sm">{Number(detailDish.price).toLocaleString('vi-VN')} VNĐ</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block">Giá vốn nội bộ:</span>
                      <span className="font-bold text-gray-700">{detailDish.costPrice ? `${Number(detailDish.costPrice).toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block">Chiết khấu (%):</span>
                      <span className="font-bold text-emerald-700">{detailDish.discount || 0}%</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block">Trạng thái:</span>
                      <span className="font-bold text-gray-700">{detailDish.status === 'ACTIVE' ? 'Hoạt động (Active)' : 'Tạm ẩn (Inactive)'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block">Kích cỡ (Size):</span>
                      <span className="font-semibold text-gray-800">{detailDish.dishSize || 'Vừa (M)'}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 font-medium block">Độ cay:</span>
                      <span className="font-semibold text-gray-800">{detailDish.spiciness || 'Không cay'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#E8E2D9]">
                  <div>
                    <span className="text-gray-400 font-medium block">Thời gian chế biến:</span>
                    <span className="font-semibold text-gray-800">{detailDish.prepTime || 15} phút</span>
                  </div>

                  <div>
                    <span className="text-gray-400 font-medium block">Calories:</span>
                    <span className="font-semibold text-gray-800">{detailDish.calories ? `${detailDish.calories} Kcal` : 'Tùy chọn'}</span>
                  </div>
                </div>

                {detailDish.description && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Mô tả món ăn:</label>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-normal leading-relaxed">
                      {detailDish.description}
                    </div>
                  </div>
                )}

                {detailDish.ingredients && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Nguyên liệu chế biến:</label>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-normal leading-relaxed">
                      {detailDish.ingredients}
                    </div>
                  </div>
                )}

                {detailDish.notes && (
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Ghi chú nội bộ:</label>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 font-medium">
                      {detailDish.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-[#E8E2D9] flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn-secondary py-1.5 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
