import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SafetyForm.module.css';

const AdminSafetyForm = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!alertId;

    const [formData, setFormData] = useState({
        nation: '',
        hazardType: '',
        title: '',
        description: '',
        ingredientId: 1 // 기본값
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchAlertDetail();
        }
    }, [alertId]);

    const fetchAlertDetail = async () => {
        try {
            const response = await axios.get(`/api/admin/safetyInfo/detail/${alertId}`);
            setFormData({
                nation: response.data.nation || '',
                hazardType: response.data.hazardType || '',
                title: response.data.title || '',
                description: response.data.description || '',
                ingredientId: response.data.ingredientId || 1
            });
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('데이터를 불러오는데 실패했습니다.');
            navigate('/admin/safetyInfo');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nation.trim()) {
            newErrors.nation = '공표 국가를 입력해주세요.';
        }

        if (!formData.hazardType) {
            newErrors.hazardType = '위험 유형을 선택해주세요.';
        }

        if (!formData.title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (formData.title.length > 500) {
            newErrors.title = '제목은 500자 이내로 입력해주세요.';
        }

        if (!formData.description.trim()) {
            newErrors.description = '상세 내용을 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const url = isEditMode 
                ? `/api/admin/safetyInfo/update/${alertId}`
                : '/api/admin/safetyInfo/register';
            
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await axios({
                method: method,
                url: url,
                data: formData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert(isEditMode ? '수정되었습니다.' : '등록되었습니다.');
                navigate('/admin/safetyInfo');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            if (error.response) {
                alert(`오류: ${error.response.data.error || '저장 중 오류가 발생했습니다.'}`);
            } else {
                alert('서버와의 통신에 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (confirm('작성을 취소하시겠습니까? 입력한 내용이 저장되지 않습니다.')) {
            navigate('/admin/safetyInfo');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h1 className={styles.pageTitle}>
                    {isEditMode ? '안전정보 수정' : '안전정보 등록'}
                </h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            공표 국가 <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            name="nation"
                            value={formData.nation}
                            onChange={handleChange}
                            placeholder="예: 미국, 일본, 중국"
                            className={`${styles.input} ${errors.nation ? styles.inputError : ''}`}
                        />
                        {errors.nation && (
                            <span className={styles.errorMessage}>{errors.nation}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            위험 유형 <span className={styles.required}>*</span>
                        </label>
                        <select
                            name="hazardType"
                            value={formData.hazardType}
                            onChange={handleChange}
                            className={`${styles.select} ${errors.hazardType ? styles.inputError : ''}`}
                        >
                            <option value="">선택하세요</option>
                            <option value="위해식품정보">위해식품정보</option>
                            <option value="글로벌 동향정보">글로벌 동향정보</option>
                            <option value="연구평가정보">연구평가정보</option>
                            <option value="법제도정보">법제도정보</option>
                        </select>
                        {errors.hazardType && (
                            <span className={styles.errorMessage}>{errors.hazardType}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            제목 <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="안전정보 제목을 입력하세요 (최대 500자)"
                            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                            maxLength="500"
                        />
                        <div className={styles.charCount}>
                            {formData.title.length} / 500
                        </div>
                        {errors.title && (
                            <span className={styles.errorMessage}>{errors.title}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            상세 내용 <span className={styles.required}>*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="안전정보 상세 내용을 입력하세요"
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            rows="15"
                        />
                        {errors.description && (
                            <span className={styles.errorMessage}>{errors.description}</span>
                        )}
                    </div>

                    <div className={styles.buttonGroup}>
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className={styles.cancelBtn}
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? '처리중...' : (isEditMode ? '수정 완료' : '등록 완료')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSafetyForm;