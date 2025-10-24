'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa'
import AdminModalAdd from '@/containers/admin/AdminModalAdd'
import AdminModalView from '@/containers/admin/AdminModalView'
import AdminModalEdit from '@/containers/admin/AdminModalEdit'
import AdminModalDelete from '@/containers/admin/AdminModalDelete'

interface AdminUser {
  id: string
  email: string
  username: string
  name?: string
  phone?: string
  accountNumber: string
  avatar: string
  createdAt: string
  updatedAt: string
}

interface PaginationResponse {
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<PaginationResponse>({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        pageSize: pagination.pageSize.toString(),
        ...(search && { search })
      })

      const res = await fetch(`/api/admin?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [pagination.currentPage, search])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการ Admin</h1>
        <AdminModalAdd onCreated={() => fetchAdmins()} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ข้อมูลติดต่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บัญชี
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    ไม่พบ admin
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={admin.avatar}
                            alt={admin.username}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.name || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {admin.email}
                      </div>
                      {admin.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <FaPhone className="text-gray-400" />
                          {admin.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <FaIdCard className="text-gray-400" />
                        {admin.accountNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <AdminModalView data={admin} />
                        <AdminModalEdit data={admin} onUpdated={() => fetchAdmins()} />
                        <AdminModalDelete data={admin} onDeleted={() => fetchAdmins()} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              หน้า {pagination.currentPage} จาก {pagination.totalPages} ({pagination.totalItems} คน)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: Math.max(1, pagination.currentPage - 1) })}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPagination({ ...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1) })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
