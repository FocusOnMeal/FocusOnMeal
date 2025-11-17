import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const mockSearchMemberId = (memberName, email) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (memberName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                resolve({ 
                    data: { success: true } 
                });
            } else {
                reject({ 
                    response: { 
                        data: { 
                            error: '입력하신 정보와 일치하는 회원 정보를 찾을 수 없습니다.' 
                        } 
                    } 
                });
            }
        }, 1500);
    });
};

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

            const response = await mockSearchMemberId(
                formData.memberName,
                formData.email
            );
            
            if (response.data.success) {
                setEmailSent(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || '일치하는 회원 정보를 찾을 수 없습니다.';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                        🔍 아이디 찾기
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        가입 시 입력한 정보를 입력해주세요.
                    </p>
                </div>
                
                {errors.general && (
                    <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #dc2626', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>
                        <p style={{ color: '#dc2626', fontSize: '14px' }}>{errors.general}</p>
                    </div>
                )}

                {!emailSent ? (
                    <form onSubmit={handleSubmit}>
                        {/* 이름 */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                이름 <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="memberName"
                                value={formData.memberName}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이름"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: errors.memberName ? '1px solid #dc2626' : '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxShadow: errors.memberName ? '0 0 0 1px #dc2626' : 'none',
                                }}
                            />
                            {errors.memberName && (
                                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                    {errors.memberName}
                                </p>
                            )}
                        </div>
                        
                        {/* 이메일 */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                                이메일 <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="가입 시 입력한 이메일"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxShadow: errors.email ? '0 0 0 1px #dc2626' : 'none',
                                }}
                            />
                            {errors.email && (
                                <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        
                        {/* 제출 버튼 */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.15s',
                                marginBottom: '15px'
                            }}
                        >
                            {loading ? '처리 중...' : '아이디 찾기'}
                        </button>
                        
                        {/* 하단 링크 */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '14px', flexWrap: 'wrap' }}>
                            
                            <button
                                type="button"
                                onClick={() => navigate('/member/login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '5px 0'
                                }}
                            >
                                로그인
                            </button>
                            <span style={{ color: '#d1d5db' }}>|</span>
                            
                            <button
                                type="button"
                                onClick={() => navigate('/member/findPassword')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '5px 0'
                                }}
                            >
                                비밀번호 찾기
                            </button>
                            <span style={{ color: '#d1d5db' }}>|</span>

                            <button
                                type="button"
                                onClick={() => navigate('/member/Join')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '5px 0'
                                }}
                            >
                                회원가입
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
                        <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>이메일 발송 완료</h3>
                        <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                            {formData.email}로<br />
                            아이디 찾기 결과를 발송했습니다.
                        </p>
                        <button
                            onClick={() => navigate('/member/login')}
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
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
