import apiClient from "./axiosConfig";
import { ILogin, IUser } from "@/interface/interface";

export async function postRegister(regData: IUser) {
  const res = await apiClient.post('/auth/register', regData);
  return res;
};

export async function postLogin(loginData: ILogin) {
  const res = await apiClient.post('/auth/login', loginData);
  return res;
};

export async function postFindEmail(data: { name: string; phone: string }) {
  const res = await apiClient.post('/auth/find-email', data);
  return res;
}

export async function postForgotPassword(data: { email: string }) {
  const res = await apiClient.post('/auth/forgot-password', data);
  return res;
}

export async function postVerifyResetToken(data: { token: string }) {
  const res = await apiClient.post('/auth/verify-reset-token', data);
  return res;
}

export async function postResetPassword(data: { token: string; newPassword: string }) {
  const res = await apiClient.post('/auth/reset-password', data);
  return res;
}

export async function postChangePassword(data: { currentPassword: string; newPassword: string }) {
  const res = await apiClient.post('/auth/change-password', data);
  return res;
}