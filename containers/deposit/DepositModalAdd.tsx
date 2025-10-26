import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface DepositModalAddProps {
  onCreated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const DepositModalAdd: React.FC<DepositModalAddProps> = ({
  onCreated,
  triggerClassName,
  triggerText = 'เพิ่มการเติมเครดิต',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    amount: '',
    rate: '',
    slipImage: '',
    comment: '',
  });

  const [uploadState, setUploadState] = useState({
    uploading: false,
    selectedFile: null as File | null,
    previewUrl: '',
    uploadedImageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // ล้างค่า URL เดิม
    setForm(prev => ({ ...prev, slipImage: '' }));
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
    setForm(prev => ({ ...prev, slipImage: '' }));
  };

  const validate = () => {
    if (!form.userId.trim()) return 'กรุณากรอก User ID';
    if (!form.amount.trim()) return 'กรุณากรอกจำนวนเงิน';
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) return 'จำนวนเงินต้องเป็นตัวเลขที่มากกว่า 0';
    if (!form.rate.trim()) return 'กรุณากรอกอัตราแลกเปลี่ยน';
    if (isNaN(Number(form.rate)) || Number(form.rate) <= 0) return 'อัตราแลกเปลี่ยนต้องเป็นตัวเลขที่มากกว่า 0';
    if (!uploadState.selectedFile && !form.slipImage.trim()) return 'กรุณาเลือกไฟล์สลิปการโอนเงิน';
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

      // 1. อัพโหลดรูปก่อน (ถ้ามีไฟล์ใหม่)
      if (uploadState.selectedFile) {
        setUploadState(prev => ({ ...prev, uploading: true }));

       
        const formData = new FormData();
        formData.append('file', uploadState.selectedFile);
        formData.append('nameFile', uploadState.selectedFile.name);
        formData.append('modalName', 'deposit');
        formData.append('createdBy', form.userId.trim());

        const uploadResponse = await fetch('/api/upload/cloudflare', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success && uploadResult.data) {
          uploadedImageUrl = uploadResult.data.url;
          setUploadState(prev => ({ 
            ...prev, 
            uploadedImageUrl,
            uploading: false 
          }));
        } else {
          throw new Error(uploadResult.error || 'การอัพโหลดรูปภาพล้มเหลว');
        }
      } else if (form.slipImage.trim()) {
        // ใช้ URL ที่มีอยู่แล้ว
        uploadedImageUrl = form.slipImage.trim();
      }

      // 2. บันทึกข้อมูลลง database
      const depositPayload = {
        userId: form.userId.trim(),
        amount: Number(form.amount),
        rate: Number(form.rate),
        slipImage: uploadedImageUrl,
        comment: form.comment.trim() || undefined,
      };

      const depositResponse = await axios.post('/api/deposits', depositPayload);

      if (depositResponse.data?.success) {
        alert('เพิ่มการเติมเครดิตสำเร็จ');
        setIsOpen(false);
        setForm({
          userId: '',
          amount: '',
          rate: '',
          slipImage: '',
          comment: '',
        });
        clearFile();
        onCreated?.();
      } else {
        throw new Error(depositResponse.data?.error || 'การบันทึกข้อมูลล้มเหลว');
      }

    } catch (error: any) {
      console.error('Submit error:', error);

      // 3. ลบรูปที่อัพโหลดไปแล้ว ถ้า database ล้มเหลว
      if (uploadedImageUrl && uploadState.selectedFile) {
        try {
          await fetch('/api/images/cleanup', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: uploadedImageUrl }),
          });
          console.log('🧹 Cleaned up uploaded image after DB failure');
        } catch (cleanupError) {
          console.error('❌ Error cleaning up image:', cleanupError);
        }
      }

      // แสดง error message
      const errorMessage = error?.response?.data?.error || error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      alert(errorMessage);

      // Reset upload state เฉพาะถ้าเกิด error หลังอัพโหลด
      if (uploadedImageUrl && uploadState.selectedFile) {
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
          <Modal.Title>เพิ่มการเติมเครดิตใหม่</Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                User ID หรือ Discord ID <span className="text-red-500">*</span>
              </label>
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอก User ID หรือ Discord ID ของผู้ใช้"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                ป้อน User ID (ObjectId) หรือ Discord ID ของผู้ใช้ที่ต้องการเติมเครดิต
              </p>
            </div>

            {/* จำนวนเงิน */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                จำนวนเงิน (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกจำนวนเงินที่เติม"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* อัตราแลกเปลี่ยน */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                อัตราแลกเปลี่ยน <span className="text-red-500">*</span>
              </label>
              <input
                name="rate"
                type="number"
                value={form.rate}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="เช่น 1.0, 1.5, 2.0"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                อัตราการแปลงเงินเป็นเครดิต (เช่น 1.0 = 1 บาท = 1 เครดิต)
              </p>
            </div>

            {/* อัพโหลดสลิป */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                สลิปการโอนเงิน <span className="text-red-500">*</span>
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

              {/* Upload Success */}
              {uploadState.uploadedImageUrl && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ReactIconComponent icon="FaCheck" setClass="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">อัพโหลดสำเร็จแล้ว</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 break-all">
                    {uploadState.uploadedImageUrl}
                  </p>
                </div>
              )}
            </div>

            {/* หมายเหตุ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                หมายเหตุ
              </label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-vertical"
                placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
              />
            </div>

            {/* แสดงจำนวนเครดิตที่จะได้รับ */}
            {form.amount && form.rate && !isNaN(Number(form.amount)) && !isNaN(Number(form.rate)) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2">จำนวนเครดิตที่จะได้รับ</h4>
                <p className="text-lg font-bold text-green-600">
                  {(Number(form.amount) * Number(form.rate)).toLocaleString()} เครดิต
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {Number(form.amount).toLocaleString()} บาท × {Number(form.rate)} = {(Number(form.amount) * Number(form.rate)).toLocaleString()} เครดิต
                </p>
              </div>
            )}
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

export default DepositModalAdd;
