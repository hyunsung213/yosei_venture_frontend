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

export async function deleteQA(qaId: string) {
  try {
    const response = await apiClient.delete(`/qa/${qaId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`QA 삭제 실패 (ID: ${qaId}): `, error);
    const message = error?.response?.data?.message || error?.message || "QA 삭제 실패";
    return { success: false, message };
  }
}

export async function deleteProgram(programId: string) {
  try {
    const response = await apiClient.delete(`/program/${programId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Program 삭제 실패 (ID: ${programId}): `, error);
    const message = error?.response?.data?.message || error?.message || "프로그램 삭제 실패";
    return { success: false, message };
  }
}

export async function deleteNotice(noticeId: string) {
  try {
    const response = await apiClient.delete(`/notice/${noticeId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Notice 삭제 실패 (ID: ${noticeId}): `, error);
    const message = error?.response?.data?.message || error?.message || "공지사항 삭제 실패";
    return { success: false, message };
  }
}

export async function deletePlace(placeId: string) {
  try {
    const response = await apiClient.delete(`/place/${placeId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Place 삭제 실패 (ID: ${placeId}): `, error);
    return { success: false, message: error?.response?.data?.message || "시설 삭제 실패" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await apiClient.delete(`/user/${userId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`User 삭제 실패 (ID: ${userId}): `, error);
    return { success: false, message: error?.response?.data?.message || "유저 삭제 실패" };
  }
}
