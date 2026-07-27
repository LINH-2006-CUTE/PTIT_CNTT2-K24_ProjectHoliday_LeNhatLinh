import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Send,
  Bell,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  UserCheck,
  ShieldCheck,
  ListChecks,
  Clock,
  RotateCw,
  ChefHat,
  Utensils,
  CreditCard,
  PackageCheck,
  FileText
} from 'lucide-react';

export default function AdminNotificationManagement() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('TRACK_RECEIPTS'); // TRACK_RECEIPTS, SEND_BROADCAST

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Sent Notifications History & Approval Modal
  const [sentHistory, setSentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterRole, setFilterRole] = useState('ROLE_ADMIN');

  // Approval response state for specific request
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [adminResponseText, setAdminResponseText] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchSentHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/staff-notifications/manager/history');
      if (res.data && res.data.data) {
        setSentHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSentHistory();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Vui lòng nhập Tiêu Đề Thông Báo Chỉ Đạo.';
    } else if (title.trim().length < 5) {
      errors.title = 'Tiêu đề thông báo phải từ 5 ký tự trở lên.';
    }

    if (!message.trim()) {
      errors.message = 'Vui lòng nhập Nội Dung Chi Tiết.';
    } else if (message.trim().length < 10) {
      errors.message = 'Nội dung thông báo phải có ít nhất 10 ký tự.';
    }

    return errors;
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setToastMessage(null);

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const res = await api.post('/api/staff-notifications/send', {
        title: title.trim(),
        message: message.trim(),
        targetRole,
        senderName: user?.fullName || 'Quản Trị Viên (Admin System)',
        senderRole: 'ROLE_ADMIN'
      });

      if (res.data && res.data.success) {
        showToast(`Phát thông báo từ Admin tới bộ phận [${targetRole}] thành công!`);
        setTitle('');
        setMessage('');
        setFieldErrors({});
        fetchSentHistory();
        setActiveSubTab('TRACK_RECEIPTS');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRestockRequest = async (id) => {
    try {
      const responseNote = adminResponseText.trim() || 'Admin đã phê duyệt đơn nhập bổ sung kho nguyên liệu. Đã chuyển ngân sách nhập hàng cho nhà cung cấp.';
      const res = await api.put(`/api/staff-notifications/${id}/confirm`, {
        email: user?.email || 'admin@restaurant.com',
        fullName: user?.fullName || 'Quản Trị Viên (Admin System)',
        adminResponse: responseNote
      });

      if (res.data && res.data.success) {
        showToast('Admin đã phê duyệt yêu cầu nhập hàng và gửi phản hồi tới Quản lý!');
        setSelectedNotif(null);
        setAdminResponseText('');
        fetchSentHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'ALL': return 'Tất Cả Nhân Viên & Quản Lý';
      case 'ROLE_ADMIN': return 'Yêu Cầu Gửi Cho Admin';
      case 'ROLE_MANAGER': return 'Bộ Phận Quản Lý (Managers)';
      case 'ROLE_CHEF': return 'Bộ Phận Bếp (Chefs)';
      case 'ROLE_WAITER': return 'Bộ Phận Phục Vụ (Waiters)';
      case 'ROLE_CASHIER': return 'Bộ Phận Thu Ngân (Cashiers)';
      default: return role;
    }
  };

  const filteredHistory = sentHistory.filter((item) => {
    if (filterRole === 'ALL') return true;
    return item.targetRole === filterRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[9999] bg-[#4A121A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 text-xs font-bold uppercase tracking-wider animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#C5A059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Sub-tab navigation */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E2D9] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest block mb-1">
            Admin System Approval & Broadcast Hub
          </span>
          <h2 className="text-2xl font-bold font-serif text-[#4A121A]">
            Duyệt Đề Xuất Nhập Hàng & Phát Thông Báo Chỉ Đạo
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveSubTab('TRACK_RECEIPTS');
              fetchSentHistory();
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'TRACK_RECEIPTS'
                ? 'bg-[#4A121A] text-white border border-[#C5A059]/50 shadow-md'
                : 'bg-[#FAF7F2] text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ListChecks className="w-4 h-4 text-[#C5A059]" />
            <span>Yêu Cầu Cần Duyệt & Nhật Ký ({sentHistory.filter(n => n.targetRole === 'ROLE_ADMIN' && !n.isConfirmed).length} chờ duyệt)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('SEND_BROADCAST')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'SEND_BROADCAST'
                ? 'bg-[#4A121A] text-white border border-[#C5A059]/50 shadow-md'
                : 'bg-[#FAF7F2] text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Send className="w-4 h-4 text-[#C5A059]" />
            <span>Soạn Thông Báo Mới</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: APPROVAL TRACKER & HISTORY */}
      {activeSubTab === 'TRACK_RECEIPTS' && (
        <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold font-serif text-lg text-[#4A121A] flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#C5A059]" /> Danh Sách Yêu Cầu Duyệt Nhập Hàng Từ Quản Lý
              </h3>
              <p className="text-xs text-gray-500 mt-1">Admin kiểm tra chi tiết các mặt hàng sắp hết kho do Quản lý đề xuất và bấm phê duyệt</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2.5 rounded-xl bg-[#FAF7F2] border border-gray-300 text-xs font-bold cursor-pointer"
              >
                <option value="ROLE_ADMIN">🛡️ Chỉ Yêu Cầu Duyệt Của Admin (Restock Requests)</option>
                <option value="ALL">Tất Cả Đối Tượng Thông Báo</option>
                <option value="ROLE_MANAGER">Chỉ Quản Lý</option>
                <option value="ROLE_CHEF">Chỉ Bộ Phận Bếp</option>
                <option value="ROLE_WAITER">Chỉ Phục Vụ</option>
                <option value="ROLE_CASHIER">Chỉ Thu Ngân</option>
              </select>

              <button
                onClick={fetchSentHistory}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-gray-300 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-1.5 text-gray-700"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Tải Lại</span>
              </button>
            </div>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12 text-gray-500 font-bold text-sm">Đang tải danh sách yêu cầu...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm font-bold">
              Chưa có dữ liệu yêu cầu nào cần duyệt.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl border space-y-4 transition-all shadow-md ${
                    !item.isConfirmed && item.targetRole === 'ROLE_ADMIN'
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-gray-200 bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-[#4A121A] text-[#C5A059] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{formatRoleLabel(item.targetRole)}</span>
                      </span>
                      <h4 className="font-bold font-serif text-base text-[#4A121A]">{item.title}</h4>
                    </div>

                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                      item.isConfirmed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                    }`}>
                      {item.isConfirmed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>✓ ĐÃ DUYỆT NHẬP HÀNG</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          <span>⚠️ CHỜ ADMIN DUYỆT NHẬP HÀNG</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Main Request Content */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-700 bg-white p-4 rounded-2xl border border-gray-200 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    {/* Detailed Restock Items List if available */}
                    {item.itemsDetails && (
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                        <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-700" /> Chi Tiết Các Mặt Hàng Cần Duyệt Nhập Kho:
                        </span>
                        <pre className="text-xs font-mono text-amber-950 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                          {item.itemsDetails}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs border-t border-gray-200/80">
                    <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Gửi bởi: <strong className="text-gray-700">{item.senderName}</strong> • {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                    </span>

                    {item.isConfirmed ? (
                      <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-300 text-emerald-950 font-bold text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Đã phê duyệt bởi: <strong>{item.confirmedByName}</strong> ({item.confirmedAt ? new Date(item.confirmedAt).toLocaleTimeString('vi-VN') : ''})</span>
                        </div>
                        {item.adminResponse && (
                          <div className="text-[11px] text-emerald-900 font-normal italic bg-white p-2 rounded-xl border border-emerald-200 mt-1">
                            💬 Phản hồi Admin: "{item.adminResponse}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {selectedNotif === item.id ? (
                          <div className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-red-300 shadow-lg w-full sm:w-96">
                            <label className="text-[11px] font-bold text-gray-700">Nhập phản hồi/ghi chú duyệt nhập hàng cho Quản lý:</label>
                            <input
                              type="text"
                              placeholder="VD: Đã duyệt chi ngân sách nhập 10kg Wagyu và 10kg Cá Tầm. Hàng về trong ca chiều."
                              value={adminResponseText}
                              onChange={(e) => setAdminResponseText(e.target.value)}
                              className="p-2 text-xs rounded-xl bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]"
                            />
                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                onClick={() => setSelectedNotif(null)}
                                className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-100"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleApproveRestockRequest(item.id)}
                                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-md cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Phê Duyệt & Gửi Phản Hồi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedNotif(item.id);
                              setAdminResponseText('Đã duyệt chi ngân sách nhập hàng bổ sung. Đơn hàng đã gửi cho nhà cung cấp.');
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-[#4A121A] hover:bg-[#340b12] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]/40"
                          >
                            <PackageCheck className="w-4 h-4 text-[#C5A059]" /> Xem Chi Tiết & Duyệt Nhập Hàng
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: FORM SOẠN THÔNG BÁO ADMIN */}
      {activeSubTab === 'SEND_BROADCAST' && (
        <div className="bg-white p-8 rounded-3xl border border-[#E8E2D9] shadow-xl space-y-6">
          <h3 className="font-bold font-serif text-lg text-[#4A121A] border-b pb-3 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#C5A059]" /> Soạn Thông Báo Khẩn Cấp Từ Admin
          </h3>

          <form onSubmit={handleSendNotification} noValidate className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Đối Tượng Nhận Thông Báo *</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#FAF7F2] border border-gray-300 text-xs font-bold cursor-pointer focus:outline-none focus:border-[#4A121A]"
              >
                <option value="ALL">Tất Cả Quản Lý & Nhân Viên Hệ Thống (All Roles)</option>
                <option value="ROLE_MANAGER">Bộ Phận Quản Lý (Managers Only)</option>
                <option value="ROLE_CHEF">Bộ Phận Bếp (Chefs / KDS)</option>
                <option value="ROLE_WAITER">Bộ Phận Phục Vụ (Waiters)</option>
                <option value="ROLE_CASHIER">Bộ Phận Thu Ngân (Cashiers / POS)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Tiêu Đề Thông Báo Chỉ Đạo *</label>
              <input
                type="text"
                placeholder="VD: Chỉ Đạo Khẩn - Kiểm tra đối soát tài chính ca tối"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: null });
                }}
                className={`w-full p-3.5 rounded-xl text-xs font-bold transition-all ${
                  fieldErrors.title
                    ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                    : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                }`}
              />
              {fieldErrors.title && (
                <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.title}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nội Dung Chi Tiết *</label>
              <textarea
                rows="5"
                placeholder="Nhập nội dung chỉ đạo vận hành, rà soát kho, thay đổi quy trình..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: null });
                }}
                className={`w-full p-3.5 rounded-xl text-xs font-bold transition-all ${
                  fieldErrors.message
                    ? 'bg-red-50 border-2 border-red-500 focus:outline-none'
                    : 'bg-[#FAF7F2] border border-gray-300 focus:outline-none focus:border-[#4A121A]'
                }`}
              />
              {fieldErrors.message && (
                <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#4A121A] text-white text-xs font-bold hover:bg-[#340b12] transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 border border-[#C5A059]/40 uppercase tracking-wider"
            >
              <Send className="w-4 h-4 text-[#C5A059]" /> Phát Thông Báo Admin Tức Thời
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
