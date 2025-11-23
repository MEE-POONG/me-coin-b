import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface UserModalAddProps {
  onCreated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const UserModalAdd: React.FC<UserModalAddProps> = ({
  onCreated,
  triggerClassName,
  triggerText = 'เพิ่มผู้ใช้',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    accountNumber: '',
    avatar: '',
    role: 'NORMAL' as 'NORMAL' | 'PREMIUM' | 'ADMIN',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.username.trim()) return 'กรุณากรอกชื่อผู้ใช้';
    if (form.username.trim().length < 3) return 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    if (!form.email.trim()) return 'กรุณากรอกอีเมล';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.password.trim()) return 'กรุณากรอกรหัสผ่าน';
    if (form.password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    if (!form.accountNumber.trim()) return 'กรุณากรอกเลขบัญชี';
    if (form.accountNumber.trim().length < 3) return 'เลขบัญชีต้องมีอย่างน้อย 3 ตัวอักษร';
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
      const res = await axios.post('/api/users', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        accountNumber: form.accountNumber.trim(),
        avatar: form.avatar.trim() || undefined,
        role: form.role,
      });

      if (res.status === 201) {
        alert('เพิ่มผู้ใช้สำเร็จ');
        setIsOpen(false);
        setForm({
          username: '',
          email: '',
          password: '',
          accountNumber: '',
          avatar: '',
          role: 'NORMAL',
        });
        onCreated?.();
      }
    } catch (e: any) {
      const errMsg = e?.response?.data?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
        }
      >
        <ReactIconComponent icon="FaPlus" setClass="w-4 h-4" />
        {triggerText}
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <Modal.Title>เพิ่มผู้ใช้ใหม่</Modal.Title>
          <Modal.Close onClick={() => setIsOpen(false)} disabled={submitting}>
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-5">
            {/* ชื่อผู้ใช้ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* อีเมล */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="example@email.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* รหัสผ่าน */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* เลขบัญชี */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                เลขบัญชี <span className="text-red-500">*</span>
              </label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกเลขบัญชี"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Avatar URL
              </label>
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="URL รูปโปรไฟล์ (ไม่บังคับ)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* สิทธิ์ */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                สิทธิ์ผู้ใช้
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="NORMAL">ผู้ใช้ทั่วไป</option>
                <option value="PREMIUM">พรีเมียม</option>
                <option value="ADMIN">แอดมิน</option>
              </select>
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

export default UserModalAdd;
