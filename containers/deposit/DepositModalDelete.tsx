import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface DepositWithUser {
  id: string;
  amount: number;
  slipImage: string;
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

interface DepositModalDeleteProps {
  data: DepositWithUser;
  onDeleted?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const DepositModalDelete: React.FC<DepositModalDeleteProps> = ({
  data,
  onDeleted,
  triggerClassName,
  triggerText = 'ลบ',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const res = await axios.delete(`/api/deposits/${data.id}`);

      if (res.data?.success) {
        alert('ลบการเติมเครดิตสำเร็จ');
        setIsOpen(false);
        onDeleted?.();
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          'px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaTrash" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="sm" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบการเติมเครดิต</Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <ReactIconComponent icon="FaExclamationTriangle" setClass="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-base text-gray-700 mb-3">
                คุณแน่ใจหรือไม่ว่าต้องการลบการเติมเครดิตนี้?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-3 text-left">
                {/* ข้อมูลผู้ใช้ */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                  <img
                    src={data.user.avatar}
                    alt={data.user.username}
                    className="w-10 h-10 rounded-full border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{data.user.username}</div>
                    <div className="text-xs text-gray-600">{data.user.email}</div>
                  </div>
                </div>

                {/* ข้อมูลการเติมเงิน */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">จำนวนเงิน</div>
                    <div className="font-semibold text-gray-900">{data.amount.toLocaleString()} บาท</div>
                  </div>
                  <div>
                    <div className="text-gray-600">อัตราแลกเปลี่ยน</div>
                    <div className="font-semibold text-gray-900">{data.rate}x</div>
                  </div>
                  <div>
                    <div className="text-gray-600">เครดิตที่ได้รับ</div>
                    <div className="font-semibold text-green-600">{(data.amount * data.rate).toLocaleString()} เครดิต</div>
                  </div>
                  <div>
                    <div className="text-gray-600">สถานะ</div>
                    <div className="mt-1">{getStatusBadge(data.status)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-gray-600 text-sm">วันที่สร้าง</div>
                  <div className="font-medium text-gray-900 text-sm">{formatDate(data.createdAt)}</div>
                </div>

                {data.comment && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-gray-600 text-sm">หมายเหตุ</div>
                    <div className="text-gray-900 text-sm mt-1">{data.comment}</div>
                  </div>
                )}

                {/* แสดงสลิปย่อๆ */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-gray-600 text-sm mb-2">สลิปการโอนเงิน</div>
                  <img
                    src={data.slipImage}
                    alt="Payment slip"
                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(data.slipImage, '_blank')}
                  />
                </div>
              </div>
              
              <p className="text-sm text-red-600 font-medium">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
              {data.status === 'APPROVED' && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ การลบการเติมเครดิตที่อนุมัติแล้วอาจส่งผลต่อยอดเครดิตของผู้ใช้
                </p>
              )}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 shadow-md hover:shadow-lg"
            >
              {submitting ? 'กำลังลบ...' : 'ยืนยันลบ'}
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

export default DepositModalDelete;
