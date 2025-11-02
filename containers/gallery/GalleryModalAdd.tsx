import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface GalleryModalAddProps {
  onCreated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const GalleryModalAdd: React.FC<GalleryModalAddProps> = ({
  onCreated,
  triggerClassName,
  triggerText = 'เพิ่มรูปภาพ',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nameFile: '',
    modalName: '',
    createdBy: '',
  });

  const [uploadState, setUploadState] = useState({
    uploading: false,
    selectedFile: null as File | null,
    previewUrl: '',
    uploadedImageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ไฟล์มีขนาดใหญ่เกิน 10MB');
      return;
    }

    // สร้าง preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setUploadState(prev => ({
      ...prev,
      selectedFile: file,
      previewUrl,
      uploadedImageUrl: '',
    }));

    // ตั้งชื่อไฟล์อัตโนมัติ
    if (!form.nameFile) {
      setForm(prev => ({ ...prev, nameFile: file.name }));
    }
  };

  const clearFile = () => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    setUploadState({
      uploading: false,
      selectedFile: null,
      previewUrl: '',
      uploadedImageUrl: '',
    });
  };

  const validate = () => {
    if (!uploadState.selectedFile) return 'กรุณาเลือกไฟล์รูปภาพ';
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

    let uploadedImageUrl = '';

    try {
      setSubmitting(true);

      // 1. อัพโหลดรูปก่อน
      if (uploadState.selectedFile) {
        setUploadState(prev => ({ ...prev, uploading: true }));

        const formData = new FormData();
        formData.append('file', uploadState.selectedFile);
        formData.append('nameFile', form.nameFile.trim());
        formData.append('modalName', form.modalName.trim());
        formData.append('createdBy', form.createdBy.trim() || 'admin');

        const uploadResponse = await fetch('/api/images/upload-and-save', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success && uploadResult.data) {
          uploadedImageUrl = uploadResult.data.imageUrl;
          setUploadState(prev => ({ 
            ...prev, 
            uploadedImageUrl,
            uploading: false 
          }));

          alert('เพิ่มรูปภาพสำเร็จ!');
          setIsOpen(false);
          
          // Reset form
          setForm({
            nameFile: '',
            modalName: '',
            createdBy: '',
          });
          clearFile();
          onCreated?.();
        } else {
          throw new Error(uploadResult.error || 'การอัพโหลดรูปภาพล้มเหลว');
        }
      }

    } catch (error: any) {
      console.error('Submit error:', error);

      // แสดง error message
      const errorMessage = error?.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการเพิ่มรูปภาพ';
      alert(errorMessage);

      // Reset upload state เฉพาะถ้าเกิด error หลังอัพโหลด
      if (uploadedImageUrl) {
        setUploadState(prev => ({ 
          ...prev, 
          uploading: false,
          uploadedImageUrl: '' 
        }));
      }
    } finally {
      setSubmitting(false);
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        }
      >
        <ReactIconComponent icon="FaPlus" setClass="w-4 h-4" />
        {triggerText}
      </button>

      <Modal 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            clearFile(); // ล้างไฟล์เมื่อปิด modal
          }
        }} 
        size="md" 
        closeOnOverlayClick 
        closeOnEsc
      >
        <Modal.Header>
          <Modal.Title>เพิ่มรูปภาพใหม่</Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* อัพโหลดรูปภาพ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                เลือกรูปภาพ <span className="text-red-500">*</span>
              </label>
              
              {/* File Input */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploadState.uploading || submitting}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  รองรับไฟล์: JPEG, PNG, WebP (ขนาดไม่เกิน 10MB)
                </p>
              </div>

              {/* Preview และ Upload Button */}
              {uploadState.selectedFile && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Preview Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={uploadState.previewUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                    
                    {/* File Info และ Actions */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadState.selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(uploadState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={clearFile}
                          disabled={uploadState.uploading || submitting}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Selected - Ready to Submit */}
              {uploadState.selectedFile && !uploadState.uploading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ReactIconComponent icon="FaInfoCircle" setClass="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">ไฟล์พร้อมสำหรับอัพโหลด</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    กดปุ่ม "บันทึก" เพื่ออัพโหลดรูปและบันทึกข้อมูลพร้อมกัน
                  </p>
                </div>
              )}
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
                <option value="setting">ตั้งค่าเว็บไซต์</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>

            {/* ผู้สร้าง */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ผู้สร้าง
              </label>
              <input
                name="createdBy"
                value={form.createdBy}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="ระบุผู้สร้าง (ไม่บังคับ)"
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploadState.uploading}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md hover:shadow-lg"
            >
              {uploadState.uploading ? '📤 กำลังอัพโหลดรูป...' : 
               submitting ? '💾 กำลังบันทึกข้อมูล...' : 
               uploadState.selectedFile ? '🚀 อัพโหลดและบันทึก' : 
               '💾 บันทึก'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={submitting || uploadState.uploading}
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

export default GalleryModalAdd;
