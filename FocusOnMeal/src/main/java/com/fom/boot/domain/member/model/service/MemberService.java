package com.fom.boot.domain.member.model.service;

import java.util.List;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member;

public interface MemberService {

	Member selectOneByLogin(LoginRequest member);

	int insertMember(Member member);

	// 관리자 목록 조회용
	List<Member> selectAllMembers();

	// 관리자 체크용
	Member findByMemberId(String memberId);
/*
	// 회원 등급 변경
	int updateAdminYn(String memberId, String adminYn);

	// 회원 상태 변경
	int updateStatusYn(String memberId, String statusYn);
*/
}
