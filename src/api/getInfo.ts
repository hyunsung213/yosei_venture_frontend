import apiClient from "./axiosConfig";

/**
 * 센터소개 데이터를 백엔드에서 받아옵니다.
 * 백엔드 라우트가 /api/etc/name?where=xxx 로 응답한다고 가정하며 (axiosConfig의 baseURL이 /api 이므로 /etc/name 로 요청)
 * 리턴된 JSON에서 data 필드를 추출해 반환합니다.
 */

export async function getGreetings() {
  try {
    const response = await apiClient.get('/etc/name?where=greetings');
    // 백엔드가 배열로 응답하는지 단일 객체로 응답하는지에 따라 유연하게 대응
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("greetings 호출 실패:", error);
    return null;
  }
}

export async function getMissionVision() {
  try {
    const response = await apiClient.get('/etc/name?where=missionVision');
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("missionVision 호출 실패:", error);
    return null;
  }
}

export async function getHistory() {
  try {
    const response = await apiClient.get('/etc/name?where=history');
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("history 호출 실패:", error);
    return null;
  }
}

export async function getOrganization() {
  try {
    const response = await apiClient.get('/etc/name?where=organization');
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("organization 호출 실패:", error);
    return null;
  }
}

export async function getAddressInfo() {
  try {
    const response = await apiClient.get('/etc/name?where=addressInfo');
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("addressInfo 호출 실패:", error);
    return null;
  }
}

export async function getPhone() {
  try {
    const response = await apiClient.get('/etc/name?where=phone');
    const item = Array.isArray(response.data) ? response.data[0] : response.data;
    return item?.data || item;
  } catch (error) {
    console.error("phone 호출 실패:", error);
    return null;
  }
}
