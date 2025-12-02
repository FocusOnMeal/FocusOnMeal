import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './NoticeInsert.module.css';

const NoticeInsert = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        memberId: "관리자",
        noticeSubject: '',
        noticeContent: '',
        noticeImportant: 'N',
        noticeIsNew: 'Y',
        isDeleted: 'N'
    });

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked ? 'Y' : 'N'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // 유효성 검사
    const validateForm = () => {
        const newErrors = {};

        if (!formData.noticeSubject.trim()) {
            newErrors.noticeSubject = '제목을 입력해주세요.';
        } else if (formData.noticeSubject.length > 100) {
            newErrors.noticeSubject = '제목은 100자 이내로 입력해주세요.';
        }

        if (!formData.noticeContent.trim()) {
            newErrors.noticeContent = '내용을 입력해주세요.';
        } else if (formData.noticeContent.length > 1000) {
            newErrors.noticeContent = '내용은 1000자 이내로 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                '/api/admin/noticeInfo/insert',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // 토큰이 localStorage에 있다고 가정
                    }
                }
            );

            if (response.data === 'success') {
                alert('공지사항이 등록되었습니다.');
                navigate('/admin/noticeInfo'); // 공지사항 목록으로 이동
            }
        } catch (error) {
            console.error('공지사항 등록 실패:', error);
            
            if (error.response?.status === 401) {
                alert('로그인이 필요합니다.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                alert('관리자만 접근 가능합니다.');
            } else {
                alert('공지사항 등록에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 취소
    const handleCancel = () => {
        if (window.confirm('작성을 취소하시겠습니까? 작성 중인 내용은 저장되지 않습니다.')) {
            navigate('/admin/noticeInfo');
        }
    };

    // 글자 수 계산
    const getCharCountClass = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 100) return styles.error;
        if (percentage >= 90) return styles.warning;
        return '';
    };

    return (
        <div className={styles.container}>
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                </div>
            )}

            <div className={styles.header}>
                <h1 className={styles.title}>공지사항 작성</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* 안내 메시지 */}
                <div className={styles.infoBox}>
                    <p>
                        ⚠️ 공지사항은 모든 회원에게 공개됩니다. 신중하게 작성해주세요.
                    </p>
                </div>

                {/* 제목 */}
                <div className={styles.formGroup}>
                    <label htmlFor="noticeSubject" className={styles.label}>
                        제목<span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="noticeSubject"
                        name="noticeSubject"
                        value={formData.noticeSubject}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="공지사항 제목을 입력하세요"
                        maxLength={100}
                    />
                    {errors.noticeSubject && (
                        <div className={styles.errorMessage}>{errors.noticeSubject}</div>
                    )}
                    <div className={`${styles.charCount} ${getCharCountClass(formData.noticeSubject.length, 100)}`}>
                        {formData.noticeSubject.length} / 100자
                    </div>
                </div>

                {/* 내용 */}
                <div className={styles.formGroup}>
                    <label htmlFor="noticeContent" className={styles.label}>
                        내용<span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="noticeContent"
                        name="noticeContent"
                        value={formData.noticeContent}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="공지사항 내용을 입력하세요"
                        maxLength={1000}
                    />
                    {errors.noticeContent && (
                        <div className={styles.errorMessage}>{errors.noticeContent}</div>
                    )}
                    <div className={`${styles.charCount} ${getCharCountClass(formData.noticeContent.length, 1000)}`}>
                        {formData.noticeContent.length} / 1000자
                    </div>
                </div>

                {/* 옵션 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>옵션</label>
                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="noticeImportant"
                                checked={formData.noticeImportant === 'Y'}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span>중요 공지사항</span>
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="noticeIsNew"
                                checked={formData.noticeIsNew === 'Y'}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span>새 글 표시 (NEW)</span>
                        </label>
                    </div>
                    <div className={styles.helpText}>
                        중요 공지사항은 목록 상단에 고정되며, 새 글 표시는 'NEW' 뱃지가 표시됩니다.
                    </div>
                </div>

                {/* 버튼 */}
                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className={`${styles.button} ${styles.cancelButton}`}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.button} ${styles.submitButton}`}
                    >
                        {loading ? '등록 중...' : '등록'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NoticeInsert;