package com.fom.boot.domain.member.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member; // Member 모델 import

@Mapper
public interface MemberMapper {

	Member selectOneByLogin(LoginRequest member);
	
    /**
     * Spring Security 인증 시 사용할, ID로 회원 정보 조회
     * @param memberId (로그인 시도 ID)
     * @return Member (회원 정보)
     */
    Member findByMemberId(String memberId);

	int insertMember(Member member);
	
	// 관리자 목록 조회용
	List<Member> selectAllMembers();
	
	int updateAdminYn(String memberId, String adminYn);

	int updateStatusYn(String memberId, String statusYn);

	// package com.fom.boot.domain.member.model.mapper;
	// public interface MemberMapper { ... } 내부에 추가

	// 1. 회원 ID로 회원 정보 조회 (PasswordResetService.sendPasswordResetLink에서 사용)
	Member selectOneById(@Param("memberId") String memberId);

	// 2. 비밀번호 업데이트 (PasswordResetService.resetPassword에서 사용)
	int updateMemberPassword(@Param("memberId") String memberId, @Param("encodedPw") String encodedPw);

	// 3. 이름/이메일로 회원 ID 조회 (PasswordResetService.sendMemberIdByEmail에서 사용)
	String searchMemberId(@Param("memberName") String memberName, @Param("email") String email);

	int checkEmailExists(String email);
	
	

}

