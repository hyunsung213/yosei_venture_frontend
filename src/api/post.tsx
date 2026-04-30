import { IComment, INews, INotice, IProgram, IQa, Program } from "@/interface/interface";
import apiClient from "./api";


export async function postProgram(formData: any) {
  try {
    const response = await apiClient.post(`/program`, formData);
    return response.data;
  } catch (error: any) {
    console.log(`Program을 생성하는 데 실패했습니다!: `, error);
    return { success: false, message: error?.message || "생성 실패" };
  }
}

export async function postNotice(formData: any) {
  try {
    const response = await apiClient.post(`/notice`, formData);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "공지사항 생성 실패" };
  }
}

export async function postNews(formData: any) {
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

export async function postComment(data: any) {
  try {
    const response = await apiClient.post(`/comment`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "검토 의견 등록 실패" };
  }
}

export async function postUsage(data: any) {
  try {
    const response = await apiClient.post(`/usage`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "내역 등록 실패" };
  }
}

export async function postTeam(data: any) {
  try {
    const response = await apiClient.post(`/team`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "팀 생성 실패" };
  }
}

export async function postRental(data: any) {
  try {
    const response = await apiClient.post(`/rental`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "대관 신청 실패" };
  }
}