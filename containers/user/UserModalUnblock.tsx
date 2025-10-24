import React, { useState } from 'react';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { UserJoined } from '@/types';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface UserModalUnblockProps {
  data: UserJoined;
  onSuccess?: () => void;
  triggerClassName?: string;
}

const UserModalUnblock: React.FC<UserModalUnblockProps> = ({
  data,
  onSuccess,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnblock = async () => {
    setIsLoading(true);

    try {
      const response = await axios.put(`/api/admin/users/${data.id}/unblock`);

      toast.success(response.data.message || 'ปลดบล็อกผู้ใช้สำเร็จ');
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการปลดบล็อกผู้ใช้');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRemainingDays = () => {
    if (!data.blockedUntil) return 0;
    const now = new Date();
    const blockedUntil = new Date(data.blockedUntil);
    const diffTime = blockedUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2'
        }
        title="ปลดบล็อกผู้ใช้"
      >
        <ReactIconComponent icon="FaUnlock" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <Modal.Title>
            <div className="flex items-center gap-2 text-green-600">
              <ReactIconComponent icon="FaUnlock" setClass="w-6 h-6" />
              ปลดบล็อกผู้ใช้
            </div>
          </Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลผู้ใช้</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ชื่อผู้ใช้:</span>
                  <p className="font-semibold">{data.username}</p>
                </div>
                <div>
                  <span className="text-gray-600">อีเมล:</span>
                  <p className="font-semibold">{data.email}</p>
                </div>
              </div>
            </div>

            {/* ข้อมูลการบล็อก */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ReactIconComponent icon="FaBan" setClass="w-4 h-4 text-orange-600" />
                ข้อมูลการบล็อก
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">บล็อกเมื่อ:</span>
                  <span className="font-semibold">{formatDate(data.blockedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">หมดเวลา:</span>
                  <span className="font-semibold text-orange-600">{formatDate(data.blockedUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เหลือเวลา:</span>
                  <span className="font-semibold text-red-600">
                    {getRemainingDays()} วัน
                  </span>
                </div>
                {data.blockedReason && (
                  <div className="pt-2 border-t border-orange-200">
                    <span className="text-gray-600">เหตุผล:</span>
                    <p className="font-semibold mt-1 text-gray-800">{data.blockedReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* คำเตือน */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-start">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                <div className="text-sm text-green-700">
                  <p className="font-semibold">ยืนยันการปลดบล็อก</p>
                  <p className="mt-1">
                    คุณกำลังจะปลดบล็อกผู้ใช้ <span className="font-bold">{data.username}</span>
                  </p>
                  <p className="text-xs mt-1 text-green-600">
                    ผู้ใช้จะสามารถเข้าสู่ระบบได้ทันทีหลังจากปลดบล็อก
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex gap-3 justify-end w-full">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleUnblock}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />
                  กำลังปลดบล็อก...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaUnlock" setClass="w-4 h-4" />
                  ยืนยันปลดบล็อก
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserModalUnblock;
