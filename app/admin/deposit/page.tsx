'use client'

import PaginationSelect from '@/components/PaginationSelect'
import { DepositList, PaginationResponse } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import DepositModalAdd from '@/containers/deposit/DepositModalAdd'


export default function DepositsPage() {
  const [dataList, setDataList] = useState<DepositList[] | null>(null)
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    pageSize: 12,
    currentPage: 1,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: 'PENDING',
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const querySig = useMemo(
    () =>
      JSON.stringify({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: pagination.keyword,
        status: pagination.status ?? 'PENDING',
      }),
    [pagination.page, pagination.pageSize, pagination.keyword, pagination.status]
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

  const handleApprove = async (depositId: string) => {
    setProcessing(depositId);
    try {
      const res = await fetch(`/api/deposits/${depositId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved by admin' }),
      });

      if (res.ok) {
        await fetchDeposits();
      } else {
        const error = await res.json();
        console.log(93, `error: ${error}`, error.error);
        alert(error.error || 'Failed to approve deposit');
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
      alert('Failed to approve deposit');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (depositId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessing(depositId);
    try {
      const res = await fetch(`/api/deposits/${depositId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        await fetchDeposits();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to reject deposit');
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      alert('Failed to reject deposit');
    } finally {
      setProcessing(null);
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
  useEffect(() => {
    console.log(dataList);
  }, [dataList]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">จัดการเติมเครดิต</h1>
        {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          เพิ่มรายการเติมเครดิต
        </button> */}
        <DepositModalAdd />
        {/* <div className="flex gap-2">
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
        </div> */}
      </div>

      {dataList && dataList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dataList.map((deposit) => (
            <div key={deposit.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* <img
                      src={deposit.user?.avatar}
                      alt={deposit.user?.username}
                      className="w-10 h-10 rounded-full"
                    /> */}
                    <div>
                      <h3 className="font-semibold text-gray-900">{deposit.user?.username}</h3>
                      <p className="text-sm text-gray-500">{deposit.user?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${deposit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    deposit.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {deposit.status === 'PENDING' ? 'รอดำเนินการ' :
                      deposit.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {deposit.amount.toLocaleString()} บาท
                  </p>
                  <p className="text-sm text-gray-500">
                    อัตราแลกเปลี่ยน: {deposit.rate}x
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">สลิปอ้างอิง:</p>
                  <img
                    src={deposit.slipImage?.imageUrl}
                    alt="Payment slip"
                    className="w-full aspect-[4/3] object-cover rounded border"
                  />
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>วันที่: {new Date(deposit.createdAt).toLocaleDateString('th-TH')}</p>
                  {deposit.comment && (
                    <p>หมายเหตุ: {deposit.comment}</p>
                  )}
                </div>

                {deposit.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(deposit.id)}
                      disabled={processing === deposit.id}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === deposit.id ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                    </button>
                    <button
                      onClick={() => handleReject(deposit.id)}
                      disabled={processing === deposit.id}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === deposit.id ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">ยังไม่มีรายการเติมเครดิต</p>
        </div>
      )}

      {dataList && dataList.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-t">
            <PaginationSelect params={pagination} setParams={setPagination} />
          </div>
        </div>
      )}
    </div>
  )
}

