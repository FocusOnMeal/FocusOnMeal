package com.fom.boot.app.member.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class LoginRequest {
	private String memberId;
	private String memberPw;
	private String memberNickname;
}
