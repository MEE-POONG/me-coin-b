import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { GalleryDB } from '@prisma/client';

interface GalleryModalEditProps {
  data: GalleryDB;
  onUpdated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const GalleryModalEdit: React.FC<GalleryModalEditProps> = ({
  data,
  onUpdated,
  triggerClassName,
  triggerText = 'แก้ไขข้อมูล',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nameFile: '',
    modalName: '',
    updatedBy: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      nameFile: data?.nameFile ?? '',
      modalName: data?.modalName ?? '',
      updatedBy: '',
    });
  }, [isOpen, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.nameFile.trim()) return 'กรุณากรอกชื่อไฟล์';
    if (!form.modalName.trim()) return 'กรุณาเลือกประเภทรูปภาพ';
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
      
      const payload = {
        nameFile: form.nameFile.trim(),
        modalName: form.modalName.trim(),
        updatedBy: form.updatedBy.trim() || 'admin',
      };

      const res = await axios.put(`/api/images/${data.id}`, payload);

      if (res.data?.success) {
        alert('บันทึกข้อมูลสำเร็จ');
        setIsOpen(false);
        onUpdated?.();
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
          'px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaEdit" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขรูปภาพ</Modal.Title>
            <div className="text-xs text-gray-500 mt-1">
              ID: <span className="font-medium">{data.id}</span>
            </div>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* แสดงรูปภาพปัจจุบัน */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">รูปภาพปัจจุบัน</h4>
              <div className="flex items-center gap-3">
                <img
                  src={data.imageUrl}
                  alt={data.nameFile}
                  className="w-20 h-20 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{data.nameFile}</p>
                  <p className="text-xs text-gray-500">ประเภท: {data.modalName || 'ไม่ระบุ'}</p>
                  <p className="text-xs text-gray-500">สร้างเมื่อ: {formatDate(data.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* ชื่อไฟล์ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ชื่อไฟล์ <span className="text-red-500">*</span>
              </label>
              <input
                name="nameFile"
                value={form.nameFile}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกชื่อไฟล์"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* ประเภทรูปภาพ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ประเภทรูปภาพ <span className="text-red-500">*</span>
              </label>
              <select
                name="modalName"
                value={form.modalName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="">-- เลือกประเภทรูปภาพ --</option>
                <option value="deposit">สลิปการเติมเงิน</option>
                <option value="withdrawal">สลิปการถอนเงิน</option>
                <option value="profile">รูปโปรไฟล์</option>
                <option value="banner">แบนเนอร์</option>
                <option value="logo">โลโก้</option>
                <option value="gallery">แกลเลอรี่ทั่วไป</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            {/* ผู้แก้ไข */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ผู้แก้ไข
              </label>
              <input
                name="updatedBy"
                value={form.updatedBy}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="ระบุผู้แก้ไข (ไม่บังคับ)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* ข้อมูลการสร้าง */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">ข้อมูลระบบ</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">สร้างเมื่อ:</span>
                  <p className="font-medium text-gray-900">{formatDate(data.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">สร้างโดย:</span>
                  <p className="font-medium text-gray-900">{data.createdBy || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <span className="text-gray-600">แก้ไขล่าสุด:</span>
                  <p className="font-medium text-gray-900">{formatDate(data.updatedAt)}</p>
                </div>
                <div>
                  <span className="text-gray-600">แก้ไขโดย:</span>
                  <p className="font-medium text-gray-900">{data.updatedBy || 'ไม่ระบุ'}</p>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">หมายเหตุ:</p>
                  <p>การแก้ไขจะมีผลกับชื่อไฟล์และประเภทเท่านั้น ไม่สามารถเปลี่ยนรูปภาพได้</p>
                </div>
              </div>
            </div>
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

export default GalleryModalEdit;
