package com.fom.boot.domain.member.model.service.impl;

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

}
