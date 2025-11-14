import React, { useState, useEffect } from 'react';
// import './JoinForm.css'; // 실제 프로젝트에서는 이 경로를 사용해 CSS 파일을 연결합니다.

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
    const [selectedDomain, setSelectedDomain] = useState(emailDomains[0]);
    // 자동 생성된 닉네임은 상태로만 관리하고, UI에 표시하지 않습니다.
    const [generatedNickname, setGeneratedNickname] = useState(''); 
    
    // 이메일 도메인 직접 입력 플래그
    const isCustomDomain = selectedDomain === "직접입력";

    // --- 닉네임 생성에 필요한 상수 목록 (유저 & 관리자 공용) ---
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

    // 동물 (일반 사용자 전용)
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

    // 접미사 (일반 사용자 전용)
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

    // 관리자 닉네임 전용 접두사
    const adminPrefixes = [
        // 권위있는
        '전지전능한', '위대한', '최고의', '절대적인', '신성한', '강력한',
        '카리스마있는', '막강한', '무적의', '지혜로운',
        // 추가 - 능력
        '전능한', '만능의', '천재적인', '초월적인', '궁극의', '최강의',
        '압도적인', '독보적인', '완벽한', '무결점의', '완전무결한',
        // 추가 - 품격
        '고귀한', '숭고한', '존엄한', '위엄있는', '장엄한', '찬란한',
        '빛나는', '영광스러운', '위대하신', '존귀하신',
        // 추가 - 카리스마
        '압도하는', '통솔하는', '이끄는', '군림하는', '지배하는',
        '총괄하는', '관장하는', '주관하는', '감독하는',
        // 추가 - 특별함
        '전설의', '신화의', '전무후무한', '유일무이한', '독보적인',
        '초월한', '차원이다른', '범접불가한', '경외스러운',
        // 추가 - 긍정적
        '친절한', '자비로운', '인자한', '온화한', '다정한',
        '배려심깊은', '섬세한', '세심한', '따뜻한', '포근한'
    ];

    // 관리자 닉네임 전용 접미사 (추후 관리자/수정 페이지에서 사용)
    const adminSuffixes = [
        // 기본 관리자
        '관리자', '관리자님', '운영자', '마스터', '매니저', '총관리자',
        '슈퍼관리자', '시스템관리자', '최고관리자',
        // 추가 - 직책
        '총책임자', '총괄책임자', '총지배인', '총수', '총재',
        '대표', '회장', '사장', '이사장', '의장', '국장',
        // 추가 - 최고
        '최고운영자', '최고책임자', '슈퍼바이저', '디렉터', '치프',
        '프로듀서', '크리에이터', '아키텍트',
        // 추가 - 권한
        '어드민', '루트', '슈퍼유저', '오너', '호스트',
        'GM', 'OP', '모더레이터', '가디언',
        // 추가 - 귀여운 버전
        '님', '냥', '쨩', '왕님', '여왕님', '대인',
        '각하', '전하', '폐하', '성하'
    ];
    // -----------------------------------------------------------------

    /**
     * 문자열의 바이트 길이를 계산합니다. (한글 1글자는 3바이트로 가정)
     * @param {string} str - 입력 문자열
     * @returns {number} 바이트 길이
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
     * 일반 사용자 랜덤 닉네임을 생성합니다.
     * @returns {string} 생성된 닉네임
     */
    const generateUserNickname = () => {
        let nickname;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            const type = Math.floor(Math.random() * 4);
            
            // 닉네임 조합 패턴 (0: 형용사+동물, 1: 동물+접미사, 2: 형용사+동물+접미사, 3: 형용사+접미사)
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
            }

            
            attempts++;
        } while (
            // 길이 제한: 문자열 길이 12자 이하 또는 바이트 길이 40 이하
            (nickname.length > 12 || getByteLength(nickname) > 40) && 
            attempts < maxAttempts
        );

        return nickname;
    };

    /**
     * **[관리자 페이지 전용 유틸리티 함수]**
     * 이 함수는 회원가입(Join) 페이지에서는 호출되지 않습니다.
     * * 용도: 관리자가 기존 사용자에게 관리자 권한을 부여할 때,
     * 해당 사용자의 닉네임을 관리자용 조합으로 변경하기 위해
     * **별도의 관리자 페이지에서** 호출되어야 합니다.
     * * @param {string} originalNickname - 기존 사용자 닉네임 (현재는 사용하지 않음)
     * @returns {string} 조합된 "접두사_접미사" 형태의 관리자 닉네임
     */
    const generateAdminNickname = (originalNickname) => {
        const prefix = adminPrefixes[Math.floor(Math.random() * adminPrefixes.length)];
        const suffix = adminSuffixes[Math.floor(Math.random() * adminSuffixes.length)];
        
        // 새로운 관리자 전용 닉네임 생성 (Prefix + Suffix)
        return `${prefix}_${suffix}`;
    };

    // 초기 닉네임 생성 (페이지 로드 시)
    useEffect(() => {
        // 이 부분은 오직 회원가입 시에만 실행됩니다.
        const nickname = generateUserNickname();
        setGeneratedNickname(nickname);
    }, []);

    // 폼 제출 처리
    const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // 이메일 조합
    const emailId = formData.get("emailId");
    const emailDomain =
    selectedDomain === "직접입력"
        ? formData.get("emailDomain")
        : selectedDomain;
    const email = `${emailId}@${emailDomain}`;

    const memberData = {
    memberId: formData.get("memberId"),
    memberPw: formData.get("memberPw"),
    memberName: formData.get("memberName"),
    memberNickname: generatedNickname,
    email: email,
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    adminYn: "N",
    };

    try {
    const response = await fetch("http://localhost:8080/member/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberData),
    });

    if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        window.location.href = "/member/login";
    } else {
        const msg = await response.text();
        alert("회원가입 실패: " + msg);
    }
    } catch (err) {
    alert("서버 오류: " + err.message);
    }
};

    return (
        <div id="signup-container">
            <div className="signup-wrapper">
                
                {/* 제목 섹션 */}
                <div className="signup-title text-center mb-6">
                    <h2 className="title-text">회원가입</h2>
                </div>
                
                {/* 닉네임 미리보기 섹션 제거됨 */}
                
                {/* 폼 시작 */}
                <form onSubmit={handleSubmit} className="signup-form" method="post">
                    
                    {/* Hidden 닉네임 필드 (서버 전송용 - UI에 표시하지 않아도 값은 전송됨) */}
                    <input type="hidden" name="memberNickname" value={generatedNickname} />
                    
                    {/* 1. 아이디 */}
                    <div className="form-group">
                        <label className="required form-label" htmlFor="memberId">아이디</label>
                        <input 
                            type="text" 
                            id="memberId" 
                            name="memberId" 
                            placeholder="아이디를 입력해주세요." 
                            required 
                            className="form-input"
                        />
                    </div>
                    
                    {/* 2. 비밀번호 */}
                    <div className="form-group">
                        <label className="required form-label" htmlFor="memberPw">비밀번호</label>
                        <input 
                            type="password" 
                            id="memberPw" 
                            name="memberPw" 
                            placeholder="비밀번호를 입력해주세요." 
                            required 
                            className="form-input"
                        />
                    </div>
                    
                    {/* 3. 이름 */}
                    <div className="form-group">
                        <label className="required form-label" htmlFor="memberName">이름</label>
                        <input 
                            type="text" 
                            id="memberName" 
                            name="memberName" 
                            placeholder="이름을 입력해주세요." 
                            required 
                            className="form-input"
                        />
                    </div>
                    
                    {/* 4. 전화번호 */}
                    <div className="form-group">
                        <label className="required form-label" htmlFor="phone">전화번호</label>
                        <input 
                            type="text" 
                            id="phone" 
                            name="phone" 
                            placeholder="전화번호를 입력해주세요." 
                            required 
                            className="form-input"
                        />
                    </div>
                    
                    {/* 5. 이메일 */}
                    <div className="form-group email-group">
                        <label className="required form-label" htmlFor="emailId">이메일</label>
                        <div className="email-input-group">
                            <input 
                                type="text" 
                                id="emailId" 
                                name="emailId" 
                                required 
                                className="form-input email-id-input"
                            />
                            <span className="separator">@</span>
                            
                            <select 
                                name="emailDomainSelect" 
                                onChange={(e) => setSelectedDomain(e.target.value)}
                                value={selectedDomain}
                                className="form-select email-select"
                            >
                                {emailDomains.map((domain, index) => (
                                    <option key={index} value={domain}>
                                        {domain}
                                    </option>
                                ))}
                            </select>

                            {isCustomDomain && (
                                <input 
                                    type="text" 
                                    name="emailDomain" 
                                    placeholder="직접 입력" 
                                    required 
                                    className="form-input custom-domain-input"
                                />
                            )}
                        </div>
                    </div>

                    {/* 6. 성별 */}
                    <div className="form-group gender-group">
                        <span className="form-label gender-label">성별</span>
                        <div className="gender-options">
                            <label className="radio-label">
                                <input type="radio" name="gender" value="M" defaultChecked className="radio-input" />
                                <span className="radio-text">남</span>
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="gender" value="F" className="radio-input" />
                                <span className="radio-text">여</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* 제출 버튼 */}
                    <button 
                        type="submit" 
                        className="signup-button"
                    >
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Join;