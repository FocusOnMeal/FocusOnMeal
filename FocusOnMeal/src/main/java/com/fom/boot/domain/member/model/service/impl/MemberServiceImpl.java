package com.fom.boot.domain.member.model.service.impl;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.common.pagination.PageInfo;
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

    // 이메일 인증 코드 저장소 (메모리: 운영환경에서는 Redis 추천)
    private final ConcurrentHashMap<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

    // record를 사용 (Java 16+ 가정). 필드 접근은 data.code() 처럼 메서드 호출.
    private record VerificationData(String code, long expiryTime, boolean verified) {}

    // ===== 기존/기본 메서드 구현 =====
    @Override
    public Member selectOneByLogin(LoginRequest loginRequest) {
        return memberMapper.selectOneByLogin(loginRequest);
    }

    @Override
    public int insertMember(Member member) {
        return memberMapper.insertMember(member);
    }

    // ===== 추가 메서드 =====
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

    @Override
    public void saveVerificationCode(String email, String code) {
        long expiryTime = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5);
        verificationCodes.put(email, new VerificationData(code, expiryTime, false));
        log.info("인증 코드 저장: email={}, code={}", email, code);
        cleanupExpiredCodes();
    }

    @Override
    public boolean verifyEmailCode(String email, String code) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) {
            log.warn("인증 코드 없음: {}", email);
            return false;
        }
        if (System.currentTimeMillis() > data.expiryTime()) {
            log.warn("인증 코드 만료: {}", email);
            verificationCodes.remove(email);
            return false;
        }
        if (!data.code().equals(code)) {
            log.warn("인증 코드 불일치: {}, 입력={}", email, code);
            return false;
        }
        // 인증 완료 표시
        verificationCodes.put(email, new VerificationData(data.code(), data.expiryTime(), true));
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

    // ========== 비밀번호 재설정 관련(간단한 스텁) ==========
    @Override
    @Transactional
    public boolean sendPasswordResetLink(String memberId, String email, String ipAddress, String userAgent) throws Exception {
        // 실제 구현은 PasswordResetService에 위임하는 것이 좋음.
        return true;
    }

    @Override
    public boolean validatePasswordResetToken(String token) {
        return false;
    }

    @Override
    @Transactional
    public boolean resetPassword(String token, String newPassword) throws Exception {
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
	public List<Member> selectAllMembers(PageInfo pageInfo, String type, String keyword) {
		return memberMapper.selectAllMembers(
	            pageInfo.getStartRow(),
	            pageInfo.getEndRow(),
	            type,
	            keyword
	    );
	}

	@Override
	public Member findByMemberId(String memberId) {
		return memberMapper.findByMemberId(memberId);
	}
	
	// 회원 등급 변경
	@Override
	public int updateAdminYn(String memberId, String adminYn) {
		return memberMapper.updateAdminYn(memberId, adminYn);
		
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
}
