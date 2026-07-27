import React, { useState } from 'react';
import api from '../services/api';
import { PenSquare, Star } from 'lucide-react';

export default function ReviewsSection({ reviews, onReviewSubmitted }) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!customerName.trim()) return setError('Vui lòng nhập tên của bạn.');
    if (!comment.trim()) return setError('Vui lòng nhập lời nhận xét.');

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        rating: Number(rating),
        comment: comment.trim()
      };

      const res = await api.post('/api/public/reviews', payload);
      if (res.data && res.data.success) {
        setSuccessMsg('Cảm ơn bạn đã gửi đánh giá! Nhận xét đã được ghi nhận.');
        setCustomerName('');
        setComment('');
        setRating(5);
        if (onReviewSubmitted) onReviewSubmitted();
        setTimeout(() => {
          setShowFormModal(false);
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Không thể gửi đánh giá lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="py-16 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-widest block mb-1">
              Cảm Nhận Thực Khách
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#4A2810]">
              Đánh Giá Từ Khách Hàng
            </h2>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="bg-[#8C3A27] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A3432D] transition-all shadow-md active:scale-95 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <PenSquare className="w-4 h-4" /> Viết Nhận Xét Mới
          </button>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-3xl border border-[#4A2810]/10 shadow-md flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold mb-3">
                    {'★'.repeat(rev.rating || 5)}
                  </div>
                  <p className="text-xs text-[#4A2810]/80 font-light italic leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#4A2810]/10">
                  <div className="h-10 w-10 rounded-full bg-[#8C3A27] text-white font-bold flex items-center justify-center text-sm font-serif">
                    {rev.customerName ? rev.customerName.charAt(0) : 'K'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#4A2810] font-serif">{rev.customerName}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">Thực khách thân thiết</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-10 text-center text-xs text-gray-400 font-semibold">
              Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nhận!
            </div>
          )}
        </div>

      </div>

      {/* Review Submission Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#E07A5F]/30 shadow-2xl p-7 relative animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-[#4A2810]/10 mb-4">
              <h3 className="text-lg font-bold font-serif text-[#4A2810]">Gửi Nhận Xét Đánh Giá</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên của bạn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Đánh giá sao *</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="form-input text-xs py-2.5"
                >
                  <option value={5}>★★★★★ (5 sao - Tuyệt vời)</option>
                  <option value={4}>★★★★☆ (4 sao - Rất tốt)</option>
                  <option value={3}>★★★☆☆ (3 sao - Khá tốt)</option>
                  <option value={2}>★★☆☆☆ (2 sao - Trung bình)</option>
                  <option value={1}>★☆☆☆☆ (1 sao - Cần cải thiện)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lời nhận xét *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chia sẻ cảm nhận của bạn về hương vị món ăn và phong cách phục vụ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input text-xs py-2.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn-secondary py-2 px-4 text-xs font-semibold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8C3A27] text-white py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#A3432D]"
                >
                  Gửi Nhận Xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
