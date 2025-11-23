'use client'

import { useEffect, useMemo, useState } from 'react'
import PaginationSelect from '@/components/PaginationSelect'
import { PaginationResponse, TransactionJoinedList } from '@/types'

/** แปลงเลขเป็นรูปแบบมีคอมมา */
const formatAmount = (num?: number | null) =>
  (num ?? 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })

/** สีป้ายตามประเภทธุรกรรม */
const typeBadge = (type?: string) => {
  switch (type) {
    case 'DEPOSIT': return 'bg-blue-100 text-blue-800'
    case 'WITHDRAWAL': return 'bg-yellow-100 text-yellow-800'
    case 'PURCHASE': return 'bg-indigo-100 text-indigo-800'
    case 'GIFT': return 'bg-pink-100 text-pink-800'
    case 'TRANSFER': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

/** สีป้ายตามสถานะธุรกรรม */
const txStatusBadge = (status?: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'PENDING': return 'bg-amber-100 text-amber-800'
    case 'FAILED': return 'bg-red-100 text-red-800'
    case 'CANCELLED': return 'bg-gray-200 text-gray-700'
    default: return 'bg-gray-100 text-gray-800'
  }
}

/** สีป้ายตามสถานะย่อยของการฝาก/ถอน */
const subStatusBadge = (status?: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'PENDING': return 'bg-amber-100 text-amber-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function TransactionsPage() {
  const [dataList, setDataList] = useState<TransactionJoinedList[] | null>(null)
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    pageSize: 10,
    currentPage: 1,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    totalPages: 1,
    totalItems: 0,
  })
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // ใช้เฉพาะ "พารามิเตอร์ที่มีผลต่อการยิง API" ทำเป็นลายเซ็น
  const querySig = useMemo(
    () =>
      JSON.stringify({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: pagination.keyword,
        typeKeyword: pagination.typeKeyword ?? '',
        status: pagination.status ?? '',
        sortBy: pagination.sortBy ?? '',
        sortOrder: pagination.sortOrder ?? '',
        search: pagination.search ?? '',
        typeSearch: pagination.typeSearch ?? '',
        isActive: pagination.isActive ?? null,
        isDeleted: pagination.isDeleted ?? null,
      }),
    [
      pagination.page,
      pagination.pageSize,
      pagination.keyword,
      pagination.typeKeyword,
      pagination.status,
      pagination.sortBy,
      pagination.sortOrder,
      pagination.search,
      pagination.typeSearch,
      pagination.isActive,
      pagination.isDeleted,
    ]
  )

  // เทียบเฉพาะคีย์ที่ทำให้ "ต้องยิง API ใหม่"
  const isSameQuery = (a: Partial<PaginationResponse>, b: Partial<PaginationResponse>) => {
    const keys: (keyof PaginationResponse)[] = [
      'page', 'pageSize', 'keyword', 'typeKeyword', 'status',
      'sortBy', 'sortOrder', 'search', 'typeSearch', 'isActive', 'isDeleted'
    ]
    return keys.every((k) => (a[k] ?? null) === (b[k] ?? null))
  }

  const fetchTransactions = async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const p = JSON.parse(querySig) // ใช้ค่าจาก signature ให้คงที่ในรอบนี้
      const qs = new URLSearchParams({
        page: String(p.page),
        pageSize: String(p.pageSize),
        keyword: p.keyword || '',
        typeKeyword: p.typeKeyword || '',
        status: p.status || '',
        sortBy: p.sortBy || '',
        sortOrder: p.sortOrder || '',
        search: p.search || '',
        typeSearch: p.typeSearch || '',
        ...(p.isActive !== null && p.isActive !== undefined ? { isActive: String(p.isActive) } : {}),
        ...(p.isDeleted !== null && p.isDeleted !== undefined ? { isDeleted: String(p.isDeleted) } : {}),
      }).toString()

      const res = await fetch(`/api/transactions?${qs}`, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      setDataList(data?.data ?? [])
      // อัปเดต pagination เฉพาะเมื่อ "พารามิเตอร์ยิง API" เปลี่ยนจริง
      setPagination((prev) => {
        const next: PaginationResponse = { ...prev, ...data.pagination }
        if (isSameQuery(prev, next)) {
          // รับเฉพาะเมตาที่ server ส่งมา
          const metaKeys: (keyof PaginationResponse)[] = ['totalItems', 'totalPages', 'currentPage']
          let changed = false
          const merged = { ...prev }
          metaKeys.forEach((k) => {
            if ((prev[k] ?? null) !== (next[k] ?? null)) {
              // @ts-ignore
              merged[k] = next[k]
              changed = true
            }
          })
          return changed ? merged : prev
        }
        return next
      })
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Error fetching transactions:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchTransactions(controller.signal)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [querySig])
  useEffect(() => {
    console.log(dataList);
  }, [dataList]);
  if (loading && !dataList) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการธุรกรรม</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สลิป/หลักฐาน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ตรวจอนุมัติ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดคงเหลือ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ทำรายการ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>


          </table>
        </div>

        {dataList && dataList.length === 0 && (
          <div className="text-center py-12 text-gray-500">ยังไม่มีธุรกรรมในระบบ</div>
        )}

        <div className="bg-gray-50 px-6 py-4 border-t">
          <PaginationSelect params={pagination} setParams={setPagination} />
        </div>
      </div>
    </div>
  )
}
