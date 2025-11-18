// src/pages/member/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    // 토큰 검증
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                alert('유효하지 않은 접근입니다.');
                navigate('/member/login');
                return;
            }
            
            try {
                const response = await authService.validatePasswordResetToken(token);
                setTokenValid(response.data.valid);
                
                if (!response.data.valid) {
                    alert('유효하지 않거나 만료된 링크입니다.');
                    navigate('/member/findPassword');
                }
            } catch (error) {
                alert('링크 검증에 실패했습니다.');
                navigate('/member/findPassword');
            } finally {
                setValidating(false);
            }
        };
        
        validateToken();
    }, [token, navigate]);
    
    // 비밀번호 강도 계산
    useEffect(() => {
        const password = formData.newPassword;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
        
        setPasswordStrength(Math.min(strength, 5));
    }, [formData.newPassword]);
    
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
        
        if (!formData.newPassword) {
            newErrors.newPassword = '새 비밀번호를 입력해주세요.';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
        } else {
            const hasDigit = /\d/.test(formData.newPassword);
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword);
            
            if (!hasDigit || !hasSpecial) {
                newErrors.newPassword = '비밀번호는 숫자와 특수문자를 포함해야 합니다.';
            }
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await authService.resetPassword(
                token,
                formData.newPassword,
                formData.confirmPassword
            );
            
            if (response.data.success) {
                alert('비밀번호가 성공적으로 변경되었습니다.\n새 비밀번호로 로그인해주세요.');
                navigate('/member/login');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || '비밀번호 변경에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const getStrengthColor = () => {
        if (passwordStrength >= 5) return '#10b981';
        if (passwordStrength >= 4) return '#22c55e';
        if (passwordStrength >= 3) return '#eab308';
        if (passwordStrength >= 2) return '#f97316';
        return '#ef4444';
    };
    
    const getStrengthText = () => {
        if (passwordStrength >= 5) return '매우 강함';
        if (passwordStrength >= 4) return '강함';
        if (passwordStrength >= 3) return '보통';
        if (passwordStrength >= 2) return '약함';
        return '매우 약함';
    };
    
    if (validating) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>링크를 확인하는 중...</p>
            </div>
        );
    }
    
    if (!tokenValid) {
        return null;
    }
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                        🔐 비밀번호 재설정
                    </h2>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        새로운 비밀번호를 입력해주세요.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            새 비밀번호 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="8자 이상, 숫자+특수문자"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.newPassword ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        {formData.newPassword && (
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            height: '100%',
                                            backgroundColor: getStrengthColor(),
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', marginTop: '5px', color: getStrengthColor() }}>
                                    강도: {getStrengthText()}
                                </p>
                            </div>
                        )}
                        {errors.newPassword && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.newPassword}
                            </p>
                        )}
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                            숫자와 특수문자를 포함해야 합니다. (영문 선택)
                        </p>
                    </div>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            비밀번호 확인 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.confirmPassword ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '5px' }}>
                                ✓ 비밀번호가 일치합니다.
                            </p>
                        )}
                        {errors.confirmPassword && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>
                    
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
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '처리 중...' : '비밀번호 변경'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;