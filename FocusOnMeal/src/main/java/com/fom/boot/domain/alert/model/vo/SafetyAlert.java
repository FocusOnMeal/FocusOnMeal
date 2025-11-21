package com.fom.boot.domain.alert.model.vo;

import java.sql.Timestamp;
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
public class SafetyAlert {

    private int alertId;          		// ALERT_ID(공표 정보 ID)
    private int ingredientId;     		// INGREDIENT_ID(관련 표준 식자재 ID)
    private String nation;        	  	// NATION(위험 공표 국가)
    private String hazardType;      	// HAZARD_TYPE(위험 유형)
    private String title;           	// TITLE(상세 공표 제목)
    private String description;     	// DESCRIPTION(상세 공표 내용)
    private Timestamp publicationDate; 	// PUBLICATION_DATE(공표된 날짜)
    private String originalUrl;			// ORIGINAL_URL(오리지널 링크)
}
