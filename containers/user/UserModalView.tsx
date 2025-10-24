import React, { useState } from 'react';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { UserJoined } from '@/types';

interface UserModalViewProps {
  data: UserJoined;
  triggerClassName?: string;
  triggerText?: string;
}

const UserModalView: React.FC<UserModalViewProps> = ({
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'แอดมิน';
      case 'PREMIUM':
        return 'พรีเมียม';
      default:
        return 'ผู้ใช้ทั่วไป';
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <Modal.Title>รายละเอียดผู้ใช้</Modal.Title>
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
                  <label className="text-sm font-medium text-gray-600">เลขบัญชี</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.accountNumber || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">สิทธิ์</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(data.role)}`}>
                      {getRoleLabel(data.role)}
                    </span>
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

            {/* ข้อมูลกระเป๋าเงิน */}
            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaWallet" setClass="w-5 h-5 text-green-600" />
                ข้อมูลกระเป๋าเงิน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ยอดเงินคงเหลือ</label>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {(data.wallet?.balance ?? 0).toLocaleString()} บาท
                  </p>
                </div>
                {data.wallet && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Wallet ID</label>
                    <p className="text-sm font-mono text-gray-700 mt-1">
                      {data.wallet.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* สถิติ */}
            <div className="bg-blue-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaChartBar" setClass="w-5 h-5 text-blue-600" />
                สถิติการใช้งาน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">จำนวนฝากเงิน</label>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {data.deposits?.length ?? 0} ครั้ง
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">จำนวนถอนเงิน</label>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {data.withdrawals?.length ?? 0} ครั้ง
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">จำนวนธุรกรรม</label>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {data.transactions?.length ?? 0} ครั้ง
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ไอเทมที่เป็นเจ้าของ</label>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {data.ownedItems?.length ?? 0} ชิ้น
                  </p>
                </div>
              </div>
            </div>

            {/* สถานะการบล็อก */}
            {data.isBlocked && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <ReactIconComponent icon="FaBan" setClass="w-5 h-5 text-red-600" />
                  ผู้ใช้ถูกบล็อก
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">บล็อกเมื่อ</label>
                    <p className="text-base text-gray-900 mt-1">
                      {formatDate(data.blockedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">หมดเวลา</label>
                    <p className="text-base font-bold text-red-600 mt-1">
                      {formatDate(data.blockedUntil)}
                    </p>
                  </div>
                  {data.blockedReason && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">เหตุผล</label>
                      <p className="text-base text-gray-900 mt-1 bg-white p-3 rounded border border-red-200">
                        {data.blockedReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <div>
                  <label className="text-sm font-medium text-gray-600">สถานะบัญชี</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${data.isBlocked ? 'bg-red-100 text-red-800' : data.isDeleted ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                      {data.isBlocked ? 'ถูกบล็อก' : data.isDeleted ? 'ถูกลบ' : 'ใช้งาน'}
                    </span>
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

export default UserModalView;
