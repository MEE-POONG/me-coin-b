import React, { useState } from 'react';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { ImageListUtils } from '@/lib/ImageListDB';
import { GalleryDB } from '@prisma/client';

interface GalleryModalViewProps {
  data: GalleryDB;
  triggerClassName?: string;
  triggerText?: string;
}

const GalleryModalView: React.FC<GalleryModalViewProps> = ({
  data,
  triggerClassName,
  triggerText = 'ดูรายละเอียด',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | string) => {
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
          'px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaEye" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="lg" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>รายละเอียดรูปภาพ</Modal.Title>
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
            {/* รูปภาพ */}
            <div className="bg-gray-50 rounded-lg p-5 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">รูปภาพ</h3>
              <img
                src={data.imageUrl}
                alt={data.nameFile}
                className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => window.open(data.imageUrl, '_blank')}
              />
              <p className="text-xs text-gray-500 mt-2">
                คลิกที่รูปเพื่อดูขนาดเต็ม
              </p>
            </div>

            {/* ข้อมูลไฟล์ */}
            <div className="bg-blue-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaFile" setClass="w-5 h-5 text-blue-600" />
                ข้อมูลไฟล์
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ชื่อไฟล์</label>
                  <p className="text-base font-semibold text-gray-900 mt-1 break-all">
                    {data.nameFile}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">DataBase Name</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {data.modalName || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">URL รูปภาพ</label>
                <div className="mt-1 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700 break-all font-mono">
                    {data.imageUrl}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(data.imageUrl)}
                    className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    คัดลอก URL
                  </button>
                </div>
              </div>

              {/* Variants URLs */}
              {data.imageUrl.includes('imagedelivery.net') && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">ขนาดต่างๆ</label>
                  <div className="mt-2 space-y-2">
                    {['thumbnail', 'small', 'medium', 'large'].map((variant) => (
                      <div key={variant} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 w-20">
                          {variant}:
                        </span>
                        <code className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                          {ImageListUtils.getVariantUrl(data.imageUrl, variant as any)}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(ImageListUtils.getVariantUrl(data.imageUrl, variant as any))}
                          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          คัดลอก
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ข้อมูลการสร้าง/แก้ไข */}
            <div className="bg-gray-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ReactIconComponent icon="FaClock" setClass="w-5 h-5 text-gray-600" />
                ข้อมูลระบบ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">วันที่สร้าง</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(data.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">สร้างโดย</label>
                  <p className="text-base text-gray-900 mt-1">
                    {data.createdBy || 'ไม่ระบุ'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">อัปเดตล่าสุด</label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(data.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">แก้ไขโดย</label>
                  <p className="text-base text-gray-900 mt-1">
                    {data.updatedBy || 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            </div>

            {/* สถานะการลบ */}
            {data.deleteBy && (
              <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <ReactIconComponent icon="FaTrash" setClass="w-5 h-5 text-red-600" />
                  รูปภาพถูกลบแล้ว
                </h3>
                <p className="text-sm text-red-700">
                  ลบโดย: <strong>{data.deleteBy}</strong>
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

export default GalleryModalView;
