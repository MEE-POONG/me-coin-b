import React, { useState } from 'react';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { UserJoined } from '@/types';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface UserModalBlockProps {
  data: UserJoined;
  onSuccess?: () => void;
  triggerClassName?: string;
}

const UserModalBlock: React.FC<UserModalBlockProps> = ({
  data,
  onSuccess,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number>(3);
  const [reason, setReason] = useState('');

  const handleBlock = async () => {
    if (!reason.trim()) {
      toast.error('กรุณาระบุเหตุผลในการบล็อก');
      return;
    }

    if (duration < 3 || duration > 30) {
      toast.error('ระยะเวลาต้องอยู่ระหว่าง 3-30 วัน');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(`/api/admin/users/${data.id}/block`, {
        duration,
        reason,
      });

      toast.success(response.data.message || 'บล็อกผู้ใช้สำเร็จ');
      setIsOpen(false);
      setReason('');
      setDuration(3);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast.error(error.response?.data?.error || 'เกิดข้อผิดพลาดในการบล็อกผู้ใช้');
    } finally {
      setIsLoading(false);
    }
  };

  const getBlockEndDate = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    return endDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2'
        }
        title="บล็อกผู้ใช้"
      >
        <ReactIconComponent icon="FaBan" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <Modal.Title>
            <div className="flex items-center gap-2 text-orange-600">
              <ReactIconComponent icon="FaBan" setClass="w-6 h-6" />
              บล็อกผู้ใช้
            </div>
          </Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* คำเตือน */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex items-start">
                <ReactIconComponent icon="FaExclamationTriangle" setClass="w-5 h-5 text-orange-500 mt-0.5 mr-3" />
                <div className="text-sm text-orange-700">
                  <p className="font-semibold">คำเตือน!</p>
                  <p className="mt-1">
                    คุณกำลังจะบล็อกผู้ใช้ <span className="font-bold">{data.username}</span>
                  </p>
                  <p className="text-xs mt-1 text-orange-600">
                    ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะครบกำหนดเวลา หรือแอดมินปลดบล็อก
                  </p>
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">ข้อมูลผู้ใช้</h4>
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

            {/* ระยะเวลาบล็อก */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ระยะเวลาบล็อก (วัน) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="ระบุจำนวนวัน (3-30 วัน)"
              />
              <p className="text-xs text-gray-500 mt-2">
                ระบุระยะเวลาระหว่าง 3-30 วัน (จะหมดเวลาในวันที่: <span className="font-semibold text-orange-600">{getBlockEndDate()}</span>)
              </p>
            </div>

            {/* เหตุผล */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลในการบล็อก <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                placeholder="เช่น: ละเมิดเงื่อนไขการใช้งาน, พฤติกรรมไม่เหมาะสม, ฯลฯ"
              />
              <p className="text-xs text-gray-500 mt-1">
                ข้อความนี้จะแสดงให้ผู้ใช้เห็นเมื่อพยายามเข้าสู่ระบบ
              </p>
            </div>

            {/* สรุป */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">สรุปการบล็อก</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• ผู้ใช้จะถูกบล็อกเป็นเวลา <span className="font-bold text-orange-600">{duration} วัน</span></li>
                <li>• จะหมดเวลาในวันที่: <span className="font-bold">{getBlockEndDate()}</span></li>
                <li>• ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะครบกำหนด</li>
                <li>• แอดมินสามารถปลดบล็อกก่อนกำหนดได้</li>
              </ul>
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
              onClick={handleBlock}
              disabled={isLoading || !reason.trim()}
              className="px-6 py-3 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <ReactIconComponent icon="FaSpinner" setClass="w-4 h-4 animate-spin" />
                  กำลังบล็อก...
                </>
              ) : (
                <>
                  <ReactIconComponent icon="FaBan" setClass="w-4 h-4" />
                  ยืนยันบล็อก
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserModalBlock;
