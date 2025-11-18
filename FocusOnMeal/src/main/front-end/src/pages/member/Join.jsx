// src/components/auth/Join.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

// 이메일 도메인 목록
const emailDomains = [
    "선택",
    "naver.com",
    "gmail.com",
    "daum.net",
    "hanmail.net",
    "nate.com",
    "직접입력"
];

function Join() {
    const navigate = useNavigate();
    
    // 폼 데이터
    const [formData, setFormData] = useState({
        memberId: '',
        memberPw: '',
        confirmPw: '',
        memberName: '',
        phone: '',
        emailId: '',
        emailDomain: emailDomains[0],
        customDomain: '',
        gender: 'M'
    });
    
    // UI 상태
    const [selectedDomain, setSelectedDomain] = useState(emailDomains[0]);
    const [generatedNickname, setGeneratedNickname] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // 아이디 중복 확인
    const [idChecked, setIdChecked] = useState(false);
    const [idAvailable, setIdAvailable] = useState(false);
    
    // 이메일 인증
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);
    
    const isCustomDomain = selectedDomain === "직접입력";
    
    // ============ 랜덤 닉네임 생성 로직 (기존 코드 그대로) ============
    
    // 형용사
    const adjectives = [
        // 따뜻한 느낌
        '따뜻한', '포근한', '아늑한', '부드러운', '온화한', '달콤한', '다정한', 
        '상냥한', '사랑스러운', '평온한', '편안한', '순한', '잔잔한', '포근포근한', 
        '다정다감한', '포용하는',
        // 신비한 느낌
        '신비한', '몽환적인', '꿈같은', '환상적인', '은은한', '비밀스러운', 
        '신성한', '신묘한', '불가사의한', '고요한', '청아한', '미묘한', '성스러운', 
        '빛나는', '어스름한',
        // 강한 느낌
        '강한', '거친', '냉정한', '차가운', '뜨거운', '잔혹한', '무자비한', 
        '단단한', '날카로운', '사나운', '불타는', '강렬한', '냉혹한', '독한', 
        '강직한', '용감한',
        // 귀여운 느낌
        '귀여운', '깜찍한', '발랄한', '사랑스러운', '상큼한', '톡톡한', 
        '앙증맞은', '엉뚱한', '유쾌한', '명랑한', '엉망진창한', '허당한', 
        '엉뚱발랄한',
        // 색상/자연
        '푸른', '맑은', '투명한', '하얀', '붉은', '노란', '은빛의', '금빛의', 
        '별빛의', '달빛의', '바람의', '하늘의', '빗방울의', '잎새의', '꽃잎의', 
        '햇살의', '새벽의', '노을의', '바다의', '구름의',
        // 어두운 느낌
        '어두운', '서늘한', '쓸쓸한', '고독한', '슬픈', '공허한', '차분한', 
        '조용한', '담담한', '외로운', '냉한', '시린', '무심한', '깊은',
        // 추가 형용사
        '활기찬', '생동감있는', '역동적인', '우아한', '고상한', '화려한', 
        '찬란한', '영롱한', '반짝이는', '영원한', '불멸의', '전설적인',
        '신비로운', '매혹적인', '황홀한', '경이로운', '놀라운', '경쾌한',
        '민첩한', '재빠른', '영리한', '현명한', '슬기로운', '총명한'
    ];

    // 동물
    const animals = [
        // 귀여운 동물
        '강아지', '고양이', '토끼', '햄스터', '다람쥐', '펭귄', '코알라', '판다', 
        '곰', '수달', '너구리', '고슴도치', '아기새', '병아리', '참새', '돌고래', 
        '물개', '인형곰', '미어캣', '사슴',
        // 강한 동물
        '늑대', '호랑이', '사자', '독수리', '매', '용', '뱀', '여우', '하이에나', 
        '표범', '재규어', '곰표범', '검은까마귀', '불사조', '드래곤', '독사', 
        '하늘매', '이리', '늑대왕',
        // 신화 동물
        '유니콘', '그리핀', '페가수스', '피닉스', '크라켄', '키메라', '인어', 
        '요정새', '천마', '백호', '흑룡', '청룡', '봉황', '현무', '주작', 
        '백조', '까마귀', '올빼미', '부엉이', '고래',
        // 기타 동물
        '개구리', '오리', '돼지', '닭', '소', '염소', '코끼리', '하마', 
        '원숭이', '고릴라', '두더지', '악어', '참치', '문어', '오징어', 
        '새우', '개복치', '거북이',
        // 자연 동물
        '나비', '새', '물고기', '비둘기', '벌', '풍뎅이', '제비', 
        '하늘새', '꿀벌', '수국나비', '해파리',
        // 추가 동물
        '알파카', '라마', '카피바라', '퀴카', '레서판다', '페럿', '친칠라',
        '앵무새', '카나리아', '공작', '학', '두루미', '기린', '얼룩말',
        '캥거루', '코뿔소', '하마', '멧돼지', '산양', '오소리', '스라소니',
        '치타', '퓨마', '팬더', '북극곰', '반달곰', '물범', '바다표범',
        '상어', '가오리', '연어', '고등어', '꽁치', '복어', '가재', '랍스터',
        '도마뱀', '카멜레온', '이구아나', '코브라', '비단뱀'
    ];

    // 접미사
    const suffixes = [
        // 판타지
        '왕', '여왕', '왕자', '공주', '요정', '천사', '악마', '마왕', '드래곤', 
        '기사', '정령', '선녀', '요왕', '요기', '소환사', '마법사', '위자드', 
        '궁수', '검사', '성녀', '수호자', '빛', '어둠', '그림자', '별빛', '달빛', 
        '하늘', '꿈', '운명', '신', '영혼', '소울',
        // 직업/호칭
        '선생', '박사', '장인', '마스터', '덕후', '중독자', '요원', '대장', 
        '팀장', '보스', '킹', '퀸', '맨', '봇', '로봇', '머신', '캐릭', 
        '괴인', '전사', '도사', '도련님', '지박령', '버서커',
        // 자연
        '꽃', '나무', '숲', '새벽', '구름', '바람', '물결', '불꽃', '별', 
        '달', '해', '눈꽃', '서리', '봄', '여름', '가을', '겨울', '비', 
        '노을', '파도', '바다', '산', '들꽃', '강', '모래', '새', 
        '햇살', '미소', '노래', '향기',
        // 추가 접미사
        '영웅', '용사', '전설', '신화', '제왕', '황제', '황후', '폐하',
        '각하', '나리', '도령', '낭자', '소저', '공자', '영애',
        '샘', '쌤', '선배', '후배', '친구', '동료', '벗', '동지',
        '하트', '스타', '문', '선', '검', '방패', '창', '활',
        '불', '물', '땅', '돌', '나뭇잎', '씨앗', '뿌리', '가지',
        '은하', '우주', '세계', '차원', '시공', '영역', '성역', '낙원',
        '무한', '영원', '찰나', '순간', '시간', '공간',
        // 넣고 싶어서 넣음
        '1호', '2호', '3호', '4호', '5호', '6호', '7호', '8호', 
        '9호', '10호', '11호', '12호', '13호', '14호', '15호', '16호',
        '17호', '18호', '19', '20호', '21호', '22호', '23호', '100호'
    ];
    
    /**
     * 문자열의 바이트 길이를 계산합니다. (한글 1글자는 3바이트로 가정)
     */
    const getByteLength = (str) => {
        let byteLength = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            if (char <= 0x7F) {
                byteLength += 1;
            } else if (char <= 0x7FF) {
                byteLength += 2;
            } else if (char <= 0xFFFF) {
                byteLength += 3;
            } else {
                byteLength += 4;
            }
        }
        return byteLength;
    };
    
    /**
     * 랜덤 닉네임 생성 (길이 제한: 12자 이하 또는 40바이트 이하)
     */
    const generateUserNickname = () => {
        let nickname;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            const type = Math.floor(Math.random() * 4);
            
            // 닉네임 조합 패턴
            switch(type) {
                case 0: 
                    nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
                    break;
                case 1: 
                    nickname = `${animals[Math.floor(Math.random() * animals.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
                    break;
                case 2: 
                    nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
                    break;
                case 3: 
                    nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
                    break;
                default:
                    nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
            }
            
            attempts++;
        } while (
            (nickname.length > 12 || getByteLength(nickname) > 40) && 
            attempts < maxAttempts
        );

        return nickname;
    };
    
    // 초기 닉네임 생성
    useEffect(() => {
        setGeneratedNickname(generateUserNickname());
    }, []);
    
    // ============ 비밀번호 강도 계산 ============
    useEffect(() => {
        const password = formData.memberPw;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
        
        setPasswordStrength(Math.min(strength, 5));
    }, [formData.memberPw]);
    
    // ============ 인증 타이머 ============
    useEffect(() => {
        let interval = null;
        if (verificationTimer > 0) {
            interval = setInterval(() => {
                setVerificationTimer(prev => prev - 1);
            }, 1000);
        } else if (verificationTimer === 0 && verificationSent) {
            setVerificationSent(false);
        }
        return () => clearInterval(interval);
    }, [verificationTimer, verificationSent]);
    
    // ============ 입력 변경 핸들러 ============
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // 전화번호 자동 하이픈 처리
        if (name === 'phone') {
            const numbers = value.replace(/[^0-9]/g, ''); // 숫자만 추출
            let formattedPhone = numbers;
            
            if (numbers.length <= 3) {
                formattedPhone = numbers;
            } else if (numbers.length <= 7) {
                formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            } else if (numbers.length <= 11) {
                formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
            } else {
                formattedPhone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
            }
            
            setFormData(prev => ({
                ...prev,
                [name]: formattedPhone
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // 아이디 변경 시 중복 확인 초기화
        if (name === 'memberId') {
            setIdChecked(false);
            setIdAvailable(false);
        }
        
        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    // ============ 아이디 중복 확인 ============
    const handleCheckId = async () => {
        if (!formData.memberId) {
            setErrors(prev => ({ ...prev, memberId: '아이디를 입력해주세요.' }));
            return;
        }
        
        if (formData.memberId.length < 4) {
            setErrors(prev => ({ ...prev, memberId: '아이디는 4자 이상이어야 합니다.' }));
            return;
        }
        
        try {
            const response = await authService.checkMemberId(formData.memberId);
            console.log('아이디 중복 확인 응답:', response.data);
            
            setIdChecked(true);
            setIdAvailable(response.data.available); // ✅ 수정된 구조
            
            if (response.data.available) {
                alert('사용 가능한 아이디입니다.');
            } else {
                setErrors(prev => ({ ...prev, memberId: '이미 사용중인 아이디입니다.' }));
            }
        } catch (error) {
            console.error('아이디 중복 확인 오류:', error);
            alert('아이디 중복 확인 중 오류가 발생했습니다.');
        }
    };
    
    // ============ 이메일 인증 코드 발송 ============
    const handleSendVerificationCode = async () => {
        const email = selectedDomain === "직접입력" 
            ? `${formData.emailId}@${formData.customDomain}`
            : `${formData.emailId}@${selectedDomain}`;
        
        if (!formData.emailId) {
            setErrors(prev => ({ ...prev, email: '이메일을 입력해주세요.' }));
            return;
        }
        
        if (selectedDomain === "선택") {
            setErrors(prev => ({ ...prev, email: '이메일 도메인을 선택해주세요.' }));
            return;
        }
        
        if (selectedDomain === "직접입력" && !formData.customDomain) {
            setErrors(prev => ({ ...prev, email: '이메일 도메인을 입력해주세요.' }));
            return;
        }
        
        try {
            setLoading(true);
            console.log('인증 코드 발송 요청:', email);
            const response = await authService.sendVerificationCode(email);
            console.log('인증 코드 발송 응답:', response.data);
            
            if (response.data.success) {
                setVerificationSent(true);
                setVerificationTimer(300); // 5분
                alert('인증 코드가 이메일로 발송되었습니다.');
            }
        } catch (error) {
            console.error('인증 코드 발송 오류:', error);
            const errorMessage = error.response?.data?.error || error.message || '인증 코드 발송에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ============ 이메일 인증 코드 확인 ============
    const handleVerifyCode = async () => {
        const email = selectedDomain === "직접입력" 
            ? `${formData.emailId}@${formData.customDomain}`
            : `${formData.emailId}@${selectedDomain}`;
        
        if (!emailVerificationCode) {
            alert('인증 코드를 입력해주세요.');
            return;
        }
        
        try {
            setLoading(true);
            console.log('이메일 인증 요청:', email, emailVerificationCode);
            const response = await authService.verifyEmailCode(email, emailVerificationCode);
            console.log('이메일 인증 응답:', response.data);
            
            if (response.data.verified) {
                setEmailVerified(true);
                setVerificationTimer(0);
                alert('이메일 인증이 완료되었습니다.');
            } else {
                alert('인증 코드가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('이메일 인증 오류:', error);
            const errorMessage = error.response?.data?.message || error.message || '인증 코드 확인에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ============ 폼 검증 ============
    const validateForm = () => {
        const newErrors = {};
        
        // 아이디
        if (!formData.memberId) {
            newErrors.memberId = '아이디를 입력해주세요.';
        } else if (!idChecked || !idAvailable) {
            newErrors.memberId = '아이디 중복 확인이 필요합니다.';
        }
        
        // 비밀번호 (✅ 수정: 숫자 + 특수문자만 있어도 OK)
        if (!formData.memberPw) {
            newErrors.memberPw = '비밀번호를 입력해주세요.';
        } else if (formData.memberPw.length < 8) {
            newErrors.memberPw = '비밀번호는 8자 이상이어야 합니다.';
        } else {
            const hasDigit = /\d/.test(formData.memberPw);
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.memberPw);
            
            if (!hasDigit || !hasSpecial) {
                newErrors.memberPw = '비밀번호는 숫자와 특수문자를 포함해야 합니다.';
            }
        }
        
        // 비밀번호 확인
        if (!formData.confirmPw) {
            newErrors.confirmPw = '비밀번호 확인을 입력해주세요.';
        } else if (formData.memberPw !== formData.confirmPw) {
            newErrors.confirmPw = '비밀번호가 일치하지 않습니다.';
        }
        
        // 이름
        if (!formData.memberName) {
            newErrors.memberName = '이름을 입력해주세요.';
        }
        
        // 전화번호
        if (!formData.phone) {
            newErrors.phone = '전화번호를 입력해주세요.';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
            newErrors.phone = '올바른 전화번호 형식이 아닙니다.';
        }
        
        // 이메일
        if (!formData.emailId) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!emailVerified) {
            newErrors.email = '이메일 인증이 필요합니다.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // ============ 폼 제출 ============
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert('입력 내용을 확인해주세요.');
            return;
        }
        
        const email = selectedDomain === "직접입력" 
            ? `${formData.emailId}@${formData.customDomain}`
            : `${formData.emailId}@${selectedDomain}`;
        
        const memberData = {
            memberId: formData.memberId,
            memberPw: formData.memberPw,
            memberName: formData.memberName,
            memberNickname: generatedNickname, // 랜덤 생성된 닉네임
            email: email,
            phone: formData.phone,
            gender: formData.gender
        };
        
        try {
            setLoading(true);
            console.log('회원가입 요청:', memberData);
            const response = await authService.joinMember(memberData);
            console.log('회원가입 응답:', response.data);
            
            if (response.data.success) {
                alert('회원가입이 완료되었습니다!');
                navigate('/login');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            const errorMessage = error.response?.data?.error || error.message || '회원가입에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // ============ 유틸리티 함수 ============
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
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '40px' }}>
                
                {/* 제목 */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>회원가입</h2>
                </div>
                
                {/* 폼 */}
                <form onSubmit={handleSubmit}>
                    
                    {/* Hidden 닉네임 */}
                    <input type="hidden" value={generatedNickname} />
                    
                    {/* 1. 아이디 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            아이디 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="memberId"
                                value={formData.memberId}
                                onChange={handleChange}
                                placeholder="아이디를 입력해주세요 (4자 이상)"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: errors.memberId ? '1px solid #dc2626' : '1px solid #d1d5db',
                                    borderRadius: '6px'
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleCheckId}
                                disabled={!formData.memberId || idChecked}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: idChecked && idAvailable ? '#10b981' : '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {idChecked && idAvailable ? '✓ 확인완료' : '중복확인'}
                            </button>
                        </div>
                        {errors.memberId && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.memberId}
                            </p>
                        )}
                        {idChecked && idAvailable && (
                            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '5px' }}>
                                사용 가능한 아이디입니다.
                            </p>
                        )}
                    </div>
                    
                    {/* 2. 비밀번호 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            비밀번호 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="password"
                            name="memberPw"
                            value={formData.memberPw}
                            onChange={handleChange}
                            placeholder="8자 이상, 영문+숫자+특수문자"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.memberPw ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px'
                            }}
                        />
                        {formData.memberPw && (
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
                        {errors.memberPw && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.memberPw}
                            </p>
                        )}
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                            숫자와 특수문자를 포함해야 합니다. (영문 선택)
                        </p>
                    </div>
                    
                    {/* 3. 비밀번호 확인 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            비밀번호 확인 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPw"
                            value={formData.confirmPw}
                            onChange={handleChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.confirmPw ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px'
                            }}
                        />
                        {formData.confirmPw && formData.memberPw === formData.confirmPw && (
                            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '5px' }}>
                                ✓ 비밀번호가 일치합니다.
                            </p>
                        )}
                        {errors.confirmPw && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.confirmPw}
                            </p>
                        )}
                    </div>
                    
                    {/* 4. 이름 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            이름 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="memberName"
                            value={formData.memberName}
                            onChange={handleChange}
                            placeholder="이름을 입력해주세요"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.memberName ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px'
                            }}
                        />
                        {errors.memberName && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.memberName}
                            </p>
                        )}
                    </div>
                    
                    {/* 5. 전화번호 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            전화번호 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="010-1234-5678"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px'
                            }}
                        />
                        {errors.phone && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.phone}
                            </p>
                        )}
                    </div>
                    
                    {/* 6. 이메일 + 인증 */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            이메일 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                name="emailId"
                                value={formData.emailId}
                                onChange={handleChange}
                                placeholder="이메일"
                                disabled={emailVerified}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px'
                                }}
                            />
                            <span style={{ alignSelf: 'center' }}>@</span>
                            <select
                                value={selectedDomain}
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                disabled={emailVerified}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px'
                                }}
                            >
                                {emailDomains.map((domain, index) => (
                                    <option key={index} value={domain}>{domain}</option>
                                ))}
                            </select>
                            {isCustomDomain && (
                                <input
                                    type="text"
                                    name="customDomain"
                                    value={formData.customDomain}
                                    onChange={handleChange}
                                    placeholder="직접입력"
                                    disabled={emailVerified}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px'
                                    }}
                                />
                            )}
                        </div>
                        
                        {!emailVerified && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSendVerificationCode}
                                    disabled={loading || verificationSent}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: verificationSent ? '#9ca3af' : '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        marginBottom: '10px',
                                        cursor: verificationSent ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {verificationSent ? `재전송 (${formatTime(verificationTimer)})` : '인증 코드 발송'}
                                </button>
                                
                                {verificationSent && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            value={emailVerificationCode}
                                            onChange={(e) => setEmailVerificationCode(e.target.value)}
                                            placeholder="인증 코드 6자리"
                                            maxLength={6}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyCode}
                                            disabled={loading}
                                            style={{
                                                padding: '12px 20px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            확인
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {emailVerified && (
                            <div style={{ backgroundColor: '#d1fae5', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ color: '#065f46', fontWeight: '600' }}>
                                    ✓ 이메일 인증이 완료되었습니다.
                                </p>
                            </div>
                        )}
                        
                        {errors.email && (
                            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>
                                {errors.email}
                            </p>
                        )}
                    </div>
                    
                    {/* 7. 성별 */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                            성별
                        </label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="M"
                                    checked={formData.gender === 'M'}
                                    onChange={handleChange}
                                    style={{ marginRight: '8px' }}
                                />
                                <span>남</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="F"
                                    checked={formData.gender === 'F'}
                                    onChange={handleChange}
                                    style={{ marginRight: '8px' }}
                                />
                                <span>여</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: loading ? '#9ca3af' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? '처리 중...' : '가입하기'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Join;