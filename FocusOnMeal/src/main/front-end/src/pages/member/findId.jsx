import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function findId() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        memberName: '',
        email: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [emailSent, setEmailSent] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.memberName.trim()) {
            newErrors.memberName = '이름을 입력해주세요.';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            
            const response = await authService.sendMemberIdByEmail(
                formData.memberName,
                formData.email
            );
            
            console.log('아이디 찾기 API 응답:', response);
            
            if (response.data.success) {
                setEmailSent(true);
            }
        } catch (error) {
            console.error('아이디 찾기 오류:', error);
            const errorMessage = error.response?.data?.error || '일치하는 회원 정보를 찾을 수 없습니다.';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Malgun Gothic, sans-serif' }}>
            <div style={{ maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: '50px 40px', animation: 'slideUp 0.5s ease' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '0 0 10px 0' }}>
                        아이디 찾기
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                        가입 시 입력한 정보를 입력해주세요.
                    </p>
                </div>

                {errors.general && (
                    <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px' }}>
                        {errors.general}
                    </div>
                )}

                {!emailSent ? (
                    <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                                이름 <span style={{ color: '#c33' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="memberName"
                                value={formData.memberName}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이름"
                                style={{
                                    width: '100%',
                                    padding: '15px 20px',
                                    border: errors.memberName ? '2px solid #c33' : '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    backgroundColor: '#fafafa',
                                    color: '#333',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    if (!errors.memberName) {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!errors.memberName) {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.backgroundColor = '#fafafa';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            {errors.memberName && (
                                <p style={{ color: '#c33', fontSize: '14px', marginTop: '5px', margin: '5px 0 0 0' }}>
                                    {errors.memberName}
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#555', fontSize: '14px' }}>
                                이메일 <span style={{ color: '#c33' }}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이메일"
                                style={{
                                    width: '100%',
                                    padding: '15px 20px',
                                    border: errors.email ? '2px solid #c33' : '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    backgroundColor: '#fafafa',
                                    color: '#333',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    if (!errors.email) {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!errors.email) {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.backgroundColor = '#fafafa';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            {errors.email && (
                                <p style={{ color: '#c33', fontSize: '14px', marginTop: '5px', margin: '5px 0 0 0' }}>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                                marginTop: '10px'
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
                            {loading ? '처리 중...' : '아이디 찾기'}
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', fontSize: '14px', marginTop: '30px' }}>
                            <span
                                onClick={() => navigate('/member/login')}
                                style={{ color: '#666', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.3s ease' }}
                                onMouseOver={(e) => e.target.style.color = '#667eea'}
                                onMouseOut={(e) => e.target.style.color = '#666'}
                            >
                                로그인
                            </span>
                            <span style={{ color: '#ddd' }}>|</span>

                            <span
                                onClick={() => navigate('/member/findPassword')}
                                style={{ color: '#666', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.3s ease' }}
                                onMouseOver={(e) => e.target.style.color = '#667eea'}
                                onMouseOut={(e) => e.target.style.color = '#666'}
                            >
                                비밀번호 찾기
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
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                            ✅ 이메일 발송 완료
                        </h2>
                        <p style={{ color: '#667eea', fontSize: '16px', marginBottom: '30px', margin: '0 0 30px 0' }}>
                            {formData.email}로<br />
                            아이디 찾기 결과를 발송했습니다.
                        </p>
                        <button
                            onClick={() => navigate('/member/login')}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
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
                            로그인하러 가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default findId;