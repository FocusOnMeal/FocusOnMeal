package com.fom.boot.app.meal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("meal")
public class MealController {

    @GetMapping("mealAI")
    public String Meal(){
        return "meal/mealPlan";
    }
}
