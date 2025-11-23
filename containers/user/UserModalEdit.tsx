import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';
import { UserJoined } from '@/types';

interface UserModalEditProps {
  data: UserJoined;
  onUpdated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const UserModalEdit: React.FC<UserModalEditProps> = ({
  data,
  onUpdated,
  triggerClassName,
  triggerText = 'แก้ไขข้อมูล',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    accountNumber: '',
    avatar: '',
    role: 'NORMAL' as 'NORMAL' | 'PREMIUM' | 'ADMIN',
    password: '', // ถ้าไม่กรอก = ไม่เปลี่ยนรหัสผ่าน
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      username: data?.username ?? '',
      email: data?.email ?? '',
      accountNumber: data?.accountNumber ?? '',
      avatar: data?.avatar ?? '',
      role: (data?.role as any) ?? 'NORMAL',
      password: '',
    });
  }, [isOpen, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.username.trim()) return 'กรุณากรอกชื่อผู้ใช้';
    if (form.username.trim().length < 3) return 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    if (!form.email.trim()) return 'กรุณากรอกอีเมล';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.accountNumber.trim()) return 'กรุณากรอกเลขบัญชี';
    if (form.accountNumber.trim().length < 3) return 'เลขบัญชีต้องมีอย่างน้อย 3 ตัวอักษร';
    // password เป็น optional แต่ถ้ากรอกมา ต้อง >= 8
    if (form.password && form.password.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
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
      const payload: any = {
        username: form.username.trim(),
        email: form.email.trim(),
        accountNumber: form.accountNumber.trim(),
        avatar: form.avatar.trim() || undefined,
        role: form.role,
      };
      // ถ้ากรอก password มา จึงส่ง
      if (form.password.trim()) {
        payload.password = form.password;
      }

      const res = await axios.put(`/api/users/${data.id}`, payload);

      if (res.status === 200) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
        }
      >
        <ReactIconComponent icon="FaEdit" setClass="w-4 h-4" />
      </button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="md" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขข้อมูลผู้ใช้</Modal.Title>
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
                placeholder="กรอกชื่อผู้ใช้"
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

            {/* รหัสผ่าน (ไม่บังคับ) */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                รหัสผ่านใหม่
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="ไม่ต้องกรอกหากไม่ต้องการเปลี่ยน (อย่างน้อย 8 ตัวอักษร)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <p className="text-xs text-gray-500 mt-1">
                หากต้องการเปลี่ยนรหัสผ่าน กรอกรหัสผ่านใหม่ที่นี่
              </p>
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

export default UserModalEdit;
