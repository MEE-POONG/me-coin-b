'use client'

import PaginationSelect from '@/components/PaginationSelect'
import { PaginationResponse } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import DepositModalView from '@/containers/deposit/DepositModalView'
import DepositModalAdd from '@/containers/deposit/DepositModalAdd'
import DepositModalEdit from '@/containers/deposit/DepositModalEdit'
import DepositModalDelete from '@/containers/deposit/DepositModalDelete'

interface DepositWithUser {
  id: string;
  amount: number;
  slipImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rate: number;
  comment?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
}

export default function DepositHistoryPage() {
  const [dataList, setDataList] = useState<DepositWithUser[] | null>(null)
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    pageSize: 20,
    currentPage: 1,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);

  const querySig = useMemo(
    () =>
      JSON.stringify({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: pagination.keyword,
        status: pagination.status ?? '',
      }),
    [
      pagination.page,
      pagination.pageSize,
      pagination.keyword,
      pagination.status,
    ]
  );

  const fetchDeposits = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const p = JSON.parse(querySig);
      const qs = new URLSearchParams({
        page: String(p.page),
        pageSize: String(p.pageSize),
        keyword: p.keyword || '',
        status: p.status || '',
      }).toString();

      const res = await fetch(`/api/deposits?${qs}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setDataList(data.data ?? []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (e) {
      if ((e as any)?.name !== 'AbortError') {
        console.error('Error fetching deposits:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDeposits(controller.signal);
    return () => controller.abort();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">ประวัติการเติมเครดิต</h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
            value={pagination.keyword || ''}
            onChange={(e) => setPagination(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={pagination.status || ''}
            onChange={(e) => setPagination(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทุกสถานะ</option>
            <option value="PENDING">รอดำเนินการ</option>
            <option value="APPROVED">อนุมัติแล้ว</option>
            <option value="REJECTED">ปฏิเสธ</option>
          </select>
          <DepositModalAdd 
            onCreated={() => {
              const controller = new AbortController();
              fetchDeposits(controller.signal);
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ใช้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนเงิน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สลิปอ้างอิง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมายเหตุ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataList?.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={deposit.user.avatar}
                        alt={deposit.user.username}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {deposit.user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deposit.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deposit.amount.toLocaleString()} บาท
                    </div>
                    <div className="text-sm text-gray-500">
                      อัตรา: {deposit.rate}x
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      deposit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      deposit.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {deposit.status === 'PENDING' ? 'รอดำเนินการ' :
                     deposit.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={deposit.slipImage}
                      alt="Payment slip"
                      className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => window.open(deposit.slipImage, '_blank')}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deposit.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {deposit.comment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <DepositModalView 
                        data={deposit}
                        triggerClassName="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      />
                      <DepositModalEdit 
                        data={deposit}
                        onUpdated={() => {
                          const controller = new AbortController();
                          fetchDeposits(controller.signal);
                        }}
                        triggerClassName="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      />
                      <DepositModalDelete 
                        data={deposit}
                        onDeleted={() => {
                          const controller = new AbortController();
                          fetchDeposits(controller.signal);
                        }}
                        triggerClassName="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dataList && dataList.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">ยังไม่มีประวัติการเติมเครดิต</p>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 border-t">
          <PaginationSelect params={pagination} setParams={setPagination} />
        </div>
      </div>
    </div>
  )
}
