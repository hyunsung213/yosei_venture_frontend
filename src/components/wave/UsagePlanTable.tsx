"use client";

import React, { useMemo, useEffect } from "react";
import { IUsagePlanItem } from "@/interface/interface";
import { Plus, Minus, AlertCircle } from "lucide-react";

interface UsagePlanTableProps {
  items: IUsagePlanItem[];
  canEdit: boolean;
  balance: number;
  onChangeItems?: (items: IUsagePlanItem[]) => void;
  onHasError?: (hasError: boolean) => void; // 부모 컴포넌트에게 예산 초과 여부를 알림
}

export default function UsagePlanTable({
  items,
  canEdit,
  balance,
  onChangeItems,
  onHasError,
}: UsagePlanTableProps) {
  const totalAmount = useMemo(() => {
    return items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [items]);

  const isOverBudget = totalAmount > balance;

  useEffect(() => {
    if (onHasError) {
      onHasError(isOverBudget);
    }
  }, [isOverBudget, onHasError]);

  const handleItemChange = (index: number, field: keyof IUsagePlanItem, value: string | number) => {
    if (!onChangeItems) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChangeItems(newItems);
  };

  const handleAddRow = () => {
    if (!onChangeItems) return;
    const newItem: IUsagePlanItem = {
      id: Date.now().toString(),
      month: "",
      day: "",
      category: "",
      purpose: "",
      amount: 0,
      note: "",
    };
    onChangeItems([...items, newItem]);
  };

  const handleRemoveRow = (id?: string) => {
    if (!onChangeItems || !id) return;
    onChangeItems(items.filter((item) => item.id !== id));
  };

  const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:ring-yonsei-blue focus:border-yonsei-blue sm:text-sm p-2 border outline-none";
  const readonlyClass = "w-full sm:text-sm p-2 text-gray-700 bg-transparent";

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">내역 작성</h3>
          {canEdit && (
            <p className="text-sm text-gray-500 mt-1">사용 내역을 수정할 수 있습니다.</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">팀 잔여 예산</p>
          <p className="text-xl font-extrabold text-yonsei-blue">
            {balance.toLocaleString()} 원
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">월</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">일</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">구분</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">용도</th>
              <th scope="col" className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">금액 (원)</th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">기타</th>
              {canEdit && (
                <th scope="col" className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">조작</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  작성된 내역이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-2">
                    {canEdit ? (
                      <input type="text" className={inputClass} value={item.month} onChange={(e) => handleItemChange(index, "month", e.target.value)} placeholder="MM" />
                    ) : (
                      <div className={readonlyClass}>{item.month}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {canEdit ? (
                      <input type="text" className={inputClass} value={item.day} onChange={(e) => handleItemChange(index, "day", e.target.value)} placeholder="DD" />
                    ) : (
                      <div className={readonlyClass}>{item.day}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {canEdit ? (
                      <input type="text" className={inputClass} value={item.category} onChange={(e) => handleItemChange(index, "category", e.target.value)} placeholder="구분" />
                    ) : (
                      <div className={readonlyClass}>{item.category}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {canEdit ? (
                      <input type="text" className={inputClass} value={item.purpose} onChange={(e) => handleItemChange(index, "purpose", e.target.value)} placeholder="용도" />
                    ) : (
                      <div className={readonlyClass}>{item.purpose}</div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {canEdit ? (
                      <input type="number" className={`${inputClass} text-right`} value={item.amount} onChange={(e) => handleItemChange(index, "amount", Number(e.target.value))} placeholder="0" />
                    ) : (
                      <div className={`${readonlyClass} text-right font-medium`}>{item.amount.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    {canEdit ? (
                      <input type="text" className={inputClass} value={item.note} onChange={(e) => handleItemChange(index, "note", e.target.value)} placeholder="비고" />
                    ) : (
                      <div className={readonlyClass}>{item.note}</div>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => handleRemoveRow(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="행 삭제">
                        <Minus className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {canEdit && (
            <tfoot>
              <tr>
                <td colSpan={7} className="px-2 py-3 bg-gray-50 border-t border-gray-200">
                  <button onClick={handleAddRow} className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-yonsei-blue hover:border-yonsei-blue hover:bg-blue-50 transition-all font-bold text-sm">
                    <Plus className="w-4 h-4" /> 항목 추가하기
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className={`mt-6 p-4 rounded-xl flex items-center justify-between border ${isOverBudget ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
        <span className={`text-base font-bold ${isOverBudget ? "text-red-700" : "text-gray-700"}`}>
          총 합계
        </span>
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-extrabold ${isOverBudget ? "text-red-600" : "text-yonsei-blue"}`}>
            {totalAmount.toLocaleString()} 원
          </span>
          {isOverBudget && (
            <span className="flex items-center gap-1 text-sm text-red-600 mt-1 font-bold">
              <AlertCircle className="w-4 h-4" /> 예산 잔고를 초과하였습니다.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
