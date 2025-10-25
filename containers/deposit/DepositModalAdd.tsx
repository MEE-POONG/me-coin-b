import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface DepositModalAddProps {
  onCreated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const DepositModalAdd: React.FC<DepositModalAddProps> = ({
  onCreated,
  triggerClassName,
  triggerText = 'เพิ่มการเติมเครดิต',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    amount: '',
    rate: '',
    slipImage: '',
    comment: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.userId.trim()) return 'กรุณากรอก User ID';
    if (!form.amount.trim()) return 'กรุณากรอกจำนวนเงิน';
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0';
    if (!form.rate.trim()) return 'กรุณากรอกอัตราแลกเปลี่ยน';
    if (isNaN(Number(form.rate)) || Number(form.rate) <= 0) return 'อัตราแลกเปลี่ยนต้องเป็นตัวเลขที่มากกว่า 0';
    if (!form.slipImage.trim()) return 'กรุณากรอก URL ของสลิป';
    try {
      new URL(form.slipImage.trim());
    } catch {
      return 'URL ของสลิปไม่ถูกต้อง';
    }
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
      const res = await axios.post('/api/deposits', {
        userId: form.userId.trim(),
        amount: Number(form.amount),
        rate: Number(form.rate),
        slipImage: form.slipImage.trim(),
        comment: form.comment.trim() || undefined,
      });

      if (res.data?.success) {
        alert('เพิ่มการเติมเครดิตสำเร็จ');
        setIsOpen(false);
        setForm({
          userId: '',
          amount: '',
          rate: '',
          slipImage: '',
          comment: '',
        });
        onCreated?.();
      }
    } catch (e: any) {
      const errMsg = e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaPlus" setClass="w-4 h-4" />
        {triggerText}
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <Modal.Title>เพิ่มการเติมเครดิตใหม่</Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอก User ID ของผู้ใช้"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                ป้อน ID ของผู้ใช้ที่ต้องการเติมเครดิต
              </p>
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
                placeholder="กรอกจำนวนเงินที่เติม"
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
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="เช่น 1.0, 1.5, 2.0"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                อัตราการแปลงเงินเป็นเครดิต (เช่น 1.0 = 1 บาท = 1 เครดิต)
              </p>
            </div>

            {/* URL สลิป */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                URL สลิปการโอนเงิน <span className="text-red-500">*</span>
              </label>
              <input
                name="slipImage"
                type="url"
                value={form.slipImage}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="https://example.com/slip-image.jpg"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL ของรูปสลิปการโอนเงิน
              </p>
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
                placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              />
            </div>

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

export default DepositModalAdd;
