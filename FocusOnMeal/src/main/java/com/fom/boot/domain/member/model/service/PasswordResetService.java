package com.fom.boot.domain.member.model.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fom.boot.common.util.TokenUtil;
import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.mapper.PasswordResetMapper;
import com.fom.boot.domain.member.model.vo.Member;
import com.fom.boot.domain.member.model.vo.PasswordResetToken;

import java.sql.Timestamp;

/**
 * 비밀번호 재설정 서비스
 * 
 * @author FocusOnMale Team
 * @since 2025-11-15
 */
@Slf4j
@Service
public class PasswordResetService {
    
    @Autowired
    private MemberMapper memberMapper;
    
    @Autowired
    private PasswordResetMapper passwordResetMapper;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private BCryptPasswordEncoder bcrypt;
    
    // Rate Limiting 설정
    private static final int MAX_REQUESTS_PER_MEMBER_24H = 5;  // 회원당 24시간 내 최대 5회
    private static final int MAX_REQUESTS_PER_IP_1H = 10;      // IP당 1시간 내 최대 10회
    
    /**
     * 비밀번호 재설정 링크 발송
     * 
     * @param memberId 회원 ID
     * @param email 이메일
     * @param ipAddress 요청 IP
     * @param userAgent 브라우저 정보
     * @return 성공 여부
     * @throws Exception 오류 발생 시
     */
    @Transactional
    public boolean sendPasswordResetLink(String memberId, String email, 
                                        String ipAddress, String userAgent) throws Exception {
        
        // 1. 회원 정보 확인
        Member member = memberMapper.selectOneById(memberId);
        if (member == null) {
            log.warn("비밀번호 재설정 실패: 존재하지 않는 회원 - memberId={}", memberId);
            throw new Exception("일치하는 회원 정보가 없습니다.");
        }
        
        if (!member.getEmail().equals(email)) {
            log.warn("비밀번호 재설정 실패: 이메일 불일치 - memberId={}, inputEmail={}", 
                    memberId, email);
            throw new Exception("일치하는 회원 정보가 없습니다.");
        }
        
        // 2. Rate Limiting 체크 (악용 방지)
        checkRateLimit(memberId, ipAddress);
        
        // 3. 기존 미사용 토큰 무효화
        int invalidatedCount = passwordResetMapper.updateInvalidateOldTokens(memberId);
        if (invalidatedCount > 0) {
            log.info("기존 토큰 무효화: memberId={}, count={}", memberId, invalidatedCount);
        }
        
        // 4. 새 토큰 생성
        String token = TokenUtil.generatePasswordResetToken();
        Timestamp expireDate = TokenUtil.getDefaultTokenExpiryTime(); // 1시간 후
        
        // 5. 토큰 정보 저장
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setMemberId(memberId);
        resetToken.setToken(token);
        resetToken.setExpireDate(expireDate);
        resetToken.setIpAddress(ipAddress);
        resetToken.setUserAgent(userAgent);
        
        int result = passwordResetMapper.insertPasswordResetToken(resetToken);
        
        if (result <= 0) {
            log.error("토큰 저장 실패: memberId={}", memberId);
            throw new Exception("토큰 생성에 실패했습니다.");
        }
        
        // 6. 이메일 발송
        try {
            emailService.sendPasswordResetEmail(email, memberId, token);
            log.info("비밀번호 재설정 링크 발송 성공: memberId={}, email={}, ip={}", 
                    memberId, email, ipAddress);
            return true;
            
        } catch (Exception e) {
            log.error("이메일 발송 실패: memberId={}, error={}", memberId, e.getMessage());
            throw new Exception("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
    
    /**
     * Rate Limiting 체크
     * 
     * @param memberId 회원 ID
     * @param ipAddress IP 주소
     * @throws Exception 제한 초과 시
     */
    private void checkRateLimit(String memberId, String ipAddress) throws Exception {
        // 회원별 24시간 내 요청 횟수 체크
        int memberRequestCount = passwordResetMapper.countTokenRequestsByMemberId(memberId, 24);
        if (memberRequestCount >= MAX_REQUESTS_PER_MEMBER_24H) {
            log.warn("비밀번호 재설정 요청 제한 초과 (회원): memberId={}, count={}", 
                    memberId, memberRequestCount);
            throw new Exception("24시간 내 비밀번호 재설정 요청 횟수를 초과했습니다. 나중에 다시 시도해주세요.");
        }
        
        // IP별 1시간 내 요청 횟수 체크
        int ipRequestCount = passwordResetMapper.countTokenRequestsByIp(ipAddress, 1);
        if (ipRequestCount >= MAX_REQUESTS_PER_IP_1H) {
            log.warn("비밀번호 재설정 요청 제한 초과 (IP): ip={}, count={}", 
                    ipAddress, ipRequestCount);
            throw new Exception("잠시 후 다시 시도해주세요.");
        }
    }
    
    /**
     * 토큰 유효성 검증
     * 
     * @param token 토큰 문자열
     * @return 유효하면 true, 아니면 false
     */
    public boolean validateToken(String token) {
        try {
            int count = passwordResetMapper.countValidToken(token);
            boolean isValid = count > 0;
            
            if (!isValid) {
                log.warn("유효하지 않은 토큰: token={}", TokenUtil.maskToken(token));
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("토큰 검증 오류: error={}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 토큰으로 회원 ID 조회
     * 
     * @param token 토큰 문자열
     * @return 회원 ID 또는 null
     */
    public String getMemberIdByToken(String token) {
        try {
            return passwordResetMapper.selectMemberIdByToken(token);
        } catch (Exception e) {
            log.error("토큰으로 회원 ID 조회 실패: error={}", e.getMessage());
            return null;
        }
    }
    
    /**
     * 비밀번호 재설정 (토큰 사용)
     * 
     * @param token 토큰 문자열
     * @param newPassword 새 비밀번호 (평문)
     * @return 성공 여부
     * @throws Exception 오류 발생 시
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) throws Exception {
        
        // 1. 토큰 유효성 검증
        if (!validateToken(token)) {
            log.warn("비밀번호 재설정 실패: 유효하지 않은 토큰");
            throw new Exception("유효하지 않거나 만료된 링크입니다.");
        }
        
        // 2. 토큰으로 회원 ID 조회
        String memberId = getMemberIdByToken(token);
        if (memberId == null) {
            log.error("비밀번호 재설정 실패: 회원 ID 조회 불가");
            throw new Exception("유효하지 않은 토큰입니다.");
        }
        
        // 3. 비밀번호 암호화
        String encodedPassword = bcrypt.encode(newPassword);
        
        // 4. 비밀번호 업데이트
        int updateResult = memberMapper.updateMemberPassword(memberId, encodedPassword);
        
        if (updateResult <= 0) {
            log.error("비밀번호 업데이트 실패: memberId={}", memberId);
            throw new Exception("비밀번호 변경에 실패했습니다.");
        }
        
        // 5. 토큰 사용 처리 (재사용 방지)
        int tokenResult = passwordResetMapper.updateTokenAsUsed(token);
        
        if (tokenResult <= 0) {
            log.warn("토큰 사용 처리 실패: token={}", TokenUtil.maskToken(token));
        }
        
        log.info("비밀번호 재설정 성공: memberId={}", memberId);
        return true;
    }
    
    /**
     * 아이디 찾기 및 이메일 발송
     * 
     * @param memberName 회원 이름
     * @param email 이메일
     * @return 성공 여부
     * @throws Exception 오류 발생 시
     */
    public boolean sendMemberIdByEmail(String memberName, String email) throws Exception {
        
        // 1. 회원 정보 조회
        String memberId = memberMapper.searchMemberId(memberName, email);
        
        if (memberId == null) {
            log.warn("아이디 찾기 실패: 일치하는 회원 없음 - name={}, email={}", 
                    memberName, email);
            throw new Exception("일치하는 회원 정보가 없습니다.");
        }
        
        // 2. 이메일로 아이디 발송
        try {
            emailService.sendMemberIdEmail(email, memberName, memberId);
            log.info("아이디 찾기 이메일 발송 성공: name={}, email={}", memberName, email);
            return true;
            
        } catch (Exception e) {
            log.error("아이디 찾기 이메일 발송 실패: error={}", e.getMessage());
            throw new Exception("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }
}

/**
 * MemberMapper에 추가해야 할 메서드들:
 * 
 * // 회원 조회
 * Member selectOneById(String memberId);
 * 
 * // 비밀번호 업데이트
 * int updateMemberPassword(@Param("memberId") String memberId, 
 *                         @Param("encodedPw") String encodedPw);
 * 
 * // 아이디 찾기
 * String searchMemberId(@Param("memberName") String memberName, 
 *                      @Param("email") String email);
 */
