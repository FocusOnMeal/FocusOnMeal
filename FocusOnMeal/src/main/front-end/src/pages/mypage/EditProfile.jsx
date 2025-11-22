import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = () => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        memberId: '',
        nickname: '',
        phone: ''
    });
    
    const [formData, setFormData] = useState({
        nickname: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        phone: ''
    });
    
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
    const [validations, setValidations] = useState({
        currentPassword: { valid: false, message: '' },
        newPassword: { valid: false, message: '' },
        confirmPassword: { valid: false, message: '' },
        phone: { valid: false, message: '' }
    });
    const [nicknameSpinning, setNicknameSpinning] = useState(false);
    
    const API_BASE_URL = "http://localhost:8080";

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/api/mypage/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUserData(res.data);
            setFormData({
                nickname: res.data.nickname || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                phone: res.data.phone || ''
            });
        } catch (error) {
            console.error('사용자 정보 로딩 오류:', error);
            alert('사용자 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomNickname = async () => {
        setNicknameSpinning(true);
        
        // ✅ 수정: 백엔드와 동일한 풍부한 닉네임 조합 (Join.jsx와 동일한 배열 사용)
        const adjectives = [
            '따뜻한', '포근한', '신비한', '강한', '귀여운', '용감한', '슬기로운', 
            '활발한', '조용한', '차분한', '빛나는', '달콤한', '상냥한', '깜찍한', 
            '발랄한', '몽환적인', '환상적인', '강렬한', '냉정한', '우아한', '화려한', 
            '영롱한', '전설적인', '매혹적인', '냉혹한', '영원한', '불멸의'
        ];
        
        const animals = [
            '고양이', '강아지', '토끼', '햄스터', '판다', '호랑이', '사자', '늑대', 
            '여우', '용', '유니콘', '펭귄', '코알라', '돌고래', '독수리', '불사조', 
            '드래곤', '피닉스', '사슴', '곰', '수달', '너구리', '그리핀', '페가수스'
        ];
        
        const suffixes = [
            '왕', '여왕', '공주', '요정', '천사', '기사', '마법사', '전사', '영웅', 
            '용사', '별', '달', '꽃', '구름', '바람', '하늘', '전설', '신화', 
            '마스터', '선생', '박사', '소울', '빛', '어둠', '정령', '수호자'
        ];
        
        const spinCount = 10;
        const spinInterval = 100;
        
        // ✅ 슬롯머신 애니메이션: 백엔드와 비슷한 닉네임 조합 보여주기
        for (let i = 0; i < spinCount; i++) {
            await new Promise(resolve => setTimeout(resolve, spinInterval));
            const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
            const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            const tempNickname = `${randomAdj}${randomAnimal}${randomSuffix}`;
            setFormData(prev => ({ ...prev, nickname: tempNickname }));
        }
        
        // ✅ 최종 닉네임 API 호출
        try {
            const res = await axios.get(`${API_BASE_URL}/api/member/random-nickname`);
            setFormData(prev => ({ ...prev, nickname: res.data.nickname }));
        } catch (error) {
            console.error('랜덤 닉네임 생성 오류:', error);
            alert('닉네임 생성에 실패했습니다.');
        } finally {
            setNicknameSpinning(false);
        }
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        if (!password) return { score: 0, text: '', color: '' };

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { score, text: '약함', color: '#ef4444' };
        if (score <= 4) return { score, text: '보통', color: '#f59e0b' };
        return { score, text: '강함', color: '#10b981' };
    };

    const validatePassword = (password) => {
        if (!password) return { valid: false, message: '' };
        
        const minLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!minLength) {
            return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
        }
        if (!hasLetter) {
            return { valid: false, message: '영문자를 포함해야 합니다.' };
        }
        if (!hasNumber) {
            return { valid: false, message: '숫자를 포함해야 합니다.' };
        }
        if (!hasSpecial) {
            return { valid: false, message: '특수문자를 포함해야 합니다.' };
        }

        return { valid: true, message: '사용 가능한 비밀번호입니다.' };
    };

    const validatePhone = (phone) => {
        if (!phone) return { valid: false, message: '' };
        
        const phoneRegex = /^010-\d{4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return { valid: false, message: '010-0000-0000 형식으로 입력해주세요.' };
        }
        return { valid: true, message: '올바른 형식입니다.' };
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (field === 'newPassword') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
            const validation = validatePassword(value);
            setValidations(prev => ({ ...prev, newPassword: validation }));
            
            if (formData.confirmPassword) {
                setValidations(prev => ({
                    ...prev,
                    confirmPassword: value === formData.confirmPassword
                        ? { valid: true, message: '비밀번호가 일치합니다.' }
                        : { valid: false, message: '비밀번호가 일치하지 않습니다.' }
                }));
            }
        }

        if (field === 'confirmPassword') {
            setValidations(prev => ({
                ...prev,
                confirmPassword: value === formData.newPassword
                    ? { valid: true, message: '비밀번호가 일치합니다.' }
                    : { valid: false, message: '비밀번호가 일치하지 않습니다.' }
            }));
        }

        if (field === 'phone') {
            const validation = validatePhone(value);
            setValidations(prev => ({ ...prev, phone: validation }));
        }

        if (field === 'currentPassword') {
            setValidations(prev => ({
                ...prev,
                currentPassword: value ? { valid: true, message: '' } : { valid: false, message: '' }
            }));
        }
    };

    const handlePhoneInput = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        if (value.length > 3 && value.length <= 7) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length > 7) {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
        
        handleChange('phone', value);
    };

    const handleSubmit = async () => {
        // 비밀번호 변경 시 유효성 검사
        const isPasswordChange = formData.currentPassword || formData.newPassword || formData.confirmPassword;
        
        if (isPasswordChange) {
            if (!formData.currentPassword) {
                alert('기존 비밀번호를 입력해주세요.');
                return;
            }
            if (!formData.newPassword) {
                alert('새 비밀번호를 입력해주세요.');
                return;
            }
            if (!validations.newPassword.valid) {
                alert(validations.newPassword.message);
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                alert('새 비밀번호가 일치하지 않습니다.');
                return;
            }
        }

        if (formData.phone && !validations.phone.valid) {
            alert('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                nickname: formData.nickname,
                phone: formData.phone
            };

            if (isPasswordChange) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            await axios.put(`${API_BASE_URL}/api/mypage/profile`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('회원정보가 수정되었습니다!');
            
            // 비밀번호 필드 초기화
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setPasswordStrength({ score: 0, text: '', color: '' });
            
            // 최신 정보 다시 로드
            loadUserData();
        } catch (error) {
            console.error('회원정보 수정 오류:', error);
            alert(error.response?.data?.message || '회원정보 수정에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <p style={{ fontSize: '18px', color: '#6b7280' }}>로딩 중...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '3px solid #3b82f6',
                padding: '40px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '30px',
                    textAlign: 'center'
                }}>
                    회원정보 수정
                </h2>

                {/* 아이디 (고정) */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        아이디
                    </label>
                    <input
                        type="text"
                        value={userData.memberId}
                        disabled
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '15px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            cursor: 'not-allowed'
                        }}
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                        아이디는 변경할 수 없습니다.
                    </p>
                </div>

                {/* 닉네임 (랜덤 버튼만) */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        닉네임
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={formData.nickname}
                            disabled
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                cursor: 'not-allowed'
                            }}
                            placeholder="랜덤 버튼을 눌러 닉네임을 생성하세요"
                        />
                        <button
                            onClick={generateRandomNickname}
                            disabled={nicknameSpinning}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: nicknameSpinning ? '#9ca3af' : '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: nicknameSpinning ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {nicknameSpinning ? '🎲 굴리는 중...' : '🎲 랜덤'}
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                        닉네임은 랜덤 버튼으로만 변경할 수 있습니다.
                    </p>
                </div>

                <div style={{
                    height: '1px',
                    backgroundColor: '#e5e7eb',
                    margin: '30px 0'
                }} />

                {/* 기존 비밀번호 */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        기존 비밀번호
                    </label>
                    <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => handleChange('currentPassword', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                        placeholder="비밀번호를 변경하려면 입력하세요"
                    />
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                        비밀번호를 변경하지 않으려면 비워두세요.
                    </p>
                </div>

                {/* 새 비밀번호 */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        새 비밀번호
                    </label>
                    <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: `2px solid ${
                                !formData.newPassword ? '#d1d5db' :
                                validations.newPassword.valid ? '#10b981' : '#ef4444'
                            }`,
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                        placeholder="새 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)"
                    />
                    {formData.newPassword && (
                        <>
                            <div style={{
                                marginTop: '10px',
                                padding: '8px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>비밀번호 강도:</span>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: passwordStrength.color
                                    }}>
                                        {passwordStrength.text}
                                    </span>
                                </div>
                                <div style={{
                                    height: '6px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${(passwordStrength.score / 6) * 100}%`,
                                        height: '100%',
                                        backgroundColor: passwordStrength.color,
                                        transition: 'width 0.3s, background-color 0.3s'
                                    }} />
                                </div>
                            </div>
                            {validations.newPassword.message && (
                                <p style={{
                                    fontSize: '13px',
                                    color: validations.newPassword.valid ? '#10b981' : '#ef4444',
                                    marginTop: '8px'
                                }}>
                                    {validations.newPassword.message}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* 새 비밀번호 확인 */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        새 비밀번호 확인
                    </label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: `2px solid ${
                                !formData.confirmPassword ? '#d1d5db' :
                                validations.confirmPassword.valid ? '#10b981' : '#ef4444'
                            }`,
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                    {validations.confirmPassword.message && (
                        <p style={{
                            fontSize: '13px',
                            color: validations.confirmPassword.valid ? '#10b981' : '#ef4444',
                            marginTop: '8px'
                        }}>
                            {validations.confirmPassword.message}
                        </p>
                    )}
                </div>

                <div style={{
                    height: '1px',
                    backgroundColor: '#e5e7eb',
                    margin: '30px 0'
                }} />

                {/* 휴대폰 번호 */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                    }}>
                        휴대폰 번호
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneInput}
                        maxLength={13}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: `2px solid ${
                                !formData.phone ? '#d1d5db' :
                                validations.phone.valid ? '#10b981' : '#ef4444'
                            }`,
                            borderRadius: '8px',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                        placeholder="010-0000-0000"
                    />
                    {validations.phone.message && (
                        <p style={{
                            fontSize: '13px',
                            color: validations.phone.valid ? '#10b981' : '#ef4444',
                            marginTop: '8px'
                        }}>
                            {validations.phone.message}
                        </p>
                    )}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                        변경하지 않으려면 그대로 두세요.
                    </p>
                </div>

                {/* 수정 버튼 */}
                <button
                    onClick={handleSubmit}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                    수정하기
                </button>
            </div>
        </div>
    );
};

export default EditProfile;