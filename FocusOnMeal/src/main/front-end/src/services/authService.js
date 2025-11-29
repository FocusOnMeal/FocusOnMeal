// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/member';

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 (토큰이 있으면 자동으로 헤더에 추가)
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 API 요청:', config.method.toUpperCase(), config.url, config.data);
        return config;
    },
    (error) => {
        console.error('❌ 요청 오류:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
    (response) => {
        console.log('📥 API 응답:', response.config.url, response.data);
        return response;
    },
    (error) => {
        console.error('❌ 응답 오류:', error.response?.data || error.message);
        
        // 401 에러 (인증 실패) 시 로그아웃 처리
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

const authService = {
    // ========== 로그인/로그아웃 ==========
    
    login: async (memberId, memberPw) => {
        try {
            const response = await apiClient.post('/login', {
                memberId,
                memberPw
            });
            
            if (response.data.data?.token) {
                sessionStorage.setItem('token', response.data.data.token);
                sessionStorage.setItem('user', JSON.stringify({
                    memberId: response.data.data.memberId,
                    memberName: response.data.data.memberName,
                    memberNickname: response.data.data.memberNickname,
                    adminYn: response.data.data.adminYn
                }));
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiClient.post('/logout');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } catch (error) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            throw error;
        }
    },

    // ========== 회원가입 ==========

    checkMemberId: async (memberId) => {
        try {
            const response = await apiClient.get(`/check-id/${memberId}`);
            console.log('✅ 아이디 중복 확인 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 아이디 중복 확인 오류:', error);
            throw error;
        }
    },

    sendVerificationCode: async (email) => {
        try {
            const response = await apiClient.post('/send-verification-code', {
                email
            });
            console.log('✅ 인증 코드 발송 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 인증 코드 발송 오류:', error);
            throw error;
        }
    },

    verifyEmailCode: async (email, code) => {
        try {
            const response = await apiClient.post('/verify-email-code', {
                email,
                code
            });
            console.log('✅ 이메일 인증 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 이메일 인증 오류:', error);
            throw error;
        }
    },

    joinMember: async (memberData) => {
        try {
            const response = await apiClient.post('/join', memberData);
            console.log('✅ 회원가입 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 회원가입 오류:', error);
            throw error;
        }
    },

    // ========== 아이디 찾기 ==========

    sendMemberIdByEmail: async (memberName, email) => {
        try {
            const response = await apiClient.post('/id/search', {
                memberName,
                email
            });
            console.log('✅ 아이디 찾기 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 아이디 찾기 오류:', error);
            throw error;
        }
    },

    searchMemberId: async (memberName, email) => {
        return authService.sendMemberIdByEmail(memberName, email);
    },

    // ========== 비밀번호 찾기 ==========

    sendPasswordResetLink: async (memberId, email) => {
        try {
            const response = await apiClient.post('/password/reset-request', {
                memberId,
                email
            });
            console.log('✅ 비밀번호 재설정 링크 발송 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 비밀번호 재설정 링크 발송 오류:', error);
            throw error;
        }
    },

    validatePasswordResetToken: async (token) => {
        try {
            const response = await apiClient.get('/password/validate-token', {
                params: { token }
            });
            console.log('✅ 토큰 검증 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 토큰 검증 오류:', error);
            throw error;
        }
    },

    resetPassword: async (token, newPassword, confirmPassword) => {
        try {
            const response = await apiClient.post('/password/reset-confirm', {
                token,
                newPassword,
                confirmPassword
            });
            console.log('✅ 비밀번호 재설정 응답:', response.data);
            return response;
        } catch (error) {
            console.error('❌ 비밀번호 재설정 오류:', error);
            throw error;
        }
    },

    // ========== 유틸리티 ==========

    getCurrentUser: () => {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isLoggedIn: () => {
        return !!sessionStorage.getItem('token');
    },

    getToken: () => {
        return sessionStorage.getItem('token');
    }
};

export default authService;