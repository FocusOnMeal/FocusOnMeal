import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './FindPassword.module.css';

function FindPassword() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        memberId: '',
        email: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [emailSent, setEmailSent] = useState(false);
    const [countdown, setCountdown] = useState(3600); // 1시간 = 3600초
    
    // 카운트다운 효과
    useEffect(() => {
        if (!emailSent) return;
        
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [emailSent]);
    
    // 시간 포맷 함수 (59:59 형식)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
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
        
        if (!formData.memberId.trim()) {
            newErrors.memberId = '아이디를 입력해주세요.';
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
            
            const response = await authService.sendPasswordResetLink(
                formData.memberId,
                formData.email
            );
            
            console.log('비밀번호 재설정 API 응답:', response);
            
            if (response.data.success) {
                setEmailSent(true);
            }
        } catch (error) {
            console.error('비밀번호 재설정 오류:', error);
            const errorMessage = error.response?.data?.error || '일치하는 회원 정보를 찾을 수 없습니다.';
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {!emailSent ? (
                    <>
                        <div className={styles.header}>
                            <h2 className={styles.title}>비밀번호 찾기</h2>
                            <p className={styles.subtitle}>가입 시 입력한 정보를 입력해주세요.</p>
                        </div>

                        {errors.general && (
                            <div className={styles.errorBox}>{errors.general}</div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    아이디 <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="memberId"
                                    value={formData.memberId}
                                    onChange={handleChange}
                                    placeholder="가입 시 입력한 아이디"
                                    className={`${styles.input} ${errors.memberId ? styles.error : ''}`}
                                />
                                {errors.memberId && (
                                    <p className={styles.errorMessage}>{errors.memberId}</p>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    이메일 <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="가입 시 입력한 이메일"
                                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                                />
                                {errors.email && (
                                    <p className={styles.errorMessage}>{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? '처리 중...' : '비밀번호 재설정 링크 받기'}
                            </button>

                            <div className={styles.footer}>
                                <span
                                    onClick={() => navigate('/member/login')}
                                    className={styles.footerLink}
                                >
                                    로그인
                                </span>
                                <span className={styles.divider}>|</span>

                                <span
                                    onClick={() => navigate('/member/findId')}
                                    className={styles.footerLink}
                                >
                                    아이디 찾기
                                </span>
                                <span className={styles.divider}>|</span>

                                <span
                                    onClick={() => navigate('/member/join')}
                                    className={styles.footerLink}
                                >
                                    회원가입
                                </span>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        {/* 성공 아이콘 - 이메일 아이콘 */}
                        <div className={styles.successIcon}></div>

                        {/* 제목 */}
                        <h2 className={styles.successTitle}>이메일 발송 완료</h2>
                        
                        {/* 안내 메시지 */}
                        <p className={styles.successMessage}>
                            <strong>비밀번호 재설정 링크</strong>를 이메일로 발송했습니다.
                        </p>

                        {/* 이메일 결과 카드 */}
                        <div className={styles.resultCard}>
                            <div className={styles.resultLabel}>발송된 이메일</div>
                            <div className={styles.resultId}>{formData.email}</div>
                            <div className={styles.validTime}>
                                <span className={styles.timeIcon}>⏰</span>
                                {countdown > 0 ? (
                                    <>
                                        링크 유효시간: <strong className={styles.countdownTime}>{formatTime(countdown)}</strong>
                                    </>
                                ) : (
                                    <span className={styles.expiredText}>링크가 만료되었습니다</span>
                                )}
                            </div>
                        </div>

                        {/* 버튼 그룹 */}
                        <div className={styles.buttonGroup}>
                            <button
                                onClick={() => navigate('/member/login')}
                                className={styles.primaryButton}
                            >
                                로그인하러 가기
                            </button>

                            <button
                                onClick={() => {
                                    setEmailSent(false);
                                    setCountdown(3600); // 카운트다운 리셋
                                }}
                                className={styles.secondaryButton}
                            >
                                다시 입력하기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FindPassword;