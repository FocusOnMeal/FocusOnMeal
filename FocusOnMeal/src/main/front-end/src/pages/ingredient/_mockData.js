// src/_mockData.js

// (이하 데이터는 IngredientSearch.js에서 수정했던 내용)
export const initialMockResults = [
    {
        id: '211-02', 
        itemCode: '211',
        kindCode: '02',
        name: '배추',
        kindName: '여름(고랭지)(10kg(그물망 3포기))',
        grade: '상품',
        unit: '10kg(그물망 3포기)',
        priceToday: '5,500',
        priceYesterday: '7,000',
        priceWeekAgo: '7,000', // <dpr3>
        priceMonthAgo: '6,075', // <dpr5>
        category: '채소류',
        item: '배추',
        variety: '여름(고랭지)',
        isImported: false,
        isFrozen: false,
        safetyStatus: '안전',
        safetyLevel: 'safe',
        relatedInfoCount: 2,
        isWished: false, 
    },
    {
        id: '152-01',
        itemCode: '152',
        kindCode: '01',
        name: '감자',
        kindName: '수미(1kg)',
        grade: '상품',
        unit: '1kg',
        priceToday: '4,900',
        priceYesterday: '4,800',
        priceWeekAgo: '4,500',
        priceMonthAgo: '5,000',
        category: '채소류',
        item: '감자',
        variety: '수미',
        isImported: false,
        isFrozen: false,
        safetyStatus: '안전',
        safetyLevel: 'safe',
        relatedInfoCount: 0,
        isWished: true,
    },
  // ... (다른 mock 데이터들)
];

// (IngredientSearch.js에 있던 mockCategoryData도 여기로 옮기면 좋습니다)
export const mockCategoryData = {
    '전체': {
    '전체': ['전체']
  },
  '식량작물': {
    '전체': ['전체', '20kg', '10kg', '20kg(햅쌀)'],
    '쌀': ['전체', '20kg', '10kg', '20kg(햅쌀)'],
    '콩': ['전체', '국산(1kg)', '수입(1kg)'],
    '감자': ['전체', '수미(1kg)', '수미(20kg)'], // 감자는 식량작물/채소류 둘 다 있을 수 있음
  },
  '채소류': {
    '전체': ['전체', '10kg', '1포기', '1kg'],
    '배추': ['전체', '여름(고랭지)', '가을', '봄'],
    '감자': ['전체', '수미(1kg)', '수미(20kg)', '냉동'],
  }
};