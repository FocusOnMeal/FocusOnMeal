package com.fom.boot.domain.member.model.service;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member;

public interface MemberService {

	Member selectOneByLogin(LoginRequest member);

	int insertMember(Member member);

}
