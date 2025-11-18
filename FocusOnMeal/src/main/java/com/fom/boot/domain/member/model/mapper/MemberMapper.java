package com.fom.boot.domain.member.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member;

@Mapper
public interface MemberMapper {

    Member selectOneByLogin(LoginRequest member);

    Member findByMemberId(@Param("memberId") String memberId);

	int insertMember(Member member);
	

    List<Member> selectAllMembers();


    Member selectOneById(@Param("memberId") String memberId);

    int updateMemberPassword(@Param("memberId") String memberId,
                             @Param("encodedPw") String encodedPw);

    int checkEmailExists(String email);

	// 관리자 목록 조회용
	List<Member> selectAllMembers(
			@Param("startRow") int startRow,
			@Param("endRow") int endRow,
			@Param("type") String type,
			@Param("keyword") String keyword,
			@Param("sortColumn") String sortColumn,
			@Param("sortOrder") String sortOrder
			);
	
	// 관리자 : 회원 등급 변경
	int updateAdminYn(String memberId, String adminYn);
	
	// 관리자 : 회원 상태 변경
	int updateStatusYn(String memberId, String statusYn);
	
	// 관리자 : 총 회원 수
	int getTotalMembersBySearch(
	        @Param("type") String type,
	        @Param("keyword") String keyword
	);

    String searchMemberId(@Param("memberName") String memberName,
                          @Param("email") String email);

}
