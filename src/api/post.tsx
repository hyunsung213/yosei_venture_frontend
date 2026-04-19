import { Program, Rental } from "@/interface/interface";
import apiClient from "./api";

export async function postRental(data: Omit<Rental, '_id' | 'createdAt' | 'updatedAt'>) {
  try {
    console.group("📡 postRental 전송 데이터");
    console.log(data);
    console.groupEnd();
    const response = await apiClient.post(`/rental`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.group("❌ postRental 오류 상세");
    console.log("status:", error?.response?.status);
    console.log("data:", error?.response?.data);
    console.groupEnd();
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "대관 신청 중 오류가 발생했습니다.";
    return { success: false, message };
  }
}

export async function postProgram(programData: Program) {
  try {
    const response = await apiClient.post(`/program`, programData);
    return response.data;
  } catch (error) {
    console.log(`Program을 생성하는 데 실패했습니다!: `, error);
  }
}


export async function postProgramForm(formData: FormData) {
  try {
    console.group("📡 postProgramForm 전송 확인");
    for (const [key, val] of formData.entries()) {
      console.log(key, val instanceof File ? `[File] name=${val.name}, size=${val.size}bytes` : val);
    }
    console.groupEnd();

    // ⚠️ Content-Type 헤더를 수동 지정하면 boundary가 누락되어 400 오류 발생
    // axios가 FormData를 받으면 자동으로 multipart/form-data; boundary=... 를 설정함
    const response = await apiClient.post(`/program`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.group("❌ postProgramForm 오류 상세");
    console.log("status:", error?.response?.status);
    console.log("data:", error?.response?.data);
    console.log("message:", error?.message);
    console.groupEnd();
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "알 수 없는 오류가 발생했습니다.";
    return { success: false, message };
  }
}



export async function postRegistration(data: any) {
  try {
    // FormData인 경우 로깅을 위해 객체로 변환, 객체인 경우 그대로 사용
    const logData = data instanceof FormData ? Object.fromEntries(data.entries()) : data;
    console.log("Registration 전송 데이터: ", logData);

    const response = await apiClient.post(`/registration`, data);
    return response.data;
  } catch (error: any) {
    console.log(`신청하는 데 실패했습니다!: `, error);
    return { 
      success: false, 
      message: error?.response?.data?.message || "서버와 통신 중 오류가 발생했습니다." 
    };
  }
}

export async function postNotice(formData: FormData) {
  try {
    const response = await apiClient.post(`/notice`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "공지사항 생성 실패" };
  }
}

export async function postNews(formData: FormData) {
  try {
    const response = await apiClient.post(`/news`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "뉴스 생성 실패" };
  }
}

export async function postQA(data: any) {
  try {
    const response = await apiClient.post(`/qa`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "QA 등록 실패" };
  }
}

export async function postRequest(formData: FormData) {
  try {
    const response = await apiClient.post(`/request`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "처리 요청 실패" };
  }
}

export async function postComment(data: any) {
  try {
    const response = await apiClient.post(`/comment`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "검토 의견 등록 실패" };
  }
}