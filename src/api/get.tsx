import { Place, Program, ProgramForSuper, Rental } from "@/interface/interface";
import apiClient from "./api";

// 프로그램 조회 //
export async function getAllPrograms() {
  try {
    const response =
      await apiClient.get<ProgramForSuper[]>(`/program`);
    return response.data;
  } catch (error) {
    console.log("모든 Program을 가져오는데 실패했습니다!: ", error);
  }
}

export async function getProgramById(programId: string) {
  try {
    const response = await apiClient.get<ProgramForSuper>(
      `/program/${programId}`,
    );
    console.log(response.data)
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

// 대관 조회 //

export async function getRentalsByPlaceId(placeId: string) {
  try {
    const response = await apiClient.get<Rental[]>(`/rental/${placeId}`);
    return response.data ?? [];
  } catch (error) {
    console.log(`Place ID ${placeId}의 대관 현황을 가져오는데 실패했습니다!: `, error);
    return [];
  }
}

export async function checkUserRental(phone_num: string) {
  try {
    const response = await apiClient.get(`/rental/phone/${phone_num}/current`);
    return response.data; // { hasActive: boolean, rental?: IRental }
  } catch (error) {
    console.log(`전화번호 ${phone_num}의 대관 현황 확인 실패: `, error);
    return { hasActive: false };
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 공지사항 조회 //
export async function getAllNotices() {
  try {
    const response = await apiClient.get(`/notice`);
    return response.data;
  } catch (error) {
    console.log("모든 Notice를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getNoticeById(noticeId: string) {
  try {
    const response = await apiClient.get(`/notice/${noticeId}`);
    return response.data;
  } catch (error) {
    console.log(`Notice ID ${noticeId}을 가져오는데 실패했습니다!: `, error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// Q&A 조회 //
export async function getAllWaveQAs() {
  try {
    const response = await apiClient.get(`/qa/wave`);
    return response.data;
  } catch (error) {
    console.log("모든 Wave QA를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getAllCommunityQAs() {
  try {
    const response = await apiClient.get(`/qa/community`);
    return response.data;
  } catch (error) {
    console.log("모든 Community QA를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getQAById(qaId: string, pw?: string) {
  try {
    const response = await apiClient.get(`/qa/${qaId}`, {
      params: pw ? { pw } : {}
    });
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

// 신청 현황 조회 //
export async function getRegistrationsByProgramId(programId: string) {
  try {
    const response = await apiClient.get(`/registration/program/${programId}`);
    return response.data;
  } catch (error) {
    console.log(`Program ID ${programId}의 신청 현황을 가져오는데 실패했습니다!: `, error);
  }
}


/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

export async function getAllTeams() {
  try {
    const response = await apiClient.get(`/team`);
    return response.data;
  } catch (error) {
    console.log("모든 Team을 가져오는데 실패했습니다!: ", error);
  }
}

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

// 뉴스 조회 //
export async function getAllNews() {
  try {
    const response = await apiClient.get(`/news`);
    return response.data;
  } catch (error) {
    console.log("모든 News를 가져오는데 실패했습니다!: ", error);
  }
}

export async function getNewsById(newsId: string) {
  try {
    const response = await apiClient.get(`/news/${newsId}`);
    return response.data;
  } catch (error) {
    console.log(`News ID ${newsId}을 가져오는데 실패했습니다!: `, error);
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

// User ID로 Team 정보 조회 //
export async function getTeamByUserId(userId: string) {
  try {
    const response = await apiClient.get(`/team/user/${userId}`);
    return response.data;
  } catch (error) {
    console.log(`User ID ${userId}의 Team 정보를 가져오는데 실패했습니다!: `, error);
  }
}
// Team ID로 상세 정보 조회 //
export async function getTeamById(teamId: string) {
  try {
    const response = await apiClient.get(`/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${teamId} 조회 실패!: `, error);
  }
}

// 특정 팀의 모든 Request 내역 조회 //
export async function getRequestsByTeamId(teamId: string) {
  try {
    const response = await apiClient.get(`/request/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.log(`Team ID ${teamId}의 Request 내역 조회 실패!: `, error);
  }
}

// Request ID에 달린 검토 코멘트 조회 //
export async function getCommentsByRequestId(requestId: string) {
  try {
    const response = await apiClient.get(`/comment/request/${requestId}`);
    return response.data;
  } catch (error) {
    console.log(`Request ID ${requestId}의 코멘트 조회 실패!: `, error);
  }
}
