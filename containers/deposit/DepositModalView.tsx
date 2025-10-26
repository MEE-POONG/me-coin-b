import React, { useState } from 'react';
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

interface DepositModalViewProps {
  data: DepositWithUser;
  triggerClassName?: string;
  triggerText?: string;
}

const DepositModalView: React.FC<DepositModalViewProps> = ({
  data,
  triggerClassName,
  triggerText = 'ดูรายละเอียด',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
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
          'px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaEye" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="lg" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>รายละเอียดการเติมเครดิต</Modal.Title>
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
            {/* ข้อมูลผู้ใช้ */}
            <div className="bg-blue-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaUser" setClass="w-5 h-5 text-blue-600" />
                ข้อมูลผู้ใช้
              </h3>
              <div className="flex items-center gap-4">
                <img
                  src={data.user.avatar}
                  alt={data.user.username}
                  className="w-16 h-16 rounded-full border-2 border-gray-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64';
                  }}
                />
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ชื่อผู้ใช้</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {data.user.username}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">อีเมล</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {data.user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ข้อมูลการเติมเงิน */}
            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaDollarSign" setClass="w-5 h-5 text-green-600" />
                ข้อมูลการเติมเงิน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">จำนวนเงิน</label>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {data.amount.toLocaleString()} บาท
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">อัตราแลกเปลี่ยน</label>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {data.rate}x
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">สถานะ</label>
                  <div className="mt-1">
                    {getStatusBadge(data.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">วันที่ส่งคำขอ</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(data.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* จำนวนเครดิตที่ได้รับ */}
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <label className="text-sm font-medium text-gray-600">จำนวนเครดิตที่ได้รับ</label>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {(data.amount * data.rate).toLocaleString()} เครดิต
                </p>
              </div>
            </div>

            {/* สลิปการโอนเงิน */}
            {data.slipImage && (
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ReactIconComponent icon="FaImage" setClass="w-5 h-5 text-gray-600" />
                  สลิปการโอนเงิน
                </h3>
                <div className="text-center">
                  <img
                    src={data.slipImage.imageUrl}
                    alt="Payment slip"
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => window.open(data.slipImage?.imageUrl, '_blank')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    คลิกที่รูปเพื่อดูขนาดเต็ม
                  </p>
                </div>
              </div>
            )}

            {/* หมายเหตุ */}
            {data.comment && (
              <div className="bg-yellow-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ReactIconComponent icon="FaStickyNote" setClass="w-5 h-5 text-yellow-600" />
                  หมายเหตุ
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  {data.comment}
                </p>
              </div>
            )}
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

export default DepositModalView;
