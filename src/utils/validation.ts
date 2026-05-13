import { UsageType, TeamType } from "@/interface/interface";

export function validateUsageBudget(
  type: UsageType,
  cost: number,
  teamType: TeamType | undefined,
  teamBalance: number,
  accumulatedCost: number
): { isValid: boolean; message: string } {
  const totalCost = accumulatedCost + cost;

  switch (type) {
    case "supplies": // 사무용품
      if (totalCost >= 500000) {
        return { 
          isValid: false, 
          message: `사무용품 누적 사용액은 50만원 미만이어야 합니다. (현재 누적+신청액: ${totalCost.toLocaleString()}원)` 
        };
      }
      if (totalCost >= teamBalance * 0.3) {
        return { 
          isValid: false, 
          message: `사무용품 누적 사용액은 지원금 총액의 30% 미만이어야 합니다. (한도: ${(teamBalance * 0.3).toLocaleString()}원, 현재: ${totalCost.toLocaleString()}원)` 
        };
      }
      break;

    case "promotion": // 인쇄물 및 홍보물
      if (totalCost >= 500000) {
        return { 
          isValid: false, 
          message: `인쇄물 및 홍보물 누적 사용액은 50만원 미만이어야 합니다. (현재 누적+신청액: ${totalCost.toLocaleString()}원)` 
        };
      }
      break;

    case "meetings": // 회의비
      if (teamType !== "lab-series") {
        return { 
          isValid: false, 
          message: "회의비는 LAB-SERIES 팀만 사용할 수 있습니다." 
        };
      }
      if (totalCost >= 500000) {
        return { 
          isValid: false, 
          message: `회의비 누적 사용액은 50만원 미만이어야 합니다. (현재 누적+신청액: ${totalCost.toLocaleString()}원)` 
        };
      }
      if (totalCost >= teamBalance * 0.15) {
        return { 
          isValid: false, 
          message: `회의비 누적 사용액은 지원금 총액의 15% 미만이어야 합니다. (한도: ${(teamBalance * 0.15).toLocaleString()}원, 현재: ${totalCost.toLocaleString()}원)` 
        };
      }
      break;

    case "materials": // 재료비
      if (cost < 10000) {
        return { 
          isValid: false, 
          message: "재료비는 건당 1만원 이상이어야 합니다." 
        };
      }
      break;

    case "registration": // 참가비
    case "outsourcing": // 용역비
      // 제한 없음
      break;
  }

  return { isValid: true, message: "" };
}

export function getMaxLimitText(
  type: UsageType,
  teamType: TeamType | undefined,
  teamBalance: number,
  accumulatedCost: number
): string {
  switch (type) {
    case "supplies": {
      const maxByFixed = 500000;
      const maxByRatio = teamBalance * 0.3;
      const actualLimit = Math.min(maxByFixed, maxByRatio) - accumulatedCost;
      const limitToUse = actualLimit > 0 ? actualLimit : 0;
      return `지원금의 30% 또는 50만원 한도 (최대 입력 가능: ${limitToUse.toLocaleString()}원)`;
    }
    case "promotion": {
      const actualLimit = 500000 - accumulatedCost;
      const limitToUse = actualLimit > 0 ? actualLimit : 0;
      return `50만원 한도 (최대 입력 가능: ${limitToUse.toLocaleString()}원)`;
    }
    case "meetings": {
      if (teamType !== "lab-series") {
        return "LAB-SERIES 팀만 사용할 수 있습니다.";
      }
      const maxByFixed = 500000;
      const maxByRatio = teamBalance * 0.15;
      const actualLimit = Math.min(maxByFixed, maxByRatio) - accumulatedCost;
      const limitToUse = actualLimit > 0 ? actualLimit : 0;
      return `지원금의 15% 또는 50만원 한도 (최대 입력 가능: ${limitToUse.toLocaleString()}원)`;
    }
    case "materials":
      return "건당 1만원 이상 입력해야 합니다.";
    case "registration":
    case "outsourcing":
      return "금액 제한이 없습니다.";
    default:
      return "";
  }
}
