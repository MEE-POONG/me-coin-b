import React, { useState } from 'react';
import axios from '@/lib/axios';
import ReactIconComponent from '@/components/ReactIconComponent';
import Modal from '@/components/form/Modal';

interface AdminModalAddProps {
  onCreated?: () => void;
  triggerClassName?: string;
  triggerText?: string;
}

const AdminModalAdd: React.FC<AdminModalAddProps> = ({
  onCreated,
  triggerClassName,
  triggerText = 'เพิ่มแอดมิน',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    phone: '',
    accountNumber: '',
    accountType: '',
    accountName: '',
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
      const res = await axios.post('/api/admin', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        accountNumber: form.accountNumber.trim(),
        accountType: form.accountType.trim() || undefined,
        accountName: form.accountName.trim() || undefined,
      });

      if (res.data?.success) {
        alert('เพิ่มแอดมินสำเร็จ');
        setIsOpen(false);
        setForm({
          username: '',
          email: '',
          password: '',
          name: '',
          phone: '',
          accountNumber: '',
          accountType: '',
          accountName: '',
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
          <Modal.Title>เพิ่มแอดมินใหม่</Modal.Title>
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

            {/* ชื่อ-นามสกุล */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ชื่อ-นามสกุล
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกชื่อ-นามสกุล (ไม่บังคับ)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                เบอร์โทร
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกเบอร์โทร (ไม่บังคับ)"
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

            {/* ประเภทบัญชี */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                บัญชีธนาคาร
              </label>
              <select
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
              >
                <option value="" disabled >-- เลือกประเภทบัญชี --</option>
                <option value="promptpay">PromptPay</option>
                <option value="crypto">Crypto Wallet</option>
                <option value="BBL">ธนาคารกรุงเทพ</option>
                <option value="KBANK">ธนาคารกสิกรไทย</option>
                <option value="KTB">ธนาคารกรุงไทย</option>
                <option value="TTB">ธนาคารทหารไทยธนชาต</option>
                <option value="SCB">ธนาคารไทยพาณิชย์</option>
                <option value="BAY">ธนาคารกรุงศรีอยุธยา</option>
                <option value="KKP">ธนาคารเกียรตินาคินภัทร</option>
                <option value="CIMBT">ธนาคารซีไอเอ็มบีไทย</option>
                <option value="UOB">ธนาคารยูโอบี</option>
                <option value="TISCO">ธนาคารทิสโก้</option>
                <option value="SCBT">ธนาคารสแตนดาร์ดชาร์เตอร์ด (ไทย)</option>
                <option value="ICBC">ธนาคารไอซีบีซี (ไทย)</option>
                <option value="LHBANK">ธนาคารแลนด์แอนด์เฮ้าส์ (LH Bank)</option>
                <option value="TNC">ธนาคารธนชาต (ในอดีต)</option>
                <option value="SIB">ธนาคารนครหลวงไทย (ในอดีต)</option>
                <option value="GSB">ธนาคารออมสิน</option>
                <option value="BAAC">ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)</option>
                <option value="GHBANK">ธนาคารอาคารสงเคราะห์ (ธอส.)</option>
                <option value="EXIM">ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย (ธสน.)</option>
                <option value="SME">ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย (ธพว.)</option>
                <option value="ISLAMIC">ธนาคารอิสลามแห่งประเทศไทย (ธอท.)</option>
              </select>
            </div>

            {/* ชื่อบัญชี */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                ชื่อบัญชี
              </label>
              <input
                name="accountName"
                value={form.accountName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                placeholder="กรอกชื่อบัญชี (ไม่บังคับ)"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
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

export default AdminModalAdd;
