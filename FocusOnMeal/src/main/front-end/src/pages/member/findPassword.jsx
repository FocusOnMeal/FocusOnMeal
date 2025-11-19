import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

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
            const response = await authService.sendPasswordResetLink(
                formData.memberId,
                formData.email
            );
            
            console.log('비밀번호 재설정 API 응답:', response);

            if (response.data.success) {
                setIsSuccess(true);
            }
        } catch (err) {
            console.error('비밀번호 재설정 오류:', err);
            const errorMessage = err.response?.data?.error || '요청 처리 중 오류가 발생했습니다.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Malgun Gothic, sans-serif' }}>
                <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '50px 40px', maxWidth: '450px', width: '100%', textAlign: 'center', animation: 'slideUp 0.5s ease' }}>

                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                        ✅ 재설정 링크 전송 완료
                    </h2>

                    <p style={{ color: '#667eea', fontSize: '16px', marginBottom: '30px' }}>
                        입력하신 이메일({formData.email})로 전송되었습니다.
                    </p>

                    <button
                        onClick={() => navigate('/member/login')}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '10px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
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
                            borderRadius: '10px',
                            fontWeight: '600',
                            color: '#666',
                            border: 'none',
                            backgroundColor: '#f5f5f5',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    >
                        다시 입력하기
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Malgun Gothic, sans-serif' }}>
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '50px 40px', maxWidth: '450px', width: '100%', animation: 'slideUp 0.5s ease' }}>

                <h2 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textAlign: 'center', marginBottom: '40px', margin: '0 0 40px 0' }}>
                    비밀번호 찾기
                </h2>

                {error && (
                    <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#555', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                            아이디
                        </label>
                        <input
                            type="text"
                            name="memberId"
                            value={formData.memberId}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            required
                            style={{ width: '100%', padding: '15px 20px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', backgroundColor: '#fafafa', color: '#333', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.backgroundColor = 'white';
                                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e0e0e0';
                                e.target.style.backgroundColor = '#fafafa';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#555', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                            이메일
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                            style={{ width: '100%', padding: '15px 20px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', backgroundColor: '#fafafa', color: '#333', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.backgroundColor = 'white';
                                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e0e0e0';
                                e.target.style.backgroundColor = '#fafafa';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '10px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            border: 'none',
                            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                            marginTop: '10px',
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
                    </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', fontSize: '14px' }}>
                    <span
                        onClick={() => navigate('/member/login')}
                        style={{ color: '#666', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.3s ease', position: 'relative' }}
                        onMouseOver={(e) => e.target.style.color = '#667eea'}
                        onMouseOut={(e) => e.target.style.color = '#666'}
                    >
                        로그인
                    </span>

                    <span style={{ color: '#ddd' }}>|</span>

                    <span
                        onClick={() => navigate('/member/findId')}
                        style={{ color: '#666', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.3s ease' }}
                        onMouseOver={(e) => e.target.style.color = '#667eea'}
                        onMouseOut={(e) => e.target.style.color = '#666'}
                    >
                        아이디 찾기
                    </span>

                    <span style={{ color: '#ddd' }}>|</span>

                    <span
                        onClick={() => navigate('/member/join')}
                        style={{ color: '#666', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.3s ease' }}
                        onMouseOver={(e) => e.target.style.color = '#667eea'}
                        onMouseOut={(e) => e.target.style.color = '#666'}
                    >
                        회원가입
                    </span>
                </div>
            </div>
        </div>
    );
}

export default findPassword;