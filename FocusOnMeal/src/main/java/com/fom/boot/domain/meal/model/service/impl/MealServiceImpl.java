package com.fom.boot.domain.meal.model.service.impl;

import org.springframework.stereotype.Service;

import com.fom.boot.domain.meal.model.mapper.MealMapper;
import com.fom.boot.domain.meal.model.service.MealService;
import com.fom.boot.domain.meal.model.vo.MealPlan;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealServiceImpl implements MealService {

    private final MealMapper mealMapper;

    @Override
    public boolean saveMealPlan(MealPlan mealPlan) {
        try {
            int result = mealMapper.insertMealPlan(mealPlan);
            log.info("식단 저장 완료 - 회원ID: {}, 식단명: {}", mealPlan.getMemberId(), mealPlan.getPlanName());
            return result > 0;
        } catch (Exception e) {
            log.error("식단 저장 실패 - 회원ID: {}, 식단명: {}", mealPlan.getMemberId(), mealPlan.getPlanName(), e);
            return false;
        }
    }
}
