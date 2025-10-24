import React, { useState } from 'react';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface AdminUser {
  id: string;
  discordId?: string | null;
  email: string;
  username: string;
  name?: string | null;
  phone?: string | null;
  accountType?: string | null;
  accountNumber: string;
  accountName?: string | null;
  avatar?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AdminModalViewProps {
  data: AdminUser;
  triggerClassName?: string;
  triggerText?: string;
}

const AdminModalView: React.FC<AdminModalViewProps> = ({
  data,
  triggerClassName,
  triggerText = 'ดูรายละเอียด',
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600'
        }
      >
        <ReactIconComponent icon="FaEye" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="lg" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>รายละเอียดแอดมิน</Modal.Title>
            <div className="text-xs text-gray-500 mt-1">
              ID: <span className="font-medium">{data.id}</span>
            </div>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-6">
            {/* ข้อมูลพื้นฐาน */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลพื้นฐาน</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ชื่อผู้ใช้</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.username || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">อีเมล</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.email || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ชื่อ-นามสกุล</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.name || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">เบอร์โทร</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.phone || '-'}
                  </p>
                </div>
                {data.discordId && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Discord ID</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {data.discordId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ข้อมูลบัญชี */}
            <div className="bg-blue-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaUniversity" setClass="w-5 h-5 text-blue-600" />
                ข้อมูลบัญชี
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">เลขบัญชี</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.accountNumber || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ประเภทบัญชี</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                  {data.accountType}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">ชื่อบัญชี</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.accountName || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* ข้อมูลระบบ */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลระบบ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">วันที่สร้างบัญชี</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(data.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">อัปเดตล่าสุด</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(data.updatedAt)}
                  </p>
                </div>
                {data.avatar && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Avatar</label>
                    <div className="mt-2">
                      <img
                        src={data.avatar}
                        alt={data.username}
                        className="w-20 h-20 rounded-full border-2 border-gray-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 border border-gray-300"
            >
              ปิด
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminModalView;
