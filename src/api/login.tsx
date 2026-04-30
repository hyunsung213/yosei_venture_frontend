import apiClient from "./api";
import { ILogin, IUser } from "@/interface/interface";

export async function postRegister(regData: IUser) {
  try{
      const res = await apiClient.post('/auth/register', regData);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
    return res;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || '회원가입에 실패했습니다.');
      return err;
    }
  };


export async function postLogin(loginData: ILogin) {
try{
    const res = await apiClient.post('/auth/login', loginData);
    localStorage.setItem('token', res.data.token);
    alert('로그인 되었습니다.');
  return res;
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || '로그인에 실패했습니다.');
    return err;
  }
};