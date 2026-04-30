import apiClient from "./api";

export async function deleteUsage(usageId: string) {
  try {
    const response = await apiClient.delete(`/usage/${usageId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Usage 삭제 실패 (ID: ${usageId}): `, error);
    const message = error?.response?.data?.message || error?.message || "알 수 없는 오류가 발생했습니다.";
    return { success: false, message };
  }
}
