import { Etc, News, Notice, Place, Program, ProgramSimple, Qa, Team, TeamSimple, TeamWithPlan, TeamWithPlanStatus, UserSoSimple } from "@/interface/interface";
import apiClient from "./api";

// 프로그램 조회 //
export async function getAllPrograms() {
  try {
    const response =
      await apiClient.get<ProgramSimple[]>(`/program`);
    return response.data;
  } catch (error) {
    console.log("모든 Program을 가져오는데 실패했습니다!: ", error);
  }
}

export async function getProgramById(programId: string) {
  try {
    const response = await apiClient.get<Program>(
      `/program/${programId}`,
    );
    return response.data;
  } catch (error) {
    console.log(`Program ID ${programId}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 장소 조회 //

export async function getAllPlaces() {
  try {
    const response = await apiClient.get<Place[]>(`/place`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log("모든 Place를 가져오는데 실패했습니다!: ", error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 공지사항 조회 //
export async function getWaveNotices() {
  try {
    const response = await apiClient.get<Notice[]>(`/notice/for-wave`);
    return response.data;
  } catch (error) {
    console.log("모든 Wave Notice를 가져오는데 실패했습니다!: ", error);
  }
}
export async function getCommunityNotices() {
  try {
    const response = await apiClient.get<Notice[]>(`/notice/for-community`);
    return response.data;
  } catch (error) {
    console.log("모든 Community Notice를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getNoticeById(noticeId: string) {
  try {
    const response = await apiClient.get<Notice>(`/notice/${noticeId}`);
    return response.data;
  } catch (error) {
    console.log(`Notice ID ${noticeId}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 뉴스 조회 //
export async function getAllNews() {
  try {
    const response = await apiClient.get<News[]>(`/news`);
    return response.data;
  } catch (error) {
    console.log("모든 News를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getNewsById(newsId: string) {
  try {
    const response = await apiClient.get<News>(`/news/${newsId}`);
    return response.data;
  } catch (error) {
    console.log(`News ID ${newsId}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Etc 조회 //
export async function getAllEtcs() {
  try {
    const response = await apiClient.get<Etc[]>(`/etc`);
    return response.data;
  } catch (error) {
    console.log("모든 Etc를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getEtcByWhere(where: string) {
  try {
    const response = await apiClient.get<Etc>(`/etc/${where}`);
    return response.data;
  } catch (error) {
    console.log(`Etc ${where}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Q&A 조회 //
export async function getWaveQAs() {
  try {
    const response = await apiClient.get<Qa[]>(`/qa/for-wave`);
    return response.data;
  } catch (error) {
    console.log("모든 Wave QA를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getCommunityQAs() {
  try {
    const response = await apiClient.get<Qa[]>(`/qa/for-community`);
    return response.data;
  } catch (error) {
    console.log("모든 Community QA를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getQAById(qaId: string) {
  try {
    const response = await apiClient.get<Qa>(`/qa/${qaId}`);
    return response.data;
  } catch (error) {
    console.log(`QA ID ${qaId}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 처리 요청 조회 //
export async function getAllRequests() {
  try {
    const response = await apiClient.get(`/request`);
    return response.data;
  } catch (error) {
    console.log("모든 Request를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getRequestById(requestId: string, pw?: string) {
  try {
    const response = await apiClient.get(`/request/${requestId}`, {
      params: pw ? { pw } : {}
    });
    return response.data;
  } catch (error) {
    console.log(`Request ID ${requestId}을 가져오는데 실패했습니다!: `, error);
  }
}


/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Team 조회 //
export async function getAllTeams() {
  try {
    const response = await apiClient.get<TeamSimple[]>(`/team`);
    return response.data;
  } catch (error) {
    console.log("모든 Team을 가져오는데 실패했습니다!: ", error);
  }
}

export async function getTeamByUserId(userId: string) {
  try {
    const response = await apiClient.get<TeamSimple>(`/team/user/${userId}`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${userId}을 가져오는데 실패했습니다!: `, error);
  }
}

export async function getTeamByUserIdWithPlan(userId: string) {
  try {
    const response = await apiClient.get<TeamWithPlan>(`/team/user/${userId}/detail`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${userId}을 가져오는데 실패했습니다!: `, error);
  }
}

export async function getTeamWithPlanById(teamId: string) {
  try {
    const response = await apiClient.get<TeamWithPlan>(`/team/${teamId}/detail`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${teamId} 상세 조회 실패!: `, error);
  }
}

export async function getTeamById(teamId: string) {
  try {
    const response = await apiClient.get<Team>(`/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${teamId} 조회 실패!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 사용자 본인 정보 조회 //
export async function getMe() {
  try {
    const response = await apiClient.get(`/auth/me`);
    return response.data;
  } catch (error) {
    console.log("내 정보를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getRegistrationsByProgramId(programId: string) {
  try {
    const response = await apiClient.get(`/program/${programId}/registrations`);
    return response.data;
  } catch (error) {
    console.log(`Program ID ${programId}의 신청 목록을 가져오는데 실패했습니다!: `, error);
  }
}

// 사용자 관리
export async function getAllUsers() {
  try {
    const response = await apiClient.get<UserSoSimple[]>(`/user/all`);
    return response.data;
  } catch (error) {
    console.log("모든 사용자를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getAllTeamsWithStatus() {
  try {
    const response = await apiClient.get<TeamWithPlanStatus[]>(`/team/super`);
    return response.data;
  } catch (error) {
    console.log("팀 상태 목록을 가져오는데 실패했습니다!: ", error);
  }
}

// 대관 조회
export async function getRentalsByPlaceId(placeId: string) {
  try {
    const response = await apiClient.get(`/rental/place/${placeId}`);
    return response.data;
  } catch (error) {
    console.log(`Place ID ${placeId}의 대관 목록 조회 실패!: `, error);
  }
}

export async function checkUserRental(placeId: string) {
  try {
    const response = await apiClient.get(`/rental/check/${placeId}`);
    return response.data;
  } catch (error) {
    console.log(`사용자 대관 내역 확인 실패!: `, error);
  }
}
