import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './list.module.css';
import Pagination from '../../components/common/Pagination'; 

// 카테고리 정의
const CATEGORIES = [
  { key: 'grain', name: '곡류', apiName: '식량작물' },
  { key: 'vegetable', name: '채소류', apiName: '채소류' },
  { key: 'meat', name: '육류', apiName: '육류' },
  { key: 'fruit', name: '과일류', apiName: '과일류' },
  { key: 'tofu', name: '두류', apiName: '두류' }, 
  { key: 'dairy', name: '유제품', apiName: '유제품' }, 
  { key: 'seafood', name: '수산물', apiName: '수산물' },
  { key: 'seasoning', name: '조미료', apiName: '조미료' }, 
];

function IngredientSearch() {
  const [originalResults, setOriginalResults] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null); 
  const [searchText, setSearchText] = useState('');

  const [wishlist, setWishlist] = useState(new Set()); 
  
  const toggleWishlist = (ingredientId) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      newSet.has(ingredientId) ? newSet.delete(ingredientId) : newSet.add(ingredientId);
      return newSet;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/ingredient/api/list');
        
        if (Array.isArray(response.data)) {
            const processedData = response.data.map(item => ({
              ...item,
              pricePer100g: item.currentPrice ? Math.floor(item.currentPrice / 10) : 0, 
              // 🚨 UI 테스트용 임의 데이터
              priceChangePercent: Math.random() > 0.5 ? 10 : -5, 
              safetyStatus: ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)],
              unit: item.unit || '1kg' // 단위 추가
            }));
            setOriginalResults(processedData);
        } else {
            console.error("API 응답이 배열이 아닙니다. 빈 배열로 설정합니다.");
            setOriginalResults([]); 
        }

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        setOriginalResults([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const filteredResults = (originalResults || []).filter(item => {
    if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (selectedCategoryKey) {
        const selectedApiName = CATEGORIES.find(c => c.key === selectedCategoryKey)?.apiName;
        if (item.category !== selectedApiName) {
            return false;
        }
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const maxPage = Math.ceil(filteredResults.length / itemsPerPage);
  const navSize = 5;
  const startNavi = Math.floor((currentPage - 1) / navSize) * navSize + 1;
  const endNavi = Math.min(startNavi + navSize - 1, maxPage);
  
  const pageInfo = { startNavi, endNavi, maxPage };

  const changePage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > maxPage) return;
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); 
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryKey, searchText]);


  const handleReset = () => {
    setSelectedCategoryKey(null); 
    setSearchText('');
  };

  if (loading) return <div className={styles.container}>데이터를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h2>식품성분표 목록</h2> 
      
      {/* 1. 검색/필터 영역 */}
      <form onSubmit={(e) => e.preventDefault()} className={styles.filterSection}>
        
        {/* 🚨 가운데 정렬 컨테이너 적용 */}
        <div className={styles.centerLayout}> 
            <label htmlFor="food-search" className={styles.searchLabel}>식재료명</label>
            
            <div className={styles.searchInputContainer}>
                <input
                    type="text"
                    id="food-search"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="예: 감자, 사과"
                    className={styles.searchInput}
                />
                
                <div className={styles.searchButtons}>
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        onClick={() => setCurrentPage(1)} 
                    >
                        검색
                    </button>
                    <button 
                        type="reset" 
                        className={styles.resetButton} 
                        onClick={handleReset}
                    >
                        초기화
                    </button>
                </div>
            </div>
        </div>
        
        {/* 2. 카테고리 버튼 UI (filterSection 내부) */}
        <div className={styles.categoryButtons}>
          
          {/* '전체' 버튼 */}
          <button
            className={`${styles.categoryButton} ${!selectedCategoryKey ? styles.active : ''}`}
            onClick={() => setSelectedCategoryKey(null)}
          >
            전체
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`${styles.categoryButton} ${selectedCategoryKey === cat.key ? styles.active : ''}`}
              onClick={() => setSelectedCategoryKey(selectedCategoryKey === cat.key ? null : cat.key)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </form>

      {/* 🚨 검색 결과 총 + 안전 위험도 툴팁 섹션 */}
      <div className={styles.resultsHeaderContainer}>
          <p className={styles.resultsHeader}>
            검색 결과 총 : <span>{filteredResults.length}</span>건
          </p>
          
          {/* 🚨 안전 위험도 툴팁 아이콘 */}
          <div className={styles.safetyInfoControl}>
            <span style={{fontWeight: 600, color: '#333'}}>안전 위험도란?</span>
            <span className={styles.tooltipContainer}>
                <span className={styles.helpIcon}>?</span>
                <div className={styles.tooltipBox}>
                    <h4 className={styles.tooltipTitle}>안전 위험도 기준</h4>
                    <p className={styles.tooltipDanger}>
                        <strong>🔴 위험:</strong> <span className={styles.tooltipTextContent}>최근 3개월 이내 식약처 회수 명령, 또는 농약/중금속 부적합 판정 등이 있었을 경우.</span>
                    </p>
                    <p className={styles.tooltipWarning}>
                        <strong>🟠 주의:</strong> <span className={styles.tooltipTextContent}>가격 변동률 ±20% 이상 등 급격한 불안정, 또는 계절적 품질 저하 우려가 있는 경우.</span>
                    </p>
                    <p className={styles.tooltipSafe}>
                        <strong>🟢 안전:</strong> <span className={styles.tooltipTextContent}>위의 위험 및 주의 조건에 해당하지 않는 경우.</span>
                    </p>
                </div>
            </span>
          </div>
      </div>
      {/* 🚨 /검색 결과 총 + 안전 위험도 툴팁 섹션 */}


      {/* 3. 결과 리스트 렌더링 */}
      <section>
        {/* 🚨 2분할 그리드 레이아웃 적용 */}
        <ul className={`${styles.resultsList} ${styles.twoColumnList}`}>
          {currentItems.length === 0 && ( 
            <li className={styles.noResults}>
              검색 결과가 없습니다.
            </li>
          )}

          {currentItems.map((item) => {
            const isWished = wishlist.has(item.ingredientId);
            const safetyClass = item.safetyStatus === 'safe' ? styles.safe 
                              : item.safetyStatus === 'warning' ? styles.warning 
                              : styles.danger;
            
            const changeIndicator = item.priceChangePercent >= 0 ? '▲' : '▼';
            const changeStyle = {
                color: item.priceChangePercent >= 0 ? '#dc3545' : '#007aff', 
                fontWeight: 'bold',
                // 🚨 가격 변동률은 .priceChangeLine에서 스타일링
            };
            const safetyText = item.safetyStatus === 'safe' ? '안전'
                             : item.safetyStatus === 'warning' ? '주의'
                             : '위험';

            return (
              <li key={item.ingredientId} className={styles.resultItem}>
                
                <div className={styles.itemHeader}>
                    <Link to={`/ingredient/detail/${item.ingredientId}`} className={styles.itemTitleLink}>
                      <h3 className={styles.itemTitle}>
                        {item.name} 
                      </h3>
                    </Link>
                    
                    <div className={styles.itemActions}>
                        <button 
                          onClick={() => toggleWishlist(item.ingredientId)}
                          style={{color: isWished ? '#dc3545' : '#333', borderColor: isWished ? '#dc3545' : '#ddd'}}
                        >
                          {isWished ? '❤️ 찜하기' : '🤍 찜하기'}
                        </button>
                        {/* 🚨 찜하기 옆 안전 알림 버튼 추가 */}
                        <span className={styles.safetyBadge}>안전 알림</span>
                    </div>
                </div>

                                <div className={styles.itemDetails}>
                    <p className={styles.priceSummaryLine}>
                        <strong>[가격]:</strong> 
                        {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '정보 없음'}
                        {item.pricePer100g > 0 && 
                            <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em', fontWeight: 'normal'}}>
                                (100g당 {item.pricePer100g.toLocaleString()}원)
                            </span>
                        }
                        {/* 가격 변동률을 같은 줄에 표시 */}
                        {item.priceChangePercent !== undefined && (
                            <span style={{...changeStyle, marginLeft: '10px', fontSize: '0.9em'}}>
                                (어제 대비 {changeIndicator}{Math.abs(item.priceChangePercent)}%)
                            </span>
                        )}
                    </p>
                    
                    <p className={styles.safetyStatusLine}>
                        <strong>[안전]:&nbsp;</strong> 
                        
                        <span className={`${styles.safetyIcon} ${safetyClass}`}>
                            {safetyText.charAt(0)}
                        </span>
                        
                        <span className={safetyClass} style={{marginLeft: '5px', fontWeight: 600}}>
                            {safetyText}
                        </span>
                        
                    </p>

                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 페이지네이션 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0'
      }}>
        <Pagination 
          pageInfo={pageInfo}
          currentPage={currentPage}
          changePage={changePage}
        />
      </div>

    </div>
  );
}

export default IngredientSearch;