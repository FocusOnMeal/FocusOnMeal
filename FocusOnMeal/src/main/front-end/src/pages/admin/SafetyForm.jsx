import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import styles from './SafetyForm.module.css';

const AdminSafetyForm = () => {
    const { alertId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!alertId;
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        nation: '',
        hazardType: '',
        title: '',
        description: '',
        ingredientId: 1
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchAlertDetail();
        }
    }, [alertId]);

    const [isComposing, setIsComposing] = useState(false); // 한글 입력 중인지 체크

    useEffect(() => {
        // description이 변경되면 contentEditable div에 반영 (최초 로드 시에만)
        if (editorRef.current && formData.description && !editorRef.current.innerHTML) {
            const sanitized = DOMPurify.sanitize(formData.description, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a'],
                ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'title']
            });
            editorRef.current.innerHTML = sanitized;
        }
    }, [formData.description]);

    const fetchAlertDetail = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/admin/safetyInfo');
            return;
        }

        try {
            const response = await axios.get(`/api/admin/safetyInfo/detail/${alertId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
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
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // ✅ ContentEditable 내용 변경 핸들러 (한글 입력 완료 후에만 실행)
    const handleEditorInput = () => {
        if (editorRef.current && !isComposing) {
            const content = editorRef.current.innerHTML;
            setFormData(prev => ({
                ...prev,
                description: content
            }));
            if (errors.description) {
                setErrors(prev => ({
                    ...prev,
                    description: ''
                }));
            }
        }
    };

    // ✅ 한글 입력 시작
    const handleCompositionStart = () => {
        setIsComposing(true);
    };

    // ✅ 한글 입력 완료
    const handleCompositionEnd = () => {
        setIsComposing(false);
        // 한글 입력이 완료된 후 내용 업데이트
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setFormData(prev => ({
                ...prev,
                description: content
            }));
        }
    };

    // ✅ 서식 적용 함수들
    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
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

        const textContent = editorRef.current?.textContent || '';
        if (!textContent.trim()) {
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

        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate('/member/login');
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                alert(isEditMode ? '수정되었습니다.' : '등록되었습니다.');
                navigate('/admin/safetyInfo');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            if (error.response) {
                if (error.response.status === 403) {
                    alert('관리자 권한이 필요합니다.');
                } else {
                    alert(`오류: ${error.response.data.error || '저장 중 오류가 발생했습니다.'}`);
                }
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
                        
                        {/* ✅ 간단한 툴바 */}
                        <div style={{
                            display: 'flex',
                            gap: '5px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ddd',
                            borderBottom: 'none',
                            borderRadius: '4px 4px 0 0'
                        }}>
                            <button type="button" onClick={() => applyFormat('bold')} 
                                style={toolbarButtonStyle} title="굵게">
                                <strong>B</strong>
                            </button>
                            <button type="button" onClick={() => applyFormat('italic')} 
                                style={toolbarButtonStyle} title="기울임">
                                <em>I</em>
                            </button>
                            <button type="button" onClick={() => applyFormat('underline')} 
                                style={toolbarButtonStyle} title="밑줄">
                                <u>U</u>
                            </button>
                            <div style={{ width: '1px', backgroundColor: '#ddd', margin: '0 5px' }}></div>
                            <button type="button" onClick={() => applyFormat('insertUnorderedList')} 
                                style={toolbarButtonStyle} title="글머리 기호">
                                ●
                            </button>
                            <button type="button" onClick={() => applyFormat('insertOrderedList')} 
                                style={toolbarButtonStyle} title="번호 매기기">
                                1.
                            </button>
                            <div style={{ width: '1px', backgroundColor: '#ddd', margin: '0 5px' }}></div>
                            <button type="button" onClick={() => applyFormat('removeFormat')} 
                                style={toolbarButtonStyle} title="서식 지우기">
                                ✕
                            </button>
                        </div>

                        {/* ✅ ContentEditable 편집기 */}
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleEditorInput}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                            style={{
                                minHeight: '400px',
                                padding: '16px',
                                border: errors.description ? '1px solid #dc3545' : '1px solid #ddd',
                                borderTop: 'none',
                                borderRadius: '0 0 4px 4px',
                                backgroundColor: 'white',
                                lineHeight: '1.8',
                                fontSize: '15px',
                                outline: 'none'
                            }}
                            suppressContentEditableWarning
                        />
                        
                        {errors.description && (
                            <span className={styles.errorMessage} style={{ marginTop: '5px', display: 'block' }}>
                                {errors.description}
                            </span>
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

// 툴바 버튼 스타일
const toolbarButtonStyle = {
    padding: '5px 10px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    borderRadius: '3px',
    fontSize: '14px',
    minWidth: '30px'
};

export default AdminSafetyForm;