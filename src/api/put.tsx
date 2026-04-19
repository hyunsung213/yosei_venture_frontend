import apiClient from "./api";

export async function putProgramForm(programId: string, formData: FormData) {
  try {
    const response = await apiClient.put(`/program/${programId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Program(multipart) 수정 실패 (ID: ${programId}): `, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "알 수 없는 오류가 발생했습니다.";
  }
}

export async function putEtcData(where: string, data: any) {
  try {
    const response = await apiClient.put(`/etc/name?where=${where}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Etc Data 수정 실패 (where: ${where}): `, error);
    const message = error?.response?.data?.message || "알 수 없는 오류가 발생했습니다.";
    return { success: false, message };
  }
}

export async function putRequest(requestId: string, formData: FormData) {
  try {
    const response = await apiClient.put(`/request/${requestId}`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "요청 수정 실패" };
  }
}

export async function putRequestStatus(requestId: string, data: { state: string }) {
  try {
    const response = await apiClient.put(`/request/${requestId}/status`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "상태 변경 실패" };
  }
}
