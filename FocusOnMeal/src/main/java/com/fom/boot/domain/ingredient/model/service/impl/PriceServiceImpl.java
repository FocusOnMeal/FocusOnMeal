package com.fom.boot.domain.ingredient.model.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.fom.boot.domain.ingredient.model.mapper.PriceHistoryMapper;
import com.fom.boot.domain.ingredient.model.service.PriceService;
import com.fom.boot.domain.ingredient.model.vo.PriceHistory;
import com.fom.boot.domain.meal.model.service.SeoulPriceApiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 식자재 가격 조회 서비스 구현
 * 다층 Fallback 전략: DB 조회 → 서울시 API → 기본 가격 상수
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements PriceService {

	private final PriceHistoryMapper priceHistoryMapper;

	@Autowired
	@Lazy
	private SeoulPriceApiService seoulPriceApiService;

	/**
	 * 기본 가격 상수 (원/kg)
	 * API와 DB 조회 실패 시 사용되는 Fallback 가격
	 */
	private static final Map<String, Integer> DEFAULT_PRICES = new HashMap<>() {{
		// 곡류 (100 카테고리)
		put("쌀", 3500);
		put("찹쌀", 4500);
		put("현미", 3800);
		put("보리쌀", 3000);
		put("콩", 8000);
		put("팥", 9000);
		put("녹두", 12000);

		// 채소류 (200 카테고리)
		put("배추", 2000);
		put("양배추", 1500);
		put("시금치", 5000);
		put("상추", 8000);
		put("깻잎", 15000);
		put("무", 1200);
		put("당근", 2500);
		put("양파", 1500);
		put("대파", 3000);
		put("마늘", 8000);
		put("생강", 12000);
		put("고추", 15000);
		put("청양고추", 18000);
		put("피망", 6000);
		put("파프리카", 7000);
		put("브로콜리", 5000);
		put("오이", 3000);
		put("호박", 2500);
		put("애호박", 3000);
		put("가지", 4000);
		put("토마토", 5000);
		put("방울토마토", 8000);
		put("감자", 2500);
		put("고구마", 3000);

		// 과일류 (300 카테고리)
		put("사과", 5000);
		put("배", 6000);
		put("감", 4000);
		put("귤", 4500);
		put("오렌지", 5000);
		put("바나나", 3000);
		put("포도", 8000);
		put("수박", 2000);
		put("참외", 3500);
		put("딸기", 15000);
		put("복숭아", 7000);
		put("자두", 6000);
		put("키위", 8000);

		// 축산물 (400 카테고리)
		put("쇠고기", 40000);
		put("한우", 60000);
		put("돼지고기", 8000);
		put("삼겹살", 10000);
		put("목살", 9000);
		put("닭고기", 5000);
		put("닭가슴살", 7000);
		put("계란", 6000);   // 30개 기준 약 6000원 → kg당 환산
		put("우유", 2500);   // 1L 기준

		// 수산물 (500 카테고리)
		put("고등어", 8000);
		put("갈치", 15000);
		put("삼치", 12000);
		put("조기", 20000);
		put("명태", 10000);
		put("연어", 30000);
		put("참치", 25000);
		put("오징어", 12000);
		put("낙지", 25000);
		put("문어", 20000);
		put("새우", 18000);
		put("게", 30000);
		put("조개", 8000);

		// 가공식품 및 기타
		put("두부", 4000);
		put("된장", 12000);
		put("고추장", 10000);
		put("간장", 8000);
		put("참기름", 50000);
		put("들기름", 45000);
		put("식용유", 5000);
		put("버터", 15000);
		put("치즈", 20000);
		put("햄", 12000);
		put("소시지", 10000);
		put("베이컨", 18000);

		// 버섯류
		put("느타리버섯", 8000);
		put("팽이버섯", 6000);
		put("새송이버섯", 7000);
		put("표고버섯", 15000);
		put("양송이버섯", 8000);

		// 해조류
		put("김", 30000);
		put("미역", 15000);
		put("다시마", 12000);
		put("파래", 20000);
	}};

	/**
	 * 식자재 가격 조회 (Fallback 포함)
	 * 1단계: DB 조회
	 * 2단계: 서울시 API 조회
	 * 3단계: 기본 가격 상수
	 *
	 * @param ingredientName 식자재명
	 * @return 가격 (원/kg), 모든 조회 실패 시 null
	 */
	@Override
	public Integer getPrice(String ingredientName) {
		log.debug("가격 조회 시작 - 식자재: {}", ingredientName);

		// 1단계: DB 조회
		try {
			PriceHistory priceHistory = priceHistoryMapper.getRecentPriceByName(ingredientName);
			if (priceHistory != null) {
				log.info("DB에서 가격 조회 성공 - 식자재: {}, 가격: {}원/kg (수집일: {})",
						ingredientName, priceHistory.getPriceValue(), priceHistory.getCollectedDate());
				return priceHistory.getPriceValue();
			}
		} catch (Exception e) {
			log.warn("DB 가격 조회 실패 - 식자재: {}, 에러: {}", ingredientName, e.getMessage());
		}

		// 2단계: 서울시 API 조회
		try {
			Integer seoulPrice = seoulPriceApiService.getAveragePrice(ingredientName);
			if (seoulPrice != null) {
				log.info("서울시 API에서 가격 조회 성공 - 식자재: {}, 가격: {}원", ingredientName, seoulPrice);
				return seoulPrice;
			}
		} catch (Exception e) {
			log.warn("서울시 API 가격 조회 실패 - 식자재: {}, 에러: {}", ingredientName, e.getMessage());
		}

		// 3단계: 기본 가격 상수 조회 (부분 매칭)
		Integer defaultPrice = getDefaultPrice(ingredientName);
		if (defaultPrice != null) {
			log.info("기본 가격 사용 - 식자재: {}, 가격: {}원/kg", ingredientName, defaultPrice);
			return defaultPrice;
		}

		log.warn("가격 조회 실패 (모든 단계 실패) - 식자재: {}", ingredientName);
		return null;
	}

	/**
	 * 여러 식자재의 가격 조회
	 *
	 * @param ingredientNames 식자재명 배열
	 * @return 식자재명-가격 맵
	 */
	@Override
	public Map<String, Integer> getPrices(String... ingredientNames) {
		Map<String, Integer> prices = new HashMap<>();

		for (String name : ingredientNames) {
			Integer price = getPrice(name);
			if (price != null) {
				prices.put(name, price);
			}
		}

		log.info("여러 식자재 가격 조회 완료 - 요청: {}개, 조회 성공: {}개",
				ingredientNames.length, prices.size());

		return prices;
	}

	/**
	 * 가격 저장 (스케줄러에서 사용)
	 *
	 * @param ingredientName 식자재명
	 * @param price 가격
	 * @param priceType 가격 유형 (소매/도매)
	 * @param region 지역
	 * @return 저장 성공 여부
	 */
	@Override
	public boolean savePrice(String ingredientName, Integer price, String priceType, String region) {
		log.debug("가격 저장 시작 - 식자재: {}, 가격: {}원", ingredientName, price);

		try {
			// 주의: 실제 저장을 위해서는 ingredientId가 필요
			// 현재는 간단한 구현으로, 실제로는 Ingredient 테이블에서 ID를 조회해야 함
			PriceHistory priceHistory = new PriceHistory();
			// priceHistory.setIngredientId(???); // TODO: Ingredient 조회 로직 필요
			priceHistory.setPriceValue(price);
			priceHistory.setPriceType(priceType);
			priceHistory.setRegion(region);
			priceHistory.setCollectedDate(LocalDateTime.now());

			// int result = priceHistoryMapper.insertPrice(priceHistory);
			// log.info("가격 저장 성공 - 식자재: {}, 가격: {}원", ingredientName, price);
			// return result > 0;

			log.warn("가격 저장 기능은 Ingredient 조회 로직 구현 후 활성화 예정");
			return false;

		} catch (Exception e) {
			log.error("가격 저장 실패 - 식자재: {}", ingredientName, e);
			return false;
		}
	}

	/**
	 * 기본 가격 상수에서 가격 조회 (부분 매칭)
	 *
	 * @param ingredientName 식자재명
	 * @return 기본 가격, 없으면 null
	 */
	private Integer getDefaultPrice(String ingredientName) {
		// 1. 정확한 매칭 시도
		if (DEFAULT_PRICES.containsKey(ingredientName)) {
			return DEFAULT_PRICES.get(ingredientName);
		}

		// 2. 부분 매칭 시도 (예: "양배추" 검색 시 "배추"로 매칭)
		for (Map.Entry<String, Integer> entry : DEFAULT_PRICES.entrySet()) {
			String key = entry.getKey();
			// 식자재명이 키를 포함하거나, 키가 식자재명을 포함하는 경우
			if (ingredientName.contains(key) || key.contains(ingredientName)) {
				log.debug("부분 매칭 성공 - 검색어: {}, 매칭된 키: {}", ingredientName, key);
				return entry.getValue();
			}
		}

		return null;
	}
}