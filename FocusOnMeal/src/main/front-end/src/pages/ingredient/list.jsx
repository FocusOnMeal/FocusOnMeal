import React from 'react';

/**
 * 식품 성분표 목록 및 검색 컴포넌트
 * (CSS 스타일링이 적용되지 않은 기본 JSX 구조)
 */
function IngredientSearch() {

  // 실제 구현에서는 이 데이터가 Spring Boot API로부터 받아온 동적 데이터가 됩니다.
const mockResults = [
    {
    id: 1,
    name: '감자 (1kg)',
    isImported: false,
    isFrozen: false,
    price: '4900원',
    pricePerUnit: '(100g당 490원)',
    priceChange: '▲10%',
    safetyStatus: '안전',
    safetyLevel: 'safe', // 'safe', 'warning', 'danger'
    relatedInfoCount: 0,
    },
    {
    id: 2,
    name: '감자 (냉동) (2kg)',
    isImported: true,
    isFrozen: true,
    price: '12,000원',
    pricePerUnit: '(100g당 600원)',
    priceChange: '▼5%',
    safetyStatus: '주의',
    safetyLevel: 'warning',
    relatedInfoCount: 1,
    }
];

return (
    <div>
    <h2>식품성분표 목록</h2>
    <hr />

      {/* 1. 검색 영역 */}
    <form>
        <label htmlFor="food-search">식품명</label>
        <input 
        type="text" 
        id="food-search" 
          defaultValue="감자" // placeholder 또는 value로 관리
        />
        <button type="submit">검색</button>
    </form>
    
    <p>검색 결과 총 : N건</p>

      {/* 2. 카테고리 필터 버튼 */}
    <div>
        <button>곡류</button>
        <button>채소류</button>
        <button>육류</button>
        <button>과일류</button>
        <button>두류</button>
        <button>유제품</button>
        <button>수산물</button>
        <button>조미료</button>
    </div>
    
    <hr />

      {/* 3. 검색 결과 목록 */}
    <section>
        <ul>
        {/* 실제로는 이 부분을 mockResults.map()을 사용해 동적으로 렌더링합니다. 
            지금은 구조를 보여드리기 위해 하드코딩했습니다.
          */}
        
          {/* 아이템 1 */}
        <li style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
            <div>
            <h3>
                {mockResults[0].isImported ? '[수입] ' : ''}
                {mockResults[0].name}
            </h3>
            <button>♥ 찜하기</button>
            <button>안전 정보</button>
            </div>
            <div>
            <p>
                [가격] : {mockResults[0].price} {mockResults[0].pricePerUnit} (어제 대비 {mockResults[0].priceChange})
            </p>
            <p>
                [안전] : 
                {/* 안전 상태에 따른 아이콘 (간단한 텍스트/이모지) */}
                {mockResults[0].safetyLevel === 'safe' && ' 🟢 '}
                {mockResults[0].safetyLevel === 'warning' && ' 🟡 '}
                {mockResults[0].status}
                {mockResults[0].relatedInfoCount > 0 && `(관련 정보 ${mockResults[0].relatedInfoCount}건)`}
            </p>
            </div>
        </li>
        
          {/* 아이템 2 */}
        <li style={{ border: '1px solid #eee', padding: '10px', margin: '10px 0' }}>
            <div>
            <h3>
                {mockResults[1].isImported ? '[수입] ' : ''}
                {mockResults[1].name}
            </h3>
            <button>♥ 찜하기</button>
            <button>안전 정보</button>
            </div>
            <div>
            <p>
                [가격] : {mockResults[1].price} {mockResults[1].pricePerUnit} (어제 대비 {mockResults[1].priceChange})
            </p>
            <p>
                [안전] : 
                {mockResults[1].safetyLevel === 'safe' && ' 🟢 '}
                {mockResults[1].safetyLevel === 'warning' && ' 🟡 '}
                {mockResults[1].safetyStatus}
                {mockResults[1].relatedInfoCount > 0 && ` (관련 정보 ${mockResults[1].relatedInfoCount}건)`}
            </p>
            </div>
        </li>

        </ul>
    </section>
    </div>
);
}

export default IngredientSearch;