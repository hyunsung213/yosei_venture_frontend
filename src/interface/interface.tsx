interface BaseSchema {
  id: string; 
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type RoleType = "guest" | "general" | "wave" | "super";
export type TeamType = "innovative" | "lab1th" | "lab2th" | "local1th" | "local2th";
export type StatusType = "approved" | "pending" | "rejected";
export type StepType = "tentative" | "request" | "approoval" | "submission" | "finalization";
export type DefaultPwd = "0000"


export interface IAttachedFile {
  url: string;
  originalName: string;
}

export interface IProgram {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  capacity: number;
  hashTags: string;
  poster: string;
  files: string[];
}

export interface Program extends BaseSchema {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  capacity: number;
  hashTags: string;
  poster: string;
  files: string[];
}

export interface ProgramSimple extends BaseSchema {
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
  hashTags: string;
  poster: string;
}

export interface IPlace {
 name: string;
 describe: string; 
 imgs: string[]; 
}

export interface Place extends BaseSchema {
  name: string;
  describe: string;
  imgs: string[];
}

export interface INotice {
  title: string;
  content: string;
  hashTags: string;
  files: string[];
  isWave: boolean;
}

export interface Notice extends BaseSchema {
  title: string;
  content: string;
  hashTags: string;
  files: string[];
  isWave: boolean;
}

export interface INews {
  title: string;
  content: string;
  imgs: string;
  url: string;
}

export interface News extends BaseSchema {
  title: string;
  content: string;
  imgs: string;
  url: string;
}

export interface IEtc {
  where: string;
  data: any;
}

export interface Etc extends BaseSchema {
  where: string;
  data: any;
}

export interface IQa {
  title: string;
  content: string;
  status: StatusType;
  isOpen: boolean;
  pwd: string | DefaultPwd;     
  isWave: boolean;
  userId: string;
}

export interface Qa extends BaseSchema {
  title: string;
  content: string;
  status: StatusType;
  isOpen: boolean;
  pwd: string | DefaultPwd;     
  isWave: boolean;
  user: {
    name: string;
    id: string;
  };
  comments: Comment[];
}

export interface ITeam {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
  userIds: string[];
  balance: number;
}

export interface Team extends BaseSchema {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
  balance: number;
  user: {
    name: string,
    phone: string;
    studentId: string;
    id: string;
  }[];
}

export interface TeamWithPlanStatus extends BaseSchema {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
  balance: number;
  user: {
    name: string,
    phone: string;
    studentId: string;
    id: string;
  }[];
  plan: PlanStatus;
}

export interface TeamWithPlan extends BaseSchema {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
  balance: number;
  user: {
    name: string,
    phone: string;
    studentId: string;
    id: string;
  }[];
  plan: Plan;
  usages: Usage[];
}

export interface TeamSimple extends BaseSchema {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
}

export interface IUser {
  name: string;
  phone: string;
  email:string;
  pwd: string;
  type: RoleType | "general";
  studentId: string;
}

export interface UserSimple extends BaseSchema {
  name: string;
  phone: string;
  email:string;
  studentId: string;
  type: RoleType | "general";
}

export interface UserSoSimple extends BaseSchema {
  name: string;
  phone: string;
  email:string;
  studentId: string;
}

export interface IUsage {
  planId: string;
  date: string;
  type: string;
  for: string;
  cost: number;
  note: string;
  status: StatusType;
  file: string;
  step: StepType;
}

export interface Usage extends BaseSchema{
  planId: string;
  date: string;
  type: string;
  for: string;
  cost: number;
  note: string;
  status: StatusType;
  step: StepType;
  comments: Comment[];
  file: string;
}

export interface IPlan {
  teamId: string;
  isEdit: boolean | 0;
  status: StatusType;
  usages: IUsage[];
}

export interface Plan extends BaseSchema{
  team: Team;
  isEdit: boolean | 0;
  status: StatusType;
  usages: Usage[];
  comments: Comment[];
  file?: string;
}

export interface PlanStatus extends BaseSchema{
  team: Team;
  isEdit: boolean | 0;
  status: StatusType;
  isUsagePending: boolean;
}

export interface IComment {
  foreignId: string;
  content: string;
}

export interface Comment extends BaseSchema{
  foreignId: string;
  content: string;
}

export interface IUser{
  name: string;
  phone: string;
  email: string;
  studentId: string;
  isStudent: boolean;
  pwd: string;
  isSocial: boolean;
  type: RoleType | "general";
}

export interface ILogin{
  email: string;
  pwd: string;
}

export interface IUsagePlanItem {
  id?: string;
  month: string;
  day: string;
  category: string;
  purpose: string;
  amount: number;
  note: string;
}

export type PlanStatusType = "처리대기" | "승인" | "반려";

export interface UsagePlan {
  id: string;
  teamId: string;
  teamName: string;
  balance: number;
  canEdit: boolean;
  status: StatusType;
  submittedAt: string;
  comment: string;
  items: IUsagePlanItem[];
}

export interface UsagePlanSimple {
  teamId: string;
  teamName: string;
  submittedAt: string;
  status: StatusType | string;
  totalAmount: number;
}
