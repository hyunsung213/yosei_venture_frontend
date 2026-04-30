import { UsagePlan, UsagePlanSimple, PlanStatusType, IUsagePlanItem } from "@/interface/interface";

// 초기 더미 데이터 상태
let mockDB: Record<string, UsagePlan> = {
  "team-a": {
    id: "plan-a",
    teamId: "team-a",
    teamName: "멋사 1팀",
    balance: 5000000,
    canEdit: true,
    status: "처리대기",
    submittedAt: "2024-03-10",
    comment: "",
    items: [
      { id: "1", month: "3", day: "15", category: "회의비", purpose: "주차별 아이디에이션 회의", amount: 50000, note: "카페 영수증 증빙" },
      { id: "2", month: "3", day: "20", category: "도서구입", purpose: "React 관련 서적 구입", amount: 35000, note: "팀 공용" }
    ]
  },
  "team-b": {
    id: "plan-b",
    teamId: "team-b",
    teamName: "연벤처 팀",
    balance: 2000000,
    canEdit: false,
    status: "승인",
    submittedAt: "2024-03-01",
    comment: "도서구입 내역 확인 완료. 다음에도 잘 부탁드립니다.",
    items: [
      { id: "1", month: "3", day: "5", category: "다과비", purpose: "킥오프 미팅용 간식", amount: 30000, note: "" },
      { id: "2", month: "3", day: "10", category: "외주비", purpose: "로고 디자인 의뢰", amount: 500000, note: "" }
    ]
  },
  "team-c": {
    id: "plan-c",
    teamId: "team-c",
    teamName: "스타트업 X",
    balance: 10000000,
    canEdit: true,
    status: "반려",
    submittedAt: "2024-03-12",
    comment: "회식비 명목의 지출이 너무 많습니다. 조정해주세요.",
    items: [
      { id: "1", month: "3", day: "11", category: "회식비", purpose: "전체 팀원 회식", amount: 4500000, note: "과도한 지출" }
    ]
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchUsagePlan = async (teamId: string): Promise<UsagePlan | null> => {
  await delay(500); // 네트워크 로딩 지연 효과
  return mockDB[teamId] || null;
};

export const fetchAllUsagePlanSummaries = async (): Promise<UsagePlanSimple[]> => {
  await delay(500);
  return Object.values(mockDB).map(item => ({
    teamId: item.teamId,
    teamName: item.teamName,
    submittedAt: item.submittedAt,
    status: item.status,
    totalAmount: item.items.reduce((acc, curr) => acc + curr.amount, 0)
  }));
};

export const saveUsagePlan = async (teamId: string, items: IUsagePlanItem[]): Promise<boolean> => {
  await delay(800);
  if (!mockDB[teamId]) return false;
  mockDB[teamId] = {
    ...mockDB[teamId],
    items: items as any,
    status: "처리대기",
    submittedAt: new Date().toISOString().split('T')[0] // 오늘 날짜
  };
  return true;
};

export const updateUsagePlanStatus = async (
  teamId: string, 
  status: PlanStatusType, 
  comment: string
): Promise<boolean> => {
  await delay(600);
  if (!mockDB[teamId]) return false;
  mockDB[teamId] = {
    ...mockDB[teamId],
    status,
    comment
  };
  return true;
};
