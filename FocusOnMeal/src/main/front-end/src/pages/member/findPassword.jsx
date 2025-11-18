import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService'; // ⭐ Mock 대신 실제 API 사용

function findPassword() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        memberId: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
        if (isSuccess) setIsSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSuccess(false);
        setLoading(true);

        try {
            // ⭐ 실제 API 호출
            const response = await authService.sendPasswordResetLink(
                formData.memberId,
                formData.email
            );
            
            console.log('비밀번호 재설정 API 응답:', response); // 디버깅용

            if (response.data.success) {
                setIsSuccess(true);
            }
        } catch (err) {
            console.error('비밀번호 재설정 오류:', err); // 디버깅용
            const errorMessage = err.response?.data?.error || '요청 처리 중 오류가 발생했습니다.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // 성공 화면
    if (isSuccess) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>

                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                        ✅ 재설정 링크 전송 완료
                    </h2>

                    <p style={{ color: '#059669', fontSize: '16px', marginBottom: '30px' }}>
                        입력하신 이메일({formData.email})로 전송되었습니다.
                    </p>

                    <button
                        onClick={() => navigate('/member/login')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            color: 'white',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            cursor: 'pointer',
                        }}
                    >
                        로그인 페이지로 이동
                    </button>

                    <button
                        onClick={() => setIsSuccess(false)}
                        style={{
                            marginTop: '15px',
                            width: '100%',
                            padding: '14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        다시 입력하기
                    </button>

                </div>
            </div>
        );
    }

    // 기본 비밀번호 찾기 화면
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px', maxWidth: '450px', width: '100%' }}>

                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: '8px' }}>
                    🔐 비밀번호 찾기
                </h2>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>
                        <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                            아이디
                        </label>
                        <input
                            type="text"
                            name="memberId"
                            value={formData.memberId}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            required
                            style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                            style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            color: 'white',
                            border: 'none',
                            backgroundColor: loading ? '#9ca3af' : '#2563eb',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                    <span
                        onClick={() => navigate('/member/login')}
                        style={{ color: '#2563eb', cursor: 'pointer' }}
                    >
                        로그인
                    </span>

                    <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>

                    <span
                        onClick={() => navigate('/member/findId')}
                        style={{ color: '#2563eb', cursor: 'pointer' }}
                    >
                        아이디 찾기
                    </span>

                    <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>

                    <span
                        onClick={() => navigate('/member/join')}
                        style={{ color: '#2563eb', cursor: 'pointer' }}
                    >
                        회원가입
                    </span>
                </div>
            </div>
        </div>
    );
}

export default findPassword;