package com.fom.boot.domain.member.model.service.impl;

import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.nio.charset.StandardCharsets;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.app.mypage.dto.ProfileResponse;
import com.fom.boot.app.mypage.dto.ProfileUpdateRequest;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.common.util.NicknameUtils;
import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.service.EmailService;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder bcrypt;

    // 이메일 인증 코드 저장소
    private final ConcurrentHashMap<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    private record VerificationData(String code, long expiryTime, boolean verified) {}

    // 기본 기능
    @Override
    public Member selectOneByLogin(LoginRequest loginRequest) {
        return memberMapper.selectOneByLogin(loginRequest);
    }

    @Override
    public int insertMember(Member member) {
        return memberMapper.insertMember(member);
    }

    @Override
    public Member selectOneById(String memberId) {
        return memberMapper.selectOneById(memberId);
    }

    @Override
    public int updateMemberPassword(String memberId, String encodedPw) {
        return memberMapper.updateMemberPassword(memberId, encodedPw);
    }

    @Override
    public String searchMemberId(String memberName, String email) {
        return memberMapper.searchMemberId(memberName, email);
    }

    @Override
    public boolean checkMemberIdExists(String memberId) {
        return memberMapper.selectOneById(memberId) != null;
    }

    @Override
    public boolean checkEmailExists(String email) {
        return memberMapper.checkEmailExists(email) > 0;
    }

    // 이메일 인증 코드 저장
    @Override
    public void saveVerificationCode(String email, String code) {
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5);
        verificationCodes.put(email, new VerificationData(code, expiryTime, false));
        cleanupExpiredCodes();
    }

    // 인증 코드 확인
    @Override
    public boolean verifyEmailCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) return false;
        if (System.currentTimeMillis() > data.expiryTime()) {
            verificationCodes.remove(email);
            return false;
        }
        if (!data.code().equals(code)) return false;

        verificationCodes.put(email, new VerificationData(code, data.expiryTime(), true));
        return true;
    }

    @Override
    public boolean isEmailVerified(String email) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) return false;
        if (System.currentTimeMillis() > data.expiryTime()) {
            verificationCodes.remove(email);
            return false;
        }
        return data.verified();
    }

    @Override
    public void deleteVerificationCode(String email) {
        verificationCodes.remove(email);
    }

    private void cleanupExpiredCodes() {
        long now = System.currentTimeMillis();
        verificationCodes.entrySet().removeIf(e -> e.getValue().expiryTime() < now);
    }


    // 비밀번호 재설정 (실제 구현 X)
    @Override
    @Transactional
    public boolean sendPasswordResetLink(String memberId, String email, String ipAddress, String userAgent) {
        return true;
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        return false;
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        return true;
    }

    @Override
    public boolean sendMemberIdByEmail(String memberName, String email) throws Exception {
        String memberId = memberMapper.searchMemberId(memberName, email);
        if (memberId == null) {
            throw new Exception("일치하는 회원 정보가 없습니다.");
        }
        emailService.sendMemberIdEmail(email, memberName, memberId);
        return true;
    }

	@Override
	public boolean checkEmailExists(Object email) {
		// TODO Auto-generated method stub
		return false;
	}


	// 관리자 목록 조회용
	@Override
	public List<Member> selectAllMembers(PageInfo pageInfo, String type, String keyword, String sortColumn, String sortOrder) {
		return memberMapper.selectAllMembers(
	            pageInfo.getStartRow(),
	            pageInfo.getEndRow(),
	            type,
	            keyword,
	            sortColumn,
	            sortOrder
	    );
	}

	@Override
	public Member findByMemberId(String memberId) {
		return memberMapper.findByMemberId(memberId);
	}
	
	// 회원 등급 및 닉네임 변경
	@Override
	@Transactional
	public String updateAdminYn(String memberId, String adminYn) {
		
		// 등급에 따른 닉네임 변경
	    String newNickname;
	    if ("Y".equals(adminYn)) {
	        newNickname = NicknameUtils.generateAdminNickname(); 
	    } else {
	        newNickname = NicknameUtils.generateUserNickname();
	    }
	    
	    // 2. DB 업데이트를 위한 Member 객체 준비
        Member member = new Member();
        member.setMemberId(memberId);
        member.setAdminYn(adminYn);
        member.setMemberNickname(newNickname);

        // 3. DB에 등급과 닉네임 모두 반영
        int result = memberMapper.updateAdminNickname(member);

        if (result > 0) {
            // 4. 업데이트된 닉네임만 프론트엔드로 반환
            return newNickname;
        } else {
            // 업데이트 실패 시 예외 처리
            throw new RuntimeException("회원 등급 및 닉네임 업데이트에 실패했습니다.");
        }
    }
		
	// 회원 상태 변경
	@Override
	public int updateStatusYn(String memberId, String statusYn) {
		return memberMapper.updateStatusYn(memberId, statusYn);
	}

	// 총 회원수 + 검색
	@Override
	public int getTotalMembersBySearch(String type, String keyword) {
		return memberMapper.getTotalMembersBySearch(type, keyword);
	}

	// 랜덤 닉네임
	@Override
	public String generateRandomNickname() {
		List<String> adjectives = Arrays.asList(
		        // 따뜻한 느낌
		        "따뜻한", "포근한", "아늑한", "부드러운", "온화한", "달콤한", "다정한", 
		        "상냥한", "사랑스러운", "평온한", "편안한", "순한", "잔잔한", "포근포근한", 
		        "다정다감한", "포용하는",
		        // 신비한 느낌
		        "신비한", "몽환적인", "꿈같은", "환상적인", "은은한", "비밀스러운", 
		        "신성한", "신묘한", "불가사의한", "고요한", "청아한", "미묘한", "성스러운", 
		        "빛나는", "어스름한",
		        // 강한 느낌
		        "강한", "거친", "냉정한", "차가운", "뜨거운", "잔혹한", "무자비한", 
		        "단단한", "날카로운", "사나운", "불타는", "강렬한", "냉혹한", "독한", 
		        "강직한", "용감한",
		        // 귀여운 느낌
		        "귀여운", "깜찍한", "발랄한", "사랑스러운", "상큼한", "톡톡한", 
		        "앙증맞은", "엉뚱한", "유쾌한", "명랑한", "엉망진창한", "허당한", 
		        "엉뚱발랄한",
		        // 색상/자연
		        "푸른", "맑은", "투명한", "하얀", "붉은", "노란", "은빛의", "금빛의", 
		        "별빛의", "달빛의", "바람의", "하늘의", "빗방울의", "잎새의", "꽃잎의", 
		        "햇살의", "새벽의", "노을의", "바다의", "구름의",
		        // 어두운 느낌
		        "어두운", "서늘한", "쓸쓸한", "고독한", "슬픈", "공허한", "차분한", 
		        "조용한", "담담한", "외로운", "냉한", "시린", "무심한", "깊은",
		        // 추가 형용사
		        "활기찬", "생동감있는", "역동적인", "우아한", "고상한", "화려한", 
		        "찬란한", "영롱한", "반짝이는", "영원한", "불멸의", "전설적인",
		        "신비로운", "매혹적인", "황홀한", "경이로운", "놀라운", "경쾌한",
		        "민첩한", "재빠른", "영리한", "현명한", "슬기로운", "총명한"
		    );

		    // 동물
		    List<String> animals = Arrays.asList(
		        // 귀여운 동물
		        "강아지", "고양이", "토끼", "햄스터", "다람쥐", "펭귄", "코알라", "판다", 
		        "곰", "수달", "너구리", "고슴도치", "아기새", "병아리", "참새", "돌고래", 
		        "물개", "인형곰", "미어캣", "사슴",
		        // 강한 동물
		        "늑대", "호랑이", "사자", "독수리", "매", "용", "뱀", "여우", "하이에나", 
		        "표범", "재규어", "곰표범", "검은까마귀", "불사조", "드래곤", "독사", 
		        "하늘매", "이리", "늑대왕",
		        // 신화 동물
		        "유니콘", "그리핀", "페가수스", "피닉스", "크라켄", "키메라", "인어", 
		        "요정새", "천마", "백호", "흑룡", "청룡", "봉황", "현무", "주작", 
		        "백조", "까마귀", "올빼미", "부엉이", "고래",
		        // 기타 동물
		        "개구리", "오리", "돼지", "닭", "소", "염소", "코끼리", "하마", 
		        "원숭이", "고릴라", "두더지", "악어", "참치", "문어", "오징어", 
		        "새우", "개복치", "거북이",
		        // 자연 동물
		        "나비", "새", "물고기", "비둘기", "벌", "풍뎅이", "제비", 
		        "하늘새", "꿀벌", "수국나비", "해파리",
		        // 추가 동물
		        "알파카", "라마", "카피바라", "퀴카", "레서판다", "페럿", "친칠라",
		        "앵무새", "카나리아", "공작", "학", "두루미", "기린", "얼룩말",
		        "캥거루", "코뿔소", "하마", "멧돼지", "산양", "오소리", "스라소니",
		        "치타", "퓨마", "팬더", "북극곰", "반달곰", "물범", "바다표범",
		        "상어", "가오리", "연어", "고등어", "꽁치", "복어", "가재", "랍스터",
		        "도마뱀", "카멜레온", "이구아나", "코브라", "비단뱀"
		    );

		    // 접미사
		    List<String> suffixes = Arrays.asList(
		        // 판타지
		        "왕", "여왕", "왕자", "공주", "요정", "천사", "악마", "마왕", "드래곤", 
		        "기사", "정령", "선녀", "요왕", "요기", "소환사", "마법사", "위자드", 
		        "궁수", "검사", "성녀", "수호자", "빛", "어둠", "그림자", "별빛", "달빛", 
		        "하늘", "꿈", "운명", "신", "영혼", "소울",
		        // 직업/호칭
		        "선생", "박사", "장인", "마스터", "덕후", "중독자", "요원", "대장", 
		        "팀장", "보스", "킹", "퀸", "맨", "봇", "로봇", "머신", "캐릭", 
		        "괴인", "전사", "도사", "도련님", "지박령", "버서커",
		        // 자연
		        "꽃", "나무", "숲", "새벽", "구름", "바람", "물결", "불꽃", "별", 
		        "달", "해", "눈꽃", "서리", "봄", "여름", "가을", "겨울", "비", 
		        "노을", "파도", "바다", "산", "들꽃", "강", "모래", "새", 
		        "햇살", "미소", "노래", "향기",
		        // 추가 접미사
		        "영웅", "용사", "전설", "신화", "제왕", "황제", "황후", "폐하",
		        "각하", "나리", "도령", "낭자", "소저", "공자", "영애",
		        "샘", "쌤", "선배", "후배", "친구", "동료", "벗", "동지",
		        "하트", "스타", "문", "선", "검", "방패", "창", "활",
		        "불", "물", "땅", "돌", "나뭇잎", "씨앗", "뿌리", "가지",
		        "은하", "우주", "세계", "차원", "시공", "영역", "성역", "낙원",
		        "무한", "영원", "찰나", "순간", "시간", "공간",
		        // 번호
		        "1호", "2호", "3호", "4호", "5호", "6호", "7호", "8호", 
		        "9호", "10호", "11호", "12호", "13호", "14호", "15호", "16호",
		        "17호", "18호", "19호", "20호", "21호", "22호", "23호", "100호"
		    );

		    Random random = new Random();
		    
		    // 50바이트 제한을 고려해서 닉네임 생성
		    String nickname;
		    int maxAttempts = 100;
		    int attempts = 0;
		    
		    do {
		        String adjective = adjectives.get(random.nextInt(adjectives.size()));
		        String animal = animals.get(random.nextInt(animals.size()));
		        String suffix = suffixes.get(random.nextInt(suffixes.size()));
		        
		        nickname = adjective + animal + suffix;
		        attempts++;
		        
		        // 50바이트 이하인지 확인 (한글 1글자 = 3바이트)
		        int byteLength = nickname.getBytes(StandardCharsets.UTF_8).length;
		        
		        if (byteLength <= 50) {
		            break;
		        }
		        
		        if (attempts >= maxAttempts) {
		            // 최대 시도 횟수 초과 시 짧은 조합 사용
		            nickname = adjective + animal;
		            break;
		        }
		    } while (true);
		    
		    log.info("생성된 랜덤 닉네임: {}", nickname);
		    return nickname;
		}

	@Override
	@Transactional(readOnly = true)
    public ProfileResponse getUserProfile(String memberId) {
        Member member = memberMapper.selectOneById(memberId);
        
        if (member == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        return ProfileResponse.builder()
                .memberId(member.getMemberId())
                .nickname(member.getMemberNickname())
                .phone(member.getPhone())
                .build();
    }

	@Override
	@Transactional
    public void updateProfile(String memberId, ProfileUpdateRequest request) {
        Member member = memberMapper.selectOneById(memberId);
        
        if (member == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 닉네임 수정
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            member.setMemberNickname(request.getNickname());
        }

        // 휴대폰 번호 수정
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            // 전화번호 형식 검증
            if (!request.getPhone().matches("^010-\\d{4}-\\d{4}$")) {
                throw new IllegalArgumentException("올바른 전화번호 형식이 아닙니다.");
            }
            member.setPhone(request.getPhone());
        }

        // 비밀번호 변경 (선택적)
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            // 기존 비밀번호 확인
            if (!bcrypt.matches(request.getCurrentPassword(), member.getMemberPw())) {
                throw new IllegalArgumentException("기존 비밀번호가 일치하지 않습니다.");
            }

            // 새 비밀번호 검증
            if (request.getNewPassword() == null || request.getNewPassword().isEmpty()) {
                throw new IllegalArgumentException("새 비밀번호를 입력해주세요.");
            }

            // 비밀번호 정규식 검증 (영문, 숫자, 특수문자 포함 8자 이상)
            String passwordPattern = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$";
            if (!request.getNewPassword().matches(passwordPattern)) {
                throw new IllegalArgumentException("비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.");
            }

            // 새 비밀번호 암호화 후 저장
            member.setMemberPw(bcrypt.encode(request.getNewPassword()));
        }

        // DB 업데이트
        int result = memberMapper.updateProfile(member);
        
        if (result == 0) {
            throw new RuntimeException("프로필 수정에 실패했습니다.");
        }
        
        log.info("프로필 수정 완료: memberId={}", memberId);
    }

	@Override
	@Transactional
	public boolean deleteMember(String memberId, String password) {
	    // 1. 회원 정보 조회
	    Member member = memberMapper.selectOneById(memberId);
	    
	    if (member == null) {
	        throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
	    }

	    // 2. 비밀번호 확인
	    if (!bcrypt.matches(password, member.getMemberPw())) {
	        return false;
	    }

	    // 3. 관련 데이터 삭제 (CASCADE 설정이 안 되어 있는 경우)
	    // 알레르기 정보 삭제
	    memberMapper.deleteUserAllergies(memberId);
	    
	    // 식단 삭제
	    memberMapper.deleteUserMealPlans(memberId);
	    
	    // 찜한 식재료 삭제
	    memberMapper.deleteUserFavorites(memberId);
	    
	    // 4. 회원 삭제
	    int result = memberMapper.deleteMember(memberId);
	    
	    log.info("회원 탈퇴 완료: memberId={}", memberId);
	    return result > 0;
	}

}
