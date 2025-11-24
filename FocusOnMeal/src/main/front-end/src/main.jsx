import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

// Axios 인터셉터 설정
axios.interceptors.request.use(function (config) {
    
    // 세션 스토리지와 로컬 스토리지 모두 로그인 토큰 확인 후 헤더에 실어 보내기
    // (Login.jsx에서 sessionStorage를 쓰고 있으므로 이게 핵심입니다)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

// 401 에러 처리 (로그인 만료 시)
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.log("인증 실패 (401) - 토큰이 없거나 만료됨");
            // 필요하다면 여기서 로그아웃 처리
            // sessionStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
