import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Form
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDishes, setCategoryDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  const openDetailModal = async (cat) => {
    setSelectedCategory(cat);
    setShowDetailModal(true);
    setLoadingDishes(true);
    setCategoryDishes([]);
    try {
      const res = await api.get('/api/public/menu', { params: { size: 100 } });
      if (res.data && res.data.success) {
        const allDishes = res.data.data.content || [];
        const filtered = allDishes.filter(
          (d) => (d.category && d.category.id === cat.id) || 
                 (d.category && d.category.name.toLowerCase().trim() === cat.name.toLowerCase().trim())
        );
        setCategoryDishes(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDishes(false);
    }
  };

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        page,
        size,
        sort: `${sortField},${sortOrder}`
      };

      const res = await api.get('/api/admin/categories', { params });
      if (res.data && res.data.success) {
        setCategories(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh mục món ăn.');
      showToast('Tải danh mục thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, sortField, sortOrder, page, size]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/admin/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setImage(res.data.data);
        showToast('Tải ảnh lên thành công.', 'success');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Tải ảnh lên thất bại.';
      setFormError(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setFormError('');
    setFieldErrors({});
    setShowAddEditModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = {};

    if (!name || !name.trim()) {
      newErrors.name = 'Vui lòng nhập Tên danh mục.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setActionLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image || null
      };

      if (selectedCategory) {
        // Edit
        const res = await api.put(`/api/admin/categories/${selectedCategory.id}`, payload);
        if (res.data && res.data.success) {
          showToast(`Cập nhật danh mục ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          fetchCategories();
        }
      } else {
        // Add
        const res = await api.post('/api/admin/categories', payload);
        if (res.data && res.data.success) {
          showToast(`Thêm danh mục ${name} thành công.`, 'success');
          setShowAddEditModal(false);
          setPage(0);
          fetchCategories();
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục.';
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/api/admin/categories/${selectedCategory.id}`);
      if (res.data && res.data.success) {
        showToast(`Xóa danh mục ${selectedCategory.name} thành công.`, 'success');
        setShowDeleteConfirm(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể xóa danh mục này. Hãy đảm bảo danh mục không chứa món ăn nào.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative">
      
      {/* Toast Stack */}
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
          <h2 className="text-3xl font-bold font-serif text-[#4A121A]">Quản lý danh mục món ăn</h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-wider">
            Phân loại thực đơn nhà hàng (Khai vị, Món chính, Tráng miệng, Đồ uống...).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm danh mục mới
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="restaurant-card p-4.5 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Tìm theo tên danh mục, mô tả..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-[#C5A059] shadow-xs placeholder:text-gray-400"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hiển thị:</span>
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl text-xs px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-[#4A121A] cursor-pointer"
          >
            <option value={6}>6 danh mục / trang</option>
            <option value={12}>12 danh mục / trang</option>
            <option value={24}>24 danh mục / trang</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C5A059] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải danh mục...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="restaurant-card p-12 text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-sm font-medium">Chưa có danh mục nào được thiết lập.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="restaurant-card overflow-hidden flex flex-col justify-between group hover:border-[#C5A059]/50 transition-all duration-300">
                <div>
                  <div className="h-48 w-full bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={cat.image.startsWith('http') ? cat.image : `http://localhost:8080${cat.image}`}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#C5A059]">
                        <svg className="h-12 w-12 font-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <button
                        onClick={() => openDetailModal(cat)}
                        className="p-2 bg-white/90 hover:bg-[#4A121A] hover:text-white text-gray-700 rounded-xl shadow-md cursor-pointer transition-all border border-[#E8E2D9]"
                        title="Xem chi tiết danh mục"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-xl shadow-md cursor-pointer transition-all border border-[#E8E2D9]"
                        title="Chỉnh sửa"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setSelectedCategory(cat); setShowDeleteConfirm(true); }}
                        className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-xl shadow-md cursor-pointer transition-all border border-red-100"
                        title="Xóa danh mục"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 cursor-pointer" onClick={() => openDetailModal(cat)}>
                    <h4 className="text-lg font-bold font-serif text-[#4A121A] hover:text-[#C5A059] transition-colors">{cat.name}</h4>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed h-12 overflow-hidden text-ellipsis">
                      {cat.description || 'Chưa cập nhật mô tả cho danh mục này.'}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-[#FAF7F2]/60 border-t border-[#E8E2D9]/60 flex justify-between items-center text-xs font-medium">
                  <span className="font-mono text-[10px] text-gray-400">ID: CAT-{String(cat.id).padStart(3, '0')}</span>
                  <button
                    onClick={() => openDetailModal(cat)}
                    className="text-[#4A121A] hover:text-[#C5A059] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 py-4.5 px-6 bg-[#FAF7F2]/60 rounded-2xl border border-[#E8E2D9] flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Tổng số danh mục: <span className="font-bold text-[#4A121A]">{totalElements}</span>
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
        </>
      )}

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#C5A059]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-2 border-b border-[#E8E2D9]">
                <h3 className="text-xl font-bold font-serif text-[#4A121A]">
                  {selectedCategory ? `Sửa danh mục: ${name}` : 'Thêm danh mục mới'}
                </h3>
                <button onClick={() => setShowAddEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              <form noValidate onSubmit={handleSaveCategory} className="space-y-4">
                
                {/* Upload Image Section */}
                <div className="flex flex-col items-center gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9]">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#C5A059]/40 bg-[#FAF7F2] shadow-inner flex items-center justify-center">
                    {image ? (
                      <img
                        src={image.startsWith('http') ? image : `http://localhost:8080${image}`}
                        alt="preview"
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full text-gray-300 flex items-center justify-center bg-gray-55/30">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white font-bold animate-pulse">
                        Đang tải ảnh lên...
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full text-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="category-image-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className="inline-block py-2 px-4 border border-[#C5A059] rounded-lg text-xs font-bold text-[#4A121A] hover:bg-[#C5A059]/10 uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Tải ảnh danh mục
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tên danh mục *</label>
                  <input
                    type="text"
                    placeholder="Món khai vị, Đồ uống..."
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, name: null }));
                    }}
                    className={`form-input text-xs py-2.5 ${fieldErrors.name ? 'is-invalid' : ''}`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
                  <textarea
                    rows={3}
                    placeholder="Giới thiệu khái quát về các món ăn thuộc danh mục này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input text-xs py-2.5"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3.5 border-t border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingImage}
                    className="btn-primary py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
                  >
                    {actionLoading ? 'Đang lưu...' : 'Lưu danh mục'}
                  </button>
                </div>

              </form>
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

            <h3 className="text-lg font-bold text-[#4A121A] font-serif">Xóa danh mục</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn danh mục <span className="font-bold text-gray-800">{selectedCategory?.name}</span>? Không thể xóa danh mục nếu đang có món ăn trực thuộc.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setSelectedCategory(null); }}
                className="btn-secondary py-2 px-4.5 text-xs uppercase tracking-wider font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={actionLoading}
                className="btn-primary bg-gradient-to-r from-red-700 to-red-800 border-red-800 text-white py-2 px-5 text-xs uppercase tracking-wider font-bold shadow-lg"
              >
                {actionLoading ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Category Detail Modal */}
      {showDetailModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-[#E8E2D9] shadow-2xl relative overflow-hidden animate-fade-in my-8">
            <div className="h-2.5 bg-[#4A121A]"></div>
            
            <div className="p-7">
              <div className="mb-6 flex justify-between items-center pb-4 border-b border-[#E8E2D9]">
                <div className="flex items-center gap-3">
                  <span className="bg-[#4A121A]/10 text-[#4A121A] text-[10px] font-extrabold px-2.5 py-1 rounded-full font-mono uppercase border border-[#4A121A]/20">
                    CAT-{String(selectedCategory.id).padStart(3, '0')}
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-[#4A121A]">
                    {selectedCategory.name}
                  </h3>
                </div>
                
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Category Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <svg className="h-3.5 w-3.5 text-[#C5A059] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Tên danh mục</span>
                  </div>
                  <span className="text-xs font-bold text-[#4A121A] truncate block">
                    {selectedCategory.name}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <svg className="h-3.5 w-3.5 text-[#1B3B2B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Số lượng món ăn</span>
                  </div>
                  <span className="text-xs font-bold text-[#1B3B2B] block">
                    {categoryDishes.length} món ăn
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <svg className="h-3.5 w-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Ngày tạo</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 block">
                    {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString('vi-VN') : '20/07/2026'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <svg className="h-3.5 w-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Người tạo</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 truncate block">
                    {selectedCategory.createdBy || 'Quản trị viên (Admin)'}
                  </span>
                </div>
              </div>

              {/* Description Block */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 mb-5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                  <svg className="h-3.5 w-3.5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Mô tả danh mục</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {selectedCategory.description || 'Chưa cập nhật thông tin mô tả chi tiết cho danh mục này.'}
                </p>
              </div>

              {/* Banner Image Preview */}
              {selectedCategory.image && (
                <div className="mb-5 h-40 w-full rounded-2xl overflow-hidden border border-[#E8E2D9] relative shadow-inner">
                  <img
                    src={selectedCategory.image.startsWith('http') ? selectedCategory.image : `http://localhost:8080${selectedCategory.image}`}
                    alt={selectedCategory.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs text-white font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                      Hình ảnh đại diện danh mục
                    </span>
                  </div>
                </div>
              )}

              {/* Dishes List in Category */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#C5A059] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Danh sách món ăn thuộc danh mục ({categoryDishes.length})</span>
                  </h4>
                </div>

                {loadingDishes ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-medium">
                    Đang tải danh sách món ăn...
                  </div>
                ) : categoryDishes.length === 0 ? (
                  <div className="p-6 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] text-center text-xs text-gray-500 italic">
                    Chưa có món ăn nào thuộc danh mục này.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {categoryDishes.map((dish) => (
                      <div
                        key={dish.id}
                        className="p-3 bg-[#FAF7F2]/80 hover:bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.image && dish.image.startsWith('http') ? dish.image : `http://localhost:8080${dish.image}`}
                            alt={dish.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-200"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'; }}
                          />
                          <div>
                            <div className="text-xs font-bold text-[#4A121A]">{dish.name}</div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{dish.description || 'Chưa có mô tả.'}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-[#1B3B2B]">
                            {dish.price ? `${Number(dish.price).toLocaleString()} VNĐ` : '0 VNĐ'}
                          </div>
                          {dish.discount > 0 && (
                            <span className="text-[10px] text-red-600 font-extrabold bg-red-50 px-1.5 py-0.5 rounded">
                              Giảm {dish.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-3.5 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedCategory);
                  }}
                  className="btn-primary py-2 px-4.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Chỉnh sửa danh mục</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="btn-secondary py-2 px-4.5 text-xs font-semibold uppercase tracking-wider"
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
