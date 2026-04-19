import axios from 'axios';

// 백엔드로 가는 공통 API 클라이언트 인스턴스
export const apiClient = axios.create({
  // next.config.ts의 rewrites를 타게 하려면 /api로 요청
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
