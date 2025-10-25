'use client'

import PaginationSelect from '@/components/PaginationSelect'
import { PaginationResponse } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import { GalleryDB } from '@prisma/client'
import GalleryModalAdd from '@/containers/gallery/GalleryModalAdd'
import GalleryModalView from '@/containers/gallery/GalleryModalView'
import GalleryModalEdit from '@/containers/gallery/GalleryModalEdit'
import GalleryModalDelete from '@/containers/gallery/GalleryModalDelete'
import { ImageListUtils } from '@/lib/ImageListDB'
import ReactIconComponent from '@/components/ReactIconComponent'


export default function GalleryPage() {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<GalleryDB[]>([])
  const [pagination, setPagination] = useState<PaginationResponse>({
    page: 1,
    pageSize: 12,
    currentPage: 1,
    keyword: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    totalPages: 1,
    totalItems: 0,
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const querySig = useMemo(
    () =>
      JSON.stringify({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: pagination.keyword,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
      }),
    [
      pagination.page,
      pagination.pageSize,
      pagination.keyword,
      pagination.sortBy,
      pagination.sortOrder,
    ]
  );

  const fetchImages = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const p = JSON.parse(querySig);
      const qs = new URLSearchParams({
        page: String(p.page),
        pageSize: String(p.pageSize),
        keyword: p.keyword || '',
        sortBy: p.sortBy || 'createdAt',
        sortOrder: p.sortOrder || 'desc',
      }).toString();

      const res = await fetch(`/api/images?${qs}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setDataList(data.data ?? []);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (e) {
      if ((e as any)?.name !== 'AbortError') {
        console.error('Error fetching images:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchImages(controller.signal);
    return () => controller.abort();
  }, [querySig]);

  if (loading && !dataList.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">แกลเลอรี่รูปภาพ</h1>
        <div className="flex gap-3 items-center">
          {/* เปลี่ยนโหมดดู */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ReactIconComponent icon="FaTh" setClass="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ReactIconComponent icon="FaList" setClass="w-4 h-4" />
            </button>
          </div>
          
          <GalleryModalAdd onCreated={() => fetchImages()} />
        </div>
      </div>

      {/* Search และ Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์..."
              value={pagination.keyword || ''}
              onChange={(e) => setPagination(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={pagination.sortBy}
              onChange={(e) => setPagination(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">วันที่สร้าง</option>
              <option value="updatedAt">วันที่แก้ไข</option>
              <option value="nameFile">ชื่อไฟล์</option>
            </select>
            <select
              value={pagination.sortOrder}
              onChange={(e) => setPagination(prev => ({ ...prev, sortOrder: e.target.value as any, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">ใหม่ล่าสุด</option>
              <option value="asc">เก่าสุด</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {viewMode === 'grid' ? (
          // Grid View
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {dataList?.map((image) => (
                <div key={image.id} className="group bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={ImageListUtils.getVariantUrl(image.imageUrl, 'small')}
                      alt={image.nameFile}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(image.imageUrl, '_blank')}
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/200';
                      }}
                    />
                    
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <GalleryModalView 
                          data={image}
                          triggerClassName="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        />
                        <GalleryModalEdit 
                          data={image}
                          onUpdated={() => fetchImages()}
                          triggerClassName="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        />
                        <GalleryModalDelete 
                          data={image}
                          onDeleted={() => fetchImages()}
                          triggerClassName="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={image.nameFile}>
                      {image.nameFile}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {image.modalName || 'ไม่ระบุประเภท'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(image.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {dataList && dataList.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ReactIconComponent icon="FaImage" setClass="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl">ยังไม่มีรูปภาพในแกลเลอรี่</p>
                <p className="text-sm mt-2">เริ่มต้นด้วยการเพิ่มรูปภาพใหม่</p>
              </div>
            )}
          </div>
        ) : (
          // Table View
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รูปภาพ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อไฟล์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สร้างโดย
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataList?.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={ImageListUtils.getVariantUrl(image.imageUrl, 'thumbnail')}
                        alt={image.nameFile}
                        className="w-12 h-12 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/48';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {image.nameFile}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {image.modalName || 'ไม่ระบุ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {image.createdBy || 'ไม่ระบุ'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <GalleryModalView 
                          data={image}
                          triggerClassName="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        />
                        <GalleryModalEdit 
                          data={image}
                          onUpdated={() => fetchImages()}
                          triggerClassName="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        />
                        <GalleryModalDelete 
                          data={image}
                          onDeleted={() => fetchImages()}
                          triggerClassName="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {dataList && dataList.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ReactIconComponent icon="FaImage" setClass="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl">ยังไม่มีรูปภาพในแกลเลอรี่</p>
                <p className="text-sm mt-2">เริ่มต้นด้วยการเพิ่มรูปภาพใหม่</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 px-6 py-4 border-t">
          <PaginationSelect params={pagination} setParams={setPagination} />
        </div>
      </div>
    </div>
  )
}

