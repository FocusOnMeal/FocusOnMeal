import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 1. CSS 모듈 임포트
import styles from './list.module.css';
// 2. Mock 데이터 분리 (Best Practice)
import { initialMockResults, mockCategoryData } from './_mockData'; 
// (만약 _mockData.js 파일을 생성하지 않았다면, 이 코드를 주석 해제하고 
//  아래 const 선언부 2개를 다시 주석 처리해야 합니다.)

/**
 * (데이터를 _mockData.js로 분리했으므로 이 부분은 주석 처리)
 */
// const initialMockResults = [ ... ];
// const mockCategoryData = { ... };


/**
 * 식품 성분표 목록 및 검색 컴포넌트
 */
function IngredientSearch() {

  // --- 1. 상태 관리 (useState) ---
  const [results, setResults] = useState(initialMockResults);
  
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedItem, setSelectedItem] = useState('전체');
  const [selectedVariety, setSelectedVariety] = useState('전체');
  const [searchText, setSearchText] = useState('');

  const [itemOptions, setItemOptions] = useState(['전체']);
  const [varietyOptions, setVarietyOptions] = useState(['전체']);


  // --- 2. 연동 드롭다운 로직 (useEffect) ---

  // 2-1. '분류'가 바뀌면 '품목' 옵션 목록을 업데이트
  useEffect(() => {
    const categories = mockCategoryData[selectedCategory] || mockCategoryData['전체'];
    setItemOptions(Object.keys(categories));
    
    setSelectedItem('전체');
    setVarietyOptions(['전체']);
  }, [selectedCategory]);

  // 2-2. '품목'이 바뀌면 '품종' 옵션 목록을 업데이트
  useEffect(() => {
    const categories = mockCategoryData[selectedCategory] || mockCategoryData['전체'];
    const varieties = categories[selectedItem] || categories['전체'];
    setVarietyOptions(varieties);
    
    setSelectedVariety('전체');
  }, [selectedCategory, selectedItem]);


  // --- 3. 필터링 로직 ---
  const filteredResults = results.filter(item => {
    if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== '전체' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedItem !== '전체' && item.item !== selectedItem) {
      return false;
    }
    if (selectedVariety !== '전체' && !item.kindName.includes(selectedVariety)) {
      return false;
    }
    // TODO: 날짜, 등급, 지역 필터 로직
    return true;
  });

  // --- 4. 이벤트 핸들러 ---
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // (API 연동 시 이곳에서 fetch/axios 호출)
    console.log("검색 조건:", { 
      category: selectedCategory, 
      item: selectedItem, 
      variety: selectedVariety,
      text: searchText 
    });
  };

  // 4-1. [추가] 선택 초기화 핸들러
  const handleReset = () => {
    setSelectedCategory('전체');
    setSelectedItem('전체');
    setSelectedVariety('전체');
    setSearchText('');
    // TODO: 날짜, 등급, 지역 상태도 초기화
  };

  const handleWishClick = (itemId) => {
    setResults(prevResults => 
      prevResults.map(item => 
        item.id === itemId ? { ...item, isWished: !item.isWished } : item
      )
    );
  };


  // --- 5. JSX (CSS 모듈 적용) ---
  return (
    // [변경] className 적용
    <div className={styles.container}>
      <h2>식품성분표 목록</h2>
      {/* <hr /> 제거 */}

      {/* [변경] className 적용 및 구조 변경 */}
      <form onSubmit={handleSearchSubmit} className={styles.filterSection}>
        <div className={styles.filterGrid}>
          
          {/* TODO: 기간 (Date Picker) filterGroup */}
          {/* <div className={styles.filterGroup}>
            <label>기간</label>
            (Date Picker 컴포넌트)
          </div> 
          */}

          <div className={styles.filterGroup}>
            <label>분류</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {Object.keys(mockCategoryData).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>품목</label>
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
              {itemOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>품종</label>
            <select value={selectedVariety} onChange={e => setSelectedVariety(e.target.value)}>
              {varietyOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          {/* TODO: 등급, 지역 filterGroup */}
          
          <div className={styles.filterGroup}>
            <label htmlFor="food-search">품목명</label>
            <input
              type="text"
              id="food-search"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="품목명 입력"
            />
          </div>
        </div>
        
        {/* [추가] 검색/초기화 버튼 영역 */}
        <div className={styles.filterActions}>
          <button 
            type="reset" 
            className={styles.resetButton} 
            onClick={handleReset}
          >
            선택초기화
          </button>
          <button type="submit" className={styles.submitButton}>
            검색하기
          </button>
        </div>
      </form>

      <p className={styles.resultsHeader}>
        검색 결과 총 : <span>{filteredResults.length}</span>건
      </p>

      {/* --- 3. 검색 결과 목록 --- */}
      <section>
        <ul className={styles.resultsList}>
          
          {filteredResults.length === 0 && (
            <li className={styles.noResults}>
              검색 결과가 없습니다.
            </li>
          )}

          {filteredResults.map((item) => {
            // [추가] 안전 등급에 따른 CSS 클래스 분기
            const safetyClass = item.safetyLevel === 'safe' ? styles.safe :
                              item.safetyLevel === 'warning' ? styles.warning :
                              item.safetyLevel === 'danger' ? styles.danger : '';

            return (
              <li key={item.id} className={styles.resultItem}>
                
                <div className={styles.itemHeader}>
                  <Link to={`/ingredient/${item.id}`} className={styles.itemTitleLink}>
                    <h3 className={styles.itemTitle}>
                      {item.isImported ? '[수입] ' : ''}
                      {item.name} ({item.kindName})
                    </h3>
                  </Link>
                  <div className={styles.itemActions}>
                    <button onClick={() => handleWishClick(item.id)}>
                      {item.isWished ? '❤️ 찜 취소' : '♥ 찜하기'}
                    </button>
                    <button>안전 정보</button>
                  </div>
                </div>
                
                <div className={styles.itemDetails}>
                  <p>
                    <strong>등급:</strong> {item.grade} ({item.unit})
                  </p>
                  <p>
                    <strong>가격:</strong> {item.priceToday}원 (1일전: {item.priceYesterday}원)
                  </p>
                  <p>
                    <strong>안전:</strong>
                    {/* [변경] className 동적 적용 */}
                    <span className={`${styles.safetyStatus} ${safetyClass}`}>
                      {item.safetyLevel === 'safe' && ' 🟢 '}
                      {item.safetyLevel === 'warning' && ' 🟡 '}
                      {item.safetyStatus}
                    </span>
                    {item.relatedInfoCount > 0 && ` (관련 정보 ${item.relatedInfoCount}건)`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default IngredientSearch;