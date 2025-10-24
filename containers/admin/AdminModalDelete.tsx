import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface AdminUser {
  id: string;
  email: string;
  username: string;
  name?: string | null;
}

interface AdminModalDeleteProps {
  data: AdminUser;
  onDeleted?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const AdminModalDelete: React.FC<AdminModalDeleteProps> = ({
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
      const res = await axios.delete(`/api/admin/${data.id}`);

      if (res.data?.success) {
        alert('ลบแอดมินสำเร็จ');
        setIsOpen(false);
        onDeleted?.();
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
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
          'px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
        }
      >
        <ReactIconComponent icon="FaTrash" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="sm" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบแอดมิน</Modal.Title>
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
                คุณแน่ใจหรือไม่ว่าต้องการลบแอดมินนี้?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="text-sm text-gray-600 mb-1">ชื่อผู้ใช้</div>
                <div className="text-base font-semibold text-gray-900">{data.username}</div>
                <div className="text-sm text-gray-600 mt-2">อีเมล</div>
                <div className="text-base font-semibold text-gray-900">{data.email}</div>
                {data.name && (
                  <>
                    <div className="text-sm text-gray-600 mt-2">ชื่อ-นามสกุล</div>
                    <div className="text-base font-semibold text-gray-900">{data.name}</div>
                  </>
                )}
              </div>
              <p className="text-sm text-red-600 font-medium">
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
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

export default AdminModalDelete;
