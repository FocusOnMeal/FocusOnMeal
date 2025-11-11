package com.fom.boot.domain.member.model.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UserCustomIngredient {

    // 사용자 커스텀 식자재 등록
    private int customId; 			// 커스텀 식자재 아이디 (PK)
    private String memberId;		// 회원 아이디 (FK)
    private String customName;		// 커스텀 이름
    private int customPrice;		// 커스텀 가격
    private String customUnit;		// 지정 단위
}