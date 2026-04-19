'use client';

import { useState } from 'react';
import { Edit3, Save, X, Loader2 } from 'lucide-react';
import { putEtcData } from '@/api/put';
import { useAuth } from '@/contexts/AuthContext';

interface AdminContentEditorProps {
  where: string;
  initialData: any;
  onSuccess?: () => void;
}

export default function AdminContentEditor({ where, initialData, onSuccess }: AdminContentEditorProps) {
  const { role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    // 깊은 복사로 초기화
    setFormData(JSON.parse(JSON.stringify(initialData)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await putEtcData(where, formData);
      if (res.success) {
        alert('내용이 성공적으로 수정되었습니다.');
        setIsEditing(false);
        if (onSuccess) onSuccess();
        window.location.reload(); // 새로고침하여 바뀐 정보 표출
      } else {
        alert(`수정 실패: ${res.message}`);
      }
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (keys: string[], value: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleJsonFieldChange = (keys: string[], value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData((prev: any) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = parsed;
        return newData;
      });
    } catch (e) {
      // JSON 파싱 에러 시 무시 (사용자가 작성 중일 수 있으므로 상태에 바로 반영하지 않거나 에러 표시를 할 수 있지만, 간단히 하기 위해 무시)
    }
  };

  // 재귀적으로 데이터 렌더링
  const renderTableRows = (data: any, parentKeys: string[] = []) => {
    return Object.keys(data).map((key) => {
      const value = data[key];
      const keys = [...parentKeys, key];
      const keyPath = keys.join('.');

      if (typeof value === 'object' && value !== null) {
        // 객체나 배열인 경우 Textarea에 JSON 문자열로 제공 (편집의 유연함 제공)
        return (
          <tr key={keyPath} className="border-b border-gray-100">
            <td className="p-4 bg-gray-50 text-sm font-bold text-gray-700 align-top w-1/3">
              {keyPath}
            </td>
            <td className="p-4">
              <textarea 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yonsei-blue/50 outline-none font-mono"
                rows={5}
                defaultValue={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData((prev: any) => {
                      const newData = { ...prev };
                      let current = newData;
                      for (let i = 0; i < keys.length - 1; i++) {
                        current[current.length ? Number(keys[i]) : keys[i]] = current[current.length ? Number(keys[i]) : keys[i]];
                      }
                      current[keys.length ? Number(keys[keys.length - 1]) : keys[keys.length - 1]] = parsed;
                      // 배열 인덱스와 객체 키 처리를 위해 단순화된 재귀 갱신을 사용
                      return newData;
                    });
                  } catch(e) {}
                  
                  // 간이 로직: 전체 문자열을 통으로 업데이트
                  handleJsonFieldChange(keys, e.target.value);
                }}
              />
              <p className="text-xs text-gray-400 mt-1">* JSON 형식으로 입력해야 합니다.</p>
            </td>
          </tr>
        );
      }

      return (
        <tr key={keyPath} className="border-b border-gray-100 bg-white">
          <td className="p-4 bg-gray-50 text-sm font-bold text-gray-700 w-1/3">
            {keyPath}
          </td>
          <td className="p-4">
            <input 
              type="text" 
              value={value || ''}
              onChange={(e) => handleFieldChange(keys, e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-yonsei-blue/50 outline-none"
            />
          </td>
        </tr>
      );
    });
  };

  if (role !== 'super') return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      {!isEditing ? (
        <div className="flex justify-end">
          <button 
            onClick={startEditing}
            className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            내용 수정하기 (관리자)
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 -mx-4 md:-mx-12 lg:-mx-20">
          <div className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-yonsei-blue" />
              데이터 원본 수정
            </h3>
            <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="p-4 text-sm font-black text-gray-700 border-r border-gray-200 w-1/3">요소 (Key)</th>
                  <th className="p-4 text-sm font-black text-gray-700">내용 (Value)</th>
                </tr>
              </thead>
              <tbody>
                {formData && renderTableRows(formData)}
              </tbody>
            </table>
          </div>

          <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button 
              onClick={cancelEditing}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition"
            >
              취소
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-yonsei-blue text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
