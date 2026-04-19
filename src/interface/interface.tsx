interface BaseSchema {
  id: string; // MongoDB의 ID
  _id?: string; // MongoDB의 _id 필드 호환성
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type RoleType = "guest" | "general" | "wave" | "super";
export type TeamType = "innovative" | "lab1th" | "lab2th" | "local1th" | "local2th";

export interface IAttachedFile {
  url: string;
  originalName: string;
}

interface User extends BaseSchema {
  name: string;
  phone: string;
  email: string;
  studentId?: string;
  isStudent: boolean; 
  isSocial: boolean;
  type: "general" | "wave" | "super"; 
}

export interface IUser{
  name: string;
  phone: string;
  email: string;
  studentId?: string;
  isStudent: boolean;
  pwd: string;
  isSocial: boolean;
  type: "general" | "wave" | "super"; 
}

export interface ILogin{
  email: string;
  pwd: string;
}

interface UserWithTeam extends User{
  team: Team;
}

////////////////////////////////////////////////////


export interface Program extends BaseSchema {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  capacity: number;
  hashTags: string[];
  poster: string;
  registrationCount?: number;   
  pendingRegistrationCount?: number;
  files: string[]; 
}

export interface ProgramSimple extends BaseSchema {
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
  hashTags: string[];
  registrationCount: number;
  poster: string;   
}

export interface Registration extends BaseSchema {
  programId: string;
  userId: string;
  status: string;
}

export interface ProgramForSuper extends Program{
  registrations: Registration[];
}

////////////////////////////////////////////////////

export interface Team extends BaseSchema {
  name: string;
  describe: string;
  img: string;
  type: TeamType;
}

interface TeamWithUsers extends Team{
  users: User[];
}

export interface Notice extends BaseSchema {
  title: string;
  content: string;
  hashTags: string[];
  files: string[];
  isWave: boolean;
}

export interface Qa extends BaseSchema {
  title: string;
  content: string;
  state: "pending" | "completed";
  isOpen: boolean;
  pw?: string;     
  isWave: boolean;
  userId?: string;
}

export interface Request extends BaseSchema {
  title: string;
  content: string;
  files: string[];
  state: "approved" | "pending" | "rejected";
  use: "promotion" | "cloude" | "prototype" | "etc"
  cost: number;
  pw: string;
  teamId: Team;
  comments: Comment[];
}

export interface IRequest {
  title: string;
  content: string;
  files: string[];
  use: "promotion" | "cloude" | "prototype" | "etc"
  cost: number;
  pw: string;
  teamId: string;

}

export interface News extends BaseSchema {
  title: string;
  content: string;
  imgs: string[];
  url: string;
}

export interface Place extends BaseSchema {
  name: string;
  describe: string;
  img: string;
}

interface Comment extends BaseSchema {
  comment: string;
}

export interface IComment extends BaseSchema {
  requestId?: string;
  qaId?: string; 
  userId: string;
  comment: string;
}

interface Etc extends BaseSchema {
  where: string;
  data: any;
}

export interface Rental extends BaseSchema {
  placeId: string;
  name: string;
  phoneNum: string;
  startDate: string | Date;
  endDate: string | Date;
}

/**
 * 7. WAVE 사업비 승인 요청 (WaveRequest)
 */
export interface IWaveRequest extends BaseSchema {
  title: string;
  content: string;
  team_name: string;
  amount: number;
  status: "pending" | "reviewing" | "rejected" | "approved";
  request_date: string | Date;
}