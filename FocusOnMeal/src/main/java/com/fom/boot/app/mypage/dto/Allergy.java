package com.fom.boot.app.mypage.dto;

import lombok.Data;

@Data
public class Allergy {
	private Integer allergyId;
    private String allergyName;
    private String category;
}
