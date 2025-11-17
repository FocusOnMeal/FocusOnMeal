package com.fom.boot.domain.member.model.service.impl;

import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.service.EmailService;
import com.fom.boot.domain.member.model.vo.Member;
import com.fom.boot.app.member.dto.LoginRequest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

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

    // 관리자 기능
    @Override
    public List<Member> selectAllMembers() {
        return memberMapper.selectAllMembers();
    }

    @Override
    public Member findByMemberId(String memberId) {
        return memberMapper.findByMemberId(memberId);
    }

    @Override
    public int updateAdminYn(String memberId, String adminYn) {
        return memberMapper.updateAdminYn(memberId, adminYn);
    }

    @Override
    public int updateStatusYn(String memberId, String statusYn) {
        return memberMapper.updateStatusYn(memberId, statusYn);
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
}
