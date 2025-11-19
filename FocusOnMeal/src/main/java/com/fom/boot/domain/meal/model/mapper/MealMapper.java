package com.fom.boot.domain.meal.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.fom.boot.domain.meal.model.vo.MealPlan;

@Mapper
public interface MealMapper {

    /**
     * 식단 저장
     * @param mealPlan 저장할 식단 정보
     * @return 저장된 행 수
     */
    int insertMealPlan(MealPlan mealPlan);
}
