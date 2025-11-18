package com.fom.boot.domain.member.model.service;

import java.util.List;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.common.pagination.PageInfo;
import com.fom.boot.domain.member.model.vo.Member;

public interface MemberService {
    Member selectOneByLogin(LoginRequest member);
    int insertMember(Member member);
    

    // 추가로 Controller에서 호출하는 메서드들
    Member selectOneById(String memberId);
    int updateMemberPassword(String memberId, String encodedPw);
    String searchMemberId(String memberName, String email);

    boolean checkMemberIdExists(String memberId);
    boolean checkEmailExists(String email);

    void saveVerificationCode(String email, String code);
    boolean verifyEmailCode(String email, String code);
    boolean isEmailVerified(String email);
    void deleteVerificationCode(String email);

    boolean sendPasswordResetLink(String memberId, String email, String ipAddress, String userAgent) throws Exception;
    boolean validatePasswordResetToken(String token);
    boolean resetPassword(String token, String newPassword) throws Exception;
    
    boolean sendMemberIdByEmail(String memberName, String email) throws Exception;
    boolean checkEmailExists(Object email);
   
    // 관리자 회원 조회
    List<Member> selectAllMembers(PageInfo pageInfo, String type ,String keyword);
    
	// 관리자 체크용
	Member findByMemberId(String memberId);

	// 회원 등급 변경
	int updateAdminYn(String memberId, String adminYn);

	// 회원 상태 변경
	int updateStatusYn(String memberId, String statusYn);
	
	// 총 회원 수 + 검색
	int getTotalMembersBySearch(String type, String keyword);
	
}
