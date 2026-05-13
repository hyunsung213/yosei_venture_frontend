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
    return { success: false, message };
  }
}

export async function putEtcData(where: string, data: any) {
  try {
    const response = await apiClient.put(`/etc/${where}`, data, {
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

export async function putUsage(usageId: string, data: any) {
  try {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(`/usage/${usageId}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Usage 수정 실패 (ID: ${usageId}): `, error);
    const message = error?.response?.data?.message || error?.message || "알 수 없는 오류가 발생했습니다.";
    return { success: false, message };
  }
}

export async function putPlan(planId: string, data: any) {
  try {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(`/plan/${planId}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Plan 수정 실패" };
  }
}

export async function putQA(qaId: string, data: any) {
  try {
    const response = await apiClient.put(`/qa/${qaId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`QA 수정 실패 (ID: ${qaId}): `, error);
    const message = error?.response?.data?.message || error?.message || "QA 수정 실패";
    return { success: false, message };
  }
}

export async function putNotice(noticeId: string, formData: FormData) {
  try {
    const response = await apiClient.put(`/notice/${noticeId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Notice 수정 실패 (ID: ${noticeId}): `, error);
    const message = error?.response?.data?.message || error?.message || "공지사항 수정 실패";
    return { success: false, message };
  }
}

export async function putTeam(teamId: string, formData: FormData) {
  try {
    const response = await apiClient.put(`/team/${teamId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Team 수정 실패 (ID: ${teamId}): `, error);
    const message = error?.response?.data?.message || error?.message || "팀 수정 실패";
    return { success: false, message };
  }
}

export async function putPlace(placeId: string, formData: any) {
  try {
    const response = await apiClient.put(`/place/${placeId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Place 수정 실패 (ID: ${placeId}): `, error);
    return { success: false, message: error?.response?.data?.message || "시설 수정 실패" };
  }
}

export async function putUser(userId: string, data: { name?: string; phone?: string; studentId?: string; type?: string; pwd?: string }) {
  try {
    const response = await apiClient.put(`/user/${userId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`User 수정 실패 (ID: ${userId}): `, error);
    return { success: false, message: error?.response?.data?.message || "유저 정보 수정 실패" };
  }
}
