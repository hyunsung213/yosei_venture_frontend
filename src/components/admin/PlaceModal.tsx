import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Place } from '@/interface/interface';

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Place | null;
  isLoading?: boolean;
}

export default function PlaceModal({ isOpen, onClose, onSubmit, initialData, isLoading }: PlaceModalProps) {
  const [name, setName] = useState('');
  const [describe, setDescribe] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescribe(initialData.describe || '');
        setExistingImages(initialData.imgs || []);
        setSelectedFiles([]);
        setPreviewUrls([]);
      } else {
        setName('');
        setDescribe('');
        setExistingImages([]);
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !describe.trim()) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('describe', describe);

    // Add existing images to keep
    existingImages.forEach((img) => {
      formData.append('existingImgs', img);
    });

    // Add new files
    selectedFiles.forEach((file) => {
      formData.append('imgs', file);
    });

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? '시설 수정' : '시설 추가'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">시설 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 연세대학교 미래캠퍼스 학생회관"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yonsei-blue focus:border-yonsei-blue transition outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">시설 설명</label>
              <textarea
                value={describe}
                onChange={(e) => setDescribe(e.target.value)}
                placeholder="시설에 대한 상세한 설명을 입력해주세요."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yonsei-blue focus:border-yonsei-blue transition outline-none h-32 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">이미지</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                    <img src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${img}`} alt="Existing" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {previewUrls.map((url, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-yonsei-blue hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-yonsei-blue">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold">이미지 추가</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-700 transition flex items-center gap-2"
              disabled={isLoading || (!name.trim() || !describe.trim())}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                initialData ? '수정 완료' : '추가하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
