package com.fom.boot.app.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
	private String token;
	private String memberId;
	private String memberName;
	private String adminYn;
	private String memberNickname;
}
