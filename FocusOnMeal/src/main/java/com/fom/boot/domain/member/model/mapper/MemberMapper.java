package com.fom.boot.domain.member.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.fom.boot.app.member.dto.LoginRequest;
import com.fom.boot.domain.member.model.vo.Member;

@Mapper
public interface MemberMapper {

	Member selectOneByLogin(LoginRequest member);

}
