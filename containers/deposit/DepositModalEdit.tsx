import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface DepositWithUser {
  id: string;
  amount: number;
  slipImage?: {
    id: string;
    imageUrl: string;
    nameFile: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rate: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
}

interface DepositModalEditProps {
  data: DepositWithUser;
  onUpdated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const DepositModalEdit: React.FC<DepositModalEditProps> = ({
  data,
  onUpdated,
  triggerClassName,
  triggerText = 'แก้ไขข้อมูล',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    status: '',
    comment: '',
    amount: '',
    rate: '1.0',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      status: data?.status ?? 'PENDING',
      comment: data?.comment ?? '',
      amount: String(data?.amount ?? ''),
      rate: String(data?.rate ?? ''),
    });
  }, [isOpen, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.status) return 'กรุณาเลือกสถานะ';
    if (!form.amount.trim()) return 'กรุณากรอกจำนวนเงิน';
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0';
    if (!form.rate.trim()) return 'กรุณากรอกอัตราแลกเปลี่ยน';
    if (isNaN(Number(form.rate)) || Number(form.rate) <= 0) return 'อัตราแลกเปลี่ยนต้องเป็นตัวเลขที่มากกว่า 0';
    return '';
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        status: form.status,
        comment: form.comment.trim() || undefined,
        amount: Number(form.amount),
        rate: Number(form.rate),
      };

      const res = await axios.put(`/api/deposits/${data.id}`, payload);

      if (res.data?.success) {
        alert('บันทึกข้อมูลสำเร็จ');
        setIsOpen(false);
        onUpdated?.();
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รอดำเนินการ' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'อนุมัติแล้ว' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'ปฏิเสธ' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaEdit" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขการเติมเครดิต</Modal.Title>
            <div className="text-xs text-gray-500 mt-1">
              ID: <span className="font-medium">{data.id}</span>
            </div>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* ข้อมูลผู้ใช้ (แสดงอย่างเดียว) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">ข้อมูลผู้ใช้</h4>
              <div className="flex items-center gap-3">
                <img
                  src={data.user.avatar}
                  alt={data.user.username}
                  className="w-10 h-10 rounded-full border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/40';
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{data.user.username}</p>
                  <p className="text-xs text-gray-500">{data.user.email}</p>
                </div>
              </div>
            </div>

            {/* สถานะปัจจุบัน */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">สถานะปัจจุบัน</h4>
              {getStatusBadge(data.status)}
            </div>

            {/* จำนวนเงิน */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                จำนวนเงิน (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกจำนวนเงิน"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* อัตราแลกเปลี่ยน */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                อัตราแลกเปลี่ยน <span className="text-red-500">*</span>
              </label>
              <input
                name="rate"
                type="number"
                value={form.rate}
                disabled
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกอัตราแลกเปลี่ยน"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* เปลี่ยนสถานะ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                สถานะ <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="PENDING">รอดำเนินการ</option>
                <option value="APPROVED">อนุมัติ</option>
                <option value="REJECTED">ปฏิเสธ</option>
              </select>
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                หมายเหตุ
              </label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-vertical"
                placeholder="เพิ่มหมายเหตุ (เช่น เหตุผลในการปฏิเสธ)"
              />
              <p className="text-xs text-gray-500 mt-1">
                หมายเหตุจะปรากฏให้ผู้ใช้เห็น โดยเฉพาะเมื่อปฏิเสธการเติมเงิน
              </p>
            </div>

            {/* แสดงข้อมูลสลิป */}
            {data.slipImage && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  สลิปการโอนเงิน
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <img
                    src={data.slipImage.imageUrl}
                    alt="Payment slip"
                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(data.slipImage?.imageUrl, '_blank')}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    คลิกเพื่อดูขนาดเต็ม
                  </p>
                </div>
              </div>
            )}

            {/* แสดงจำนวนเครดิตที่จะได้รับ */}
            {form.amount && form.rate && !isNaN(Number(form.amount)) && !isNaN(Number(form.rate)) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2">จำนวนเครดิตที่จะได้รับ</h4>
                <p className="text-lg font-bold text-green-600">
                  {(Number(form.amount) * Number(form.rate)).toLocaleString()} เครดิต
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {Number(form.amount).toLocaleString()} บาท × {Number(form.rate)} = {(Number(form.amount) * Number(form.rate)).toLocaleString()} เครดิต
                </p>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md hover:shadow-lg"
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
              className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยกเลิก
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DepositModalEdit;
