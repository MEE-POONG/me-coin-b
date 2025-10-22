'use client'

import PaginationSelect from '@/components/PaginationSelect'
import { PaginationResponse } from '@/types'
import { User } from '@prisma/client'
import { useEffect, useMemo, useState } from 'react'



interface UsersResponse {
  users: User[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export default function UsersPage() {
  const [dataList, setDataList] = useState<User[] | null>(null)
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    pageSize: 10,
    currentPage: 1,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);

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
);

// เทียบเฉพาะคีย์ที่ทำให้ "ต้องยิง API ใหม่"
const isSameQuery = (a: Partial<PaginationResponse>, b: Partial<PaginationResponse>) => {
  const keys: (keyof PaginationResponse)[] = [
    'page','pageSize','keyword','typeKeyword','status',
    'sortBy','sortOrder','search','typeSearch','isActive','isDeleted'
  ];
  return keys.every((k) => (a[k] ?? null) === (b[k] ?? null));
};


const fetchUsers = async (signal?: AbortSignal) => {
  setLoading(true);
  try {
    const p = JSON.parse(querySig); // ใช้ค่าจาก signature ให้คงที่ในรอบนี้
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
    }).toString();

    const res = await fetch(`/api/users?${qs}`, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    setDataList(data.data ?? []);

    // อัปเดต pagination เฉพาะเมื่อ "พารามิเตอร์ยิง API" เปลี่ยนจริง
    setPagination((prev) => {
      const next: PaginationResponse = { ...prev, ...data.pagination };
      // ถ้าพารามิเตอร์คงเดิม ไม่ต้อง set (กันลูป/เรนเดอร์ซ้ำ)
      if (isSameQuery(prev, next)) {
        // แต่ยังคงรับค่าพวก totalItems/totalPages/currentPage ที่ server ส่งมา
        const metaKeys: (keyof PaginationResponse)[] = ['totalItems','totalPages','currentPage'];
        let changed = false;
        const merged = { ...prev };
        metaKeys.forEach((k) => {
          if ((prev[k] ?? null) !== (next[k] ?? null)) {
            // @ts-ignore
            merged[k] = next[k];
            changed = true;
          }
        });
        return changed ? merged : prev;
      }
      return next;
    });
  } catch (e) {
    if ((e as any)?.name !== 'AbortError') {
      console.error('Error fetching users:', e);
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const controller = new AbortController();
  fetchUsers(controller.signal);
  return () => controller.abort();
  // ผูกกับ querySig เท่านั้น กันลูปจากการเปลี่ยน object reference
}, [querySig]);

  if (loading && !dataList) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">จัดการผู้ใช้</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สิทธิ์
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดเครดิต
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สมัคร
                </th>
              </tr>
            </thead>
            <tbody>
              {dataList?.map((user) => (
                <tr key={user?.id} className="hover:bg-gray-50">
                  {/* ชื่อผู้ใช้ */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user?.username || '-'}
                  </td>

                  {/* อีเมล */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user?.email || '—'}
                  </td>

                  {/* บทบาท */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user?.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user?.role === 'PREMIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {user?.role === 'ADMIN'
                        ? 'แอดมิน'
                        : user?.role === 'PREMIUM'
                          ? 'พรีเมียม'
                          : 'ผู้ใช้ทั่วไป'}
                    </span>
                  </td>

                  {/* ยอดเงินในบัญชี */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {(user?.accountNumber ?? 0).toLocaleString()} บาท
                  </td>

                  {/* วันที่สร้างบัญชี */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user?.createdAt
                      ? new Date(user?.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {dataList && dataList?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            ยังไม่มีผู้ใช้ในระบบ
          </div>
        )}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <PaginationSelect params={pagination} setParams={setPagination} />
        </div>
      </div>
    </div>
  )
}

