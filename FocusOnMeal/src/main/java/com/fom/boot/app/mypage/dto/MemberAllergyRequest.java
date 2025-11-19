package com.fom.boot.app.mypage.dto;

import java.util.List;
import lombok.Getter;

@Getter
public class MemberAllergyRequest {
	private String memberId;
    private List<Integer> allergyIds;
}
