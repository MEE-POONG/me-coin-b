'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import ImageUploadField from '@/components/form/ImageUploadField'

type Mode = 'view' | 'edit' | 'create'

interface SettingWeb {
  id: string
  name: string
  logo?: string | null
  logoColor?: string | null
  logoText?: string | null
  logoRingOne?: string | null
  logoRingTwo?: string | null
  description?: string | null
  copyright?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  contactAddress?: string | null
  contactFacebook?: string | null
  contactInstagram?: string | null
  contactTwitter?: string | null
  contactLinkedin?: string | null
  createdAt: string
  updatedAt: string
}

const EMPTY_FORM = {
  name: 'MeCoin Wallet',
  logo: '',
  logoColor: '',
  logoText: '',
  logoRingOne: '',
  logoRingTwo: '',
  description: '',
  copyright: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  contactFacebook: '',
  contactInstagram: '',
  contactTwitter: '',
  contactLinkedin: ''
}

export default function SettingsPage() {
  const [mode, setMode] = useState<Mode>('view')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [record, setRecord] = useState<SettingWeb | null>(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // -------- Utils --------
  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name?.trim()) e.name = 'กรุณากรอกชื่อเว็บไซต์'
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      e.contactEmail = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    const urlFields: (keyof typeof formData)[] = [
      'logo', 'logoColor', 'logoRingOne', 'logoRingTwo',
      'contactFacebook', 'contactInstagram', 'contactTwitter', 'contactLinkedin'
    ]
    urlFields.forEach(k => {
      const v = formData[k]
      if (v && !/^https?:\/\/.+/i.test(v)) e[String(k)] = 'ต้องขึ้นต้นด้วย http:// หรือ https://'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const loadOne = async () => {
    setLoading(true)
    try {
      // สมมติ API GET /api/setting-web คืน { data: SettingWeb[] } เราจะใช้ตัวแรกเป็น single record
      const res = await fetch('/api/setting-web', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const first: SettingWeb | undefined = (data?.data || [])[0]
      if (first) {
        setRecord(first)
        setFormData({
          name: first.name || '',
          logo: first.logo || '',
          logoColor: first.logoColor || '',
          logoText: first.logoText || '',
          logoRingOne: first.logoRingOne || '',
          logoRingTwo: first.logoRingTwo || '',
          description: first.description || '',
          copyright: first.copyright || '',
          contactEmail: first.contactEmail || '',
          contactPhone: first.contactPhone || '',
          contactAddress: first.contactAddress || '',
          contactFacebook: first.contactFacebook || '',
          contactInstagram: first.contactInstagram || '',
          contactTwitter: first.contactTwitter || '',
          contactLinkedin: first.contactLinkedin || ''
        })
        setMode('view')
      } else {
        // ไม่มีข้อมูล → เข้าโหมด create
        setRecord(null)
        setFormData({ ...EMPTY_FORM })
        setMode('create')
      }
    } catch (err) {
      console.error(err)
      alert('ดึงข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOne()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      let res: Response
      if (record?.id) {
        // อัปเดต
        res = await fetch(`/api/setting-web/${record.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        // เพิ่มใหม่
        res = await fetch('/api/setting-web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data?.error || 'Save failed'
        throw new Error(errorMsg)
      }

      alert('บันทึกสำเร็จ')
      await loadOne()
      setMode('view')
    } catch (err) {
      console.error('Save error:', err)
      const errorMessage = err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ'
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!record?.id) return
    const ok = confirm('ต้องการลบการตั้งค่านี้หรือไม่?')
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/setting-web/${record.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data?.error || 'Delete failed'
        throw new Error(errorMsg)
      }

      alert('ลบสำเร็จ')
      setRecord(null)
      setFormData({ ...EMPTY_FORM })
      setMode('create')
    } catch (err) {
      console.error('Delete error:', err)
      const errorMessage = err instanceof Error ? err.message : 'ลบไม่สำเร็จ'
      alert(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const isReadOnly = mode === 'view'
  const headerTitle = mode === 'create' ? 'สร้างการตั้งค่าเว็บไซต์' : 'Website Settings'

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{headerTitle}</h1>
          <p className="text-gray-600">
            {mode === 'create'
              ? 'ยังไม่มีข้อมูลการตั้งค่า สร้างใหม่ได้เลย'
              : 'จัดการการตั้งค่าและข้อมูลติดต่อของเว็บไซต์'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {mode === 'view' && (
            <>
              <button
                onClick={() => setMode('edit')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                แก้ไข
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'กำลังลบ...' : 'ลบ'}
              </button>
            </>
          )}
          {(mode === 'edit' || mode === 'create') && (
            <>
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              {mode === 'edit' && (
                <button
                  onClick={() => { setMode('view'); setErrors({}) }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              )}
            </>
          )}
          <button
            onClick={loadOne}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            รีเฟรช
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form (2 cols) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic */}
            <section className="p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="MeCoin Wallet"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description..."
                  />
                </div>
              </div>
            </section>

            {/* Logo */}
            <section className="p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-3">Logo Settings</h3>
              <div className="space-y-4">
                <ImageUploadField
                  label="Logo"
                  value={formData.logo}
                  onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                  disabled={isReadOnly}
                  error={errors.logo}
                  fieldName="logo"
                />

                <ImageUploadField
                  label="Logo Color"
                  value={formData.logoColor}
                  onChange={(url) => setFormData(prev => ({ ...prev, logoColor: url }))}
                  disabled={isReadOnly}
                  error={errors.logoColor}
                  fieldName="logoColor"
                />

                <ImageUploadField
                  label="Logo Text"
                  value={formData.logoText}
                  onChange={(url) => setFormData(prev => ({ ...prev, logoText: url }))}
                  disabled={isReadOnly}
                  error={errors.logoText}
                  fieldName="logoText"
                />

                <ImageUploadField
                  label="Logo Ring One"
                  value={formData.logoRingOne}
                  onChange={(url) => setFormData(prev => ({ ...prev, logoRingOne: url }))}
                  disabled={isReadOnly}
                  error={errors.logoRingOne}
                  fieldName="logoRingOne"
                />

                <ImageUploadField
                  label="Logo Ring Two"
                  value={formData.logoRingTwo}
                  onChange={(url) => setFormData(prev => ({ ...prev, logoRingTwo: url }))}
                  disabled={isReadOnly}
                  error={errors.logoRingTwo}
                  fieldName="logoRingTwo"
                />
              </div>
            </section>

            {/* Contact */}
            <section className="p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Copyright</label>
                  <input
                    type="text"
                    name="copyright"
                    value={formData.copyright}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="© 2024 MeCoin Wallet"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactEmail ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="contact@example.com"
                    />
                    {errors.contactEmail && <p className="text-sm text-red-600 mt-1">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0XX-XXX-XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Address..."
                  />
                </div>
              </div>
            </section>

            {/* Social */}
            <section className="p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-3">Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  <input
                    type="text"
                    name="contactFacebook"
                    value={formData.contactFacebook}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactFacebook ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="https://facebook.com/..."
                  />
                  {errors.contactFacebook && <p className="text-sm text-red-600 mt-1">{errors.contactFacebook}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <input
                    type="text"
                    name="contactInstagram"
                    value={formData.contactInstagram}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactInstagram ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="https://instagram.com/..."
                  />
                  {errors.contactInstagram && <p className="text-sm text-red-600 mt-1">{errors.contactInstagram}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter/X</label>
                  <input
                    type="text"
                    name="contactTwitter"
                    value={formData.contactTwitter}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactTwitter ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="https://twitter.com/..."
                  />
                  {errors.contactTwitter && <p className="text-sm text-red-600 mt-1">{errors.contactTwitter}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <input
                    type="text"
                    name="contactLinkedin"
                    value={formData.contactLinkedin}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactLinkedin ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="https://linkedin.com/..."
                  />
                  {errors.contactLinkedin && <p className="text-sm text-red-600 mt-1">{errors.contactLinkedin}</p>}
                </div>
              </div>
            </section>
          </div>

          {/* Preview (1 col) */}
          <aside className="xl:col-span-1">
            <div className="p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border"
                    style={{ background: formData.logoColor || undefined }}
                    aria-label="logo-color-preview"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{formData.name || 'ชื่อเว็บไซต์'}</div>
                    <div className="text-sm text-gray-600">{formData.logoText || 'Logo text'}</div>
                  </div>
                </div>
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="logo preview"
                    className="w-full h-32 object-contain border rounded"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-32 border rounded flex items-center justify-center text-gray-400">
                    ไม่มีโลโก้
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Ring1: {formData.logoRingOne || '-'} | Ring2: {formData.logoRingTwo || '-'}
                </div>

                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-700 whitespace-pre-line">{formData.description || '-'}</div>
                </div>

                <div className="pt-2 border-t text-sm">
                  <div>© {formData.copyright || 'บริษัทของคุณ'}</div>
                  <div className="text-gray-600">
                    {formData.contactEmail || '-'} | {formData.contactPhone || '-'}
                  </div>
                  <div className="text-gray-600 whitespace-pre-line">{formData.contactAddress || '-'}</div>
                </div>

                <div className="pt-2 border-t text-sm text-blue-600 space-y-1">
                  {formData.contactFacebook && <a href={formData.contactFacebook} target="_blank" className="block underline">Facebook</a>}
                  {formData.contactInstagram && <a href={formData.contactInstagram} target="_blank" className="block underline">Instagram</a>}
                  {formData.contactTwitter && <a href={formData.contactTwitter} target="_blank" className="block underline">Twitter/X</a>}
                  {formData.contactLinkedin && <a href={formData.contactLinkedin} target="_blank" className="block underline">LinkedIn</a>}
                </div>
              </div>
            </div>

            {/* Meta */}
            {record && (
              <div className="mt-4 p-4 border rounded-xl bg-gradient-to-b from-blue-50 to-purple-50 text-xs text-gray-600">
                <div>ID: {record.id}</div>
                <div>Created: {new Date(record.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(record.updatedAt).toLocaleString()}</div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
