'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Modal from './Modal'

interface ImageUploadFieldProps {
  label: string
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  error?: string
  fieldName: string
  showPreview?: boolean
}

interface GalleryImage {
  id: string
  nameFile: string
  imageUrl: string
  modalName: string
  createdAt: string
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  disabled = false,
  error,
  fieldName,
  showPreview = true
}: ImageUploadFieldProps) {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)
  const [selectedModalName, setSelectedModalName] = useState<string>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const loadGallery = async (modalName: string = 'all') => {
    setLoadingGallery(true)
    try {
      const params = new URLSearchParams({ pageSize: '100' })
      if (modalName && modalName !== 'all') {
        params.append('modalName', modalName)
      }

      const response = await fetch(`/api/images?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setGalleryImages(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load gallery:', err)
      alert('Failed to load gallery')
    } finally {
      setLoadingGallery(false)
    }
  }

  useEffect(() => {
    if (showGallery) {
      loadGallery(selectedModalName)
    }
  }, [showGallery, selectedModalName])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('nameFile', `settings-${fieldName}-${Date.now()}`)
      formData.append('modalName', 'settings')
      formData.append('createdBy', session?.user?.email || 'admin')

      const response = await fetch('/api/images/upload-and-save', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      if (result.success && result.data?.imageUrl) {
        onChange(result.data.imageUrl)
        alert('Image uploaded successfully!')
        // Clear file input
        e.target.value = ''
      } else {
        throw new Error('Upload failed: No image URL returned')
      }
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleSelectFromGallery = (imageUrl: string) => {
    onChange(imageUrl)
    setShowGallery(false)
  }

  const handleClearImage = () => {
    onChange('')
  }

  // Filter images by search keyword
  const filteredImages = galleryImages.filter(img =>
    !searchKeyword ||
    img.nameFile.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
      </label>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={handleUrlChange}
          disabled={disabled}
          placeholder="https://..."
          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {!disabled && value && (
          <button
            type="button"
            onClick={handleClearImage}
            className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            title="Clear image"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Action Buttons */}
      {!disabled && (
        <div className="flex gap-2">
          {/* File Upload Button */}
          <label className="flex-1 cursor-pointer">
            <div className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Gallery Button */}
          <button
            type="button"
            onClick={() => setShowGallery(true)}
            className="flex-1 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Choose from Gallery
          </button>
        </div>
      )}

      {/* Image Preview */}
      {showPreview && value && (
        <div className="mt-2">
          <img
            src={value}
            alt={label}
            className="h-24 w-auto object-contain border border-gray-300 rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Gallery Modal */}
      <Modal open={showGallery} onOpenChange={setShowGallery}>
        <Modal.Header>
          <Modal.Title>Select Image from Gallery</Modal.Title>
          <Modal.Close>{null}</Modal.Close>
        </Modal.Header>

        <Modal.Body>
          {/* Filter and Search */}
          <div className="mb-4 space-y-3">
            {/* Modal Name Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Filter by Type</label>
              <select
                value={selectedModalName}
                onChange={(e) => setSelectedModalName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Images</option>
                <option value="settings">Settings</option>
                <option value="deposit">Deposit Slips</option>
                <option value="withdrawal">Withdrawal Slips</option>
                <option value="profile">Profile</option>
                <option value="banner">Banner</option>
                <option value="logo">Logo</option>
                <option value="gallery">Gallery</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Search by Filename</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search images..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Results Count */}
            {!loadingGallery && (
              <div className="text-sm text-gray-600">
                Showing {filteredImages.length} of {galleryImages.length} images
              </div>
            )}
          </div>

          {loadingGallery ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading gallery...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No images found.</p>
              <p className="text-sm mt-2">
                {searchKeyword
                  ? 'Try adjusting your search or filter.'
                  : 'Upload your first image using the Upload button.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2">
              {filteredImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleSelectFromGallery(img.imageUrl)}
                  className={`relative group p-2 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-all ${
                    value === img.imageUrl
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  title={img.nameFile}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.nameFile}
                    className="w-full h-16 object-cover rounded"
                  />
                  {value === img.imageUrl && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {img.nameFile}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            type="button"
            onClick={() => setShowGallery(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
