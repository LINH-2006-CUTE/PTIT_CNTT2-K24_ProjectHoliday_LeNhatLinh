import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CustomerNavbar from '../components/CustomerNavbar';
import CustomerFooter from '../components/CustomerFooter';
import { useAuth } from '../context/AuthContext';
import { Star, Pencil, Trash2, User, Sparkles, MessageSquarePlus } from 'lucide-react';

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchPublicReviews = async () => {
    try {
      const res = await api.get('/api/public/reviews');
      if (res.data && res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyReviews = async () => {
    if (!user || !user.email) return;
    try {
      const res = await api.get('/api/customer/reviews/my-reviews', {
        params: { email: user.email }
      });
      if (res.data && res.data.success) {
        setMyReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchPublicReviews(), fetchMyReviews()]).finally(() => setLoading(false));
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!comment.trim()) {
      return setFormError('Vui lòng nhập nội dung nhận xét của bạn.');
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update Review
        await api.put(`/api/customer/reviews/${editingId}`, {
          rating,
          comment: comment.trim(),
          imageUrl: imageUrl.trim() ? imageUrl.trim() : null
        });
        showToast('Cập nhật đánh giá thành công!');
        setEditingId(null);
      } else {
        // Create Review
        await api.post('/api/customer/reviews', {
          rating,
          comment: comment.trim(),
          imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
          customerName: user?.fullName || 'Khách hàng L\'ÉCLAT',
          customerEmail: user?.email
        });
        showToast('Cảm ơn bạn đã gửi đánh giá trải nghiệm!');
      }

      setComment('');
      setImageUrl('');
      setRating(5);
      fetchPublicReviews();
      fetchMyReviews();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Không thể gửi nhận xét. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (rev) => {
    setEditingId(rev.id);
    setRating(rev.rating);
    setComment(rev.comment);
    setImageUrl(rev.imageUrl || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      const res = await api.delete(`/api/customer/reviews/${id}`);
      if (res.data && res.data.success) {
        showToast('Đã xóa đánh giá.');
        fetchPublicReviews();
        fetchMyReviews();
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xóa đánh giá.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2625] font-sans relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[9999] bg-[#8C3A27] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E07A5F]/30 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <CustomerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
            L'ÉCLAT Customer Testimonials
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#4A2810]">
            Đánh Giá & Trải Nghiệm Thực Khách
          </h1>
          <p className="text-xs text-gray-500 font-light mt-1">Chia sẻ trải nghiệm ẩm thực 5 sao của bạn cùng thương hiệu L'ÉCLAT.</p>
          <div className="h-1 w-16 bg-[#8C3A27] mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Submit Review Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-[#4A2810]/10 shadow-xl mb-12 animate-fade-in">
          
          <h3 className="text-lg font-bold font-serif text-[#4A2810] mb-4 flex items-center gap-2">
            {editingId ? (
              <>
                <Pencil className="w-5 h-5 text-[#E07A5F]" /> Chỉnh Sửa Đánh Giá
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-5 h-5 text-[#E07A5F]" /> Gửi Đánh Giá Trải Nghiệm Mới
              </>
            )}
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            
            {/* Interactive Star Rating */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chấm điểm từ 1 đến 5 sao *</label>
              <div className="flex gap-2 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-125 p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lời nhận xét của bạn *</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ về hương vị món ăn, không gian nhà hàng và thái độ phục vụ..."
                className="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl p-4 text-xs focus:outline-none focus:border-[#8C3A27]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Đường dẫn hình ảnh (Không bắt buộc)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#FAF7F2] border border-gray-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-[#8C3A27]"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#8C3A27] text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : editingId ? 'Cập Nhật Đánh Giá' : 'Gửi Đánh Giá Ngay'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setComment(''); setImageUrl(''); setRating(5); }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-xs font-bold uppercase hover:bg-gray-300 cursor-pointer"
                >
                  Hủy Chỉnh Sửa
                </button>
              )}
            </div>

          </form>
        </div>

        {/* My Reviews Section */}
        {myReviews.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold font-serif text-[#4A2810] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8C3A27]" /> Đánh Giá Của Bạn ({myReviews.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myReviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-3xl p-6 border border-[#E07A5F]/30 shadow-md space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(rev)}
                        className="p-1.5 text-gray-400 hover:text-[#8C3A27] transition-all cursor-pointer"
                        title="Sửa đánh giá"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-all cursor-pointer"
                        title="Xóa đánh giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A2810]/80 italic">"{rev.comment}"</p>

                  {rev.imageUrl && (
                    <img src={rev.imageUrl} alt="Review attachment" className="h-28 w-full object-cover rounded-2xl border border-gray-100" />
                  )}

                  <span className="text-[10px] text-gray-400 font-mono block">
                    Đăng ngày: {new Date(rev.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Reviews Grid */}
        <div>
          <h3 className="text-xl font-bold font-serif text-[#4A2810] mb-6">
            Tất Cả Nhận Xét Từ Thực Khách
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              Đang tải nhận xét thực khách...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl text-center text-xs text-gray-400 font-semibold border border-gray-200">
              Chưa có nhận xét nào. Hãy là người đầu tiên để lại đánh giá!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-3xl p-6 border border-[#4A2810]/10 shadow-lg space-y-4 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#8C3A27] text-white flex items-center justify-center font-bold text-sm">
                      {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'K'}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#4A2810]">{rev.customerName || 'Khách hàng L\'ÉCLAT'}</h5>
                      <div className="flex gap-1 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {rev.imageUrl && (
                    <img src={rev.imageUrl} alt="Customer culinary photo" className="h-36 w-full object-cover rounded-2xl border border-gray-100" />
                  )}

                  <span className="text-[10px] text-gray-400 font-mono block pt-2 border-t border-gray-100">
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <CustomerFooter />
    </div>
  );
}
