package com.fom.boot.domain.member.model.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.mapper.MemberMapper;
import com.fom.boot.domain.member.model.service.MemberService;
import com.fom.boot.domain.member.model.vo.Member;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
	
	private final MemberMapper mapper;

	@Override
	public Member selectOneByLogin(LoginRequest member) {
		Member result = mapper.selectOneByLogin(member);
		return result;
	}

	@Override
	public int insertMember(Member member) {
		int result = mapper.insertMember(member);
		return result;
	}

	// 관리자 목록 조회용
	@Override
	public List<Member> selectAllMembers() {
		return mapper.selectAllMembers();
	}

	@Override
	public Member findByMemberId(String memberId) {
		return mapper.findByMemberId(memberId);
	}
/*
	// 회원 등급 변경
	@Override
	public int updateAdminYn(String memberId, String adminYn) {
		return mapper.updateAdminYn(memberId, adminYn);
		
	}

	// 회원 상태 변경
	@Override
	public int updateStatusYn(String memberId, String statusYn) {
		return mapper.updateStatusYn(memberId, statusYn);
		
	}
*/
}
