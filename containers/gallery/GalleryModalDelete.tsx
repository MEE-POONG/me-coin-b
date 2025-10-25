import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { GalleryDB } from '@prisma/client';

interface GalleryModalDeleteProps {
  data: GalleryDB;
  onDeleted?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const GalleryModalDelete: React.FC<GalleryModalDeleteProps> = ({
  data,
  onDeleted,
  triggerClassName,
  triggerText = 'ลบ',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      
      let url = `/api/images/${data.id}`;
      if (deleteType === 'hard') {
        url += '?hard=true&deletedBy=admin';
      } else {
        url += '?deletedBy=admin';
      }

      const res = await axios.delete(url);

      if (res.data?.success) {
        alert(deleteType === 'hard' ? 'ลบรูปภาพถาวรสำเร็จ' : 'ลบรูปภาพสำเร็จ (สามารถกู้คืนได้)');
        setIsOpen(false);
        onDeleted?.();
      }
    } catch (e: any) {
      alert(e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
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
          'px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaTrash" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="sm" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>ยืนยันการลบรูปภาพ</Modal.Title>
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
                คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-3 text-left">
                {/* แสดงรูปภาพ */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                  <img
                    src={data.imageUrl}
                    alt={data.nameFile}
                    className="w-16 h-16 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/64';
                    }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{data.nameFile}</div>
                    <div className="text-xs text-gray-600">ประเภท: {data.modalName || 'ไม่ระบุ'}</div>
                  </div>
                </div>

                {/* ข้อมูลรายละเอียด */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันที่สร้าง:</span>
                    <span className="font-medium text-gray-900">{formatDate(data.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">สร้างโดย:</span>
                    <span className="font-medium text-gray-900">{data.createdBy || 'ไม่ระบุ'}</span>
                  </div>
                  {data.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">แก้ไขล่าสุดโดย:</span>
                      <span className="font-medium text-gray-900">{data.updatedBy}</span>
                    </div>
                  )}
                </div>

                {/* URL */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-gray-600 text-xs">URL:</div>
                  <div className="text-gray-900 text-xs mt-1 font-mono break-all bg-gray-100 p-2 rounded">
                    {data.imageUrl}
                  </div>
                </div>
              </div>

              {/* เลือกประเภทการลบ */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">เลือกประเภทการลบ:</h4>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteType"
                        value="soft"
                        checked={deleteType === 'soft'}
                        onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">ลบชั่วคราว (แนะนำ)</div>
                        <div className="text-xs text-yellow-700">สามารถกู้คืนได้ในภายหลัง</div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteType"
                        value="hard"
                        checked={deleteType === 'hard'}
                        onChange={(e) => setDeleteType(e.target.value as 'soft' | 'hard')}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-red-800">ลบถาวร</div>
                        <div className="text-xs text-red-700">ไม่สามารถกู้คืนได้ และจะลบไฟล์จาก Cloudflare</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-red-600 font-medium">
                {deleteType === 'hard' 
                  ? '⚠️ การลบถาวรไม่สามารถย้อนกลับได้'
                  : 'สามารถกู้คืนได้จากหน้าจัดการรูปภาพที่ถูกลบ'
                }
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
              className={`flex-1 px-6 py-3 text-sm font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                deleteType === 'hard' 
                  ? 'bg-red-700 hover:bg-red-800 focus:ring-red-600' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {submitting ? 'กำลังลบ...' : deleteType === 'hard' ? 'ยืนยันลบถาวร' : 'ยืนยันลบ'}
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

export default GalleryModalDelete;
