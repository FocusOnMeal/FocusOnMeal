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
  
  // ✅ [수정] 찜 토글 기능: 실제 백엔드 API 호출로 변경
const toggleWishlist = async (ingredientId) => {
    try {
        // Post 요청 시 Body가 비어있으면 400 에러가 날 수 있으므로 빈 객체 {}를 넣어줍니다.
        const response = await axios.post(`/ingredient/detail/${ingredientId}/favorite`, {});
        
        if (response.data.success) {
            setWishlist(prev => {
                const newSet = new Set(prev);
                // 백엔드 응답(isFavorite)에 따라 상태 동기화
                if (response.data.isFavorite) {
                    newSet.add(ingredientId);
                } else {
                    newSet.delete(ingredientId);
                }
                return newSet;
            });
        }
    } catch (error) {
        if (error.response?.status === 401) {
            alert("로그인이 필요한 서비스입니다.");
        } else {
            console.error("찜하기 오류:", error);
            alert("오류가 발생했습니다.");
        }
    }
  };

  // 1. 식재료 전체 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/ingredient/api/list');
        
        if (Array.isArray(response.data)) {
            const processedData = response.data.map(item => ({
              ...item,
              pricePer100g: item.currentPrice ? Math.floor(item.currentPrice / 10) : 0,
              
              // [수정] 백엔드 데이터 매핑
              priceChangePercent: item.priceChangePercent ?? 0, 
              previousPrice: item.previousPrice || 0, 
              // ✅ 직전 데이터 수집일 추가 (문자열로 올 수 있으니 확인 필요)
              previousCollectedDate: item.previousCollectedDate || null,

              safetyStatus: ['safe', 'warning', 'danger'][Math.floor(Math.random() * 3)], // TODO: 실제 안전도 로직
              unit: item.unit || '1kg'
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

// 2. 내 찜 목록 불러오기 (초기화)
  useEffect(() => {
    // 1. 토큰이 있는지 먼저 확인
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    // 🚨 [핵심] 토큰이 없으면(비로그인 상태면) 여기서 멈춤! 서버에 요청 안 보냄!
    if (!token) return; 

    const fetchMyFavorites = async () => {
        try {
            const response = await axios.get('/api/mypage/ingredients/favorite');
            if (response.data && Array.isArray(response.data)) {
                const myFavoriteIds = response.data.map(item => item.ingredientId);
                setWishlist(new Set(myFavoriteIds));
            }
        } catch{
            // 토큰이 만료되었거나 오류가 나도, 리스트 페이지 보는 데는 지장 없으니 조용히 넘어감
        }
    };
    
    fetchMyFavorites();
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
        
        {/* 2. 카테고리 버튼 UI */}
        <div className={styles.categoryButtons}>
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

      {/* 검색 결과 총 + 안전 위험도 툴팁 */}
      <div className={styles.resultsHeaderContainer}>
          <p className={styles.resultsHeader}>
            검색 결과 총 : <span>{filteredResults.length}</span>건
          </p>
          
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

      {/* 3. 결과 리스트 렌더링 */}
      <section>
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
            
            // 실제 가격 변동률 사용
            const hasPriceChange = item.priceChangePercent !== null && item.priceChangePercent !== undefined;
            const changeIndicator = hasPriceChange && item.priceChangePercent >= 0 ? '▲' : '▼';
            const changeStyle = {
                color: hasPriceChange && item.priceChangePercent >= 0 ? '#dc3545' : '#007aff', 
                fontWeight: 'bold',
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
                        <span style={{
                          fontSize: '0.7em', 
                          fontWeight: 'normal', 
                          color: '#999', 
                          marginLeft: '5px'
                        }}>
                          ({item.category})
                        </span>
                      </h3>
                    </Link>
                    
                    <div className={styles.itemActions}>
    <button 
        onClick={() => toggleWishlist(item.ingredientId)}
        // 찜 상태(isWished)일 때 styles.wished 클래스 추가
        className={isWished ? styles.wished : ''}
    >
        {/* SVG 하트 아이콘 */}
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path 
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                stroke="currentColor" 
                strokeWidth="2"
            />
        </svg>
        {/* 텍스트 */}
        <span>{isWished ? '찜 완료' : '찜하기'}</span>
    </button>
</div>
                </div>

                <div className={styles.itemDetails}>
                    <p className={styles.priceSummaryLine}>
                        <strong>[ 가격 (1kg) ] :</strong> 
                        {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '정보 없음'}
                        {item.pricePer100g > 0 && 
                            <span style={{marginLeft: '10px', color: '#666', fontSize: '0.9em', fontWeight: 'normal'}}>
                                (100g당 {item.pricePer100g.toLocaleString()}원)
                            </span>
                        }
                    </p>
                    
                    {/* ✅ [수정] 가격 변동 정보 + 날짜 상세 표시 */}
                    {item.currentPrice && item.previousPrice ? (
                        <p style={{fontSize: '0.85em', marginTop: '4px', marginBottom: '4px'}}>
                            
                            {/* 1. 변동 없음 */}
                            {item.priceChangePercent === 0 && (
                                <span style={{color: '#666'}}>
                                    - 전일 대비 변동 없음
                                </span>
                            )}

                            {/* 2. 상승/하락 표시 (글자 + 화살표 + 수치 통일) */}
                            {item.priceChangePercent !== 0 && (
                                <span style={{
                                    // 여기서 색상을 한 번에 지정합니다
                                    color: item.priceChangePercent > 0 ? '#dc3545' : '#007aff', 
                                    fontWeight: 'bold'
                                }}>
                                    전일 대비 {item.priceChangePercent > 0 ? '▲' : '▼'} {Math.abs(item.priceChangePercent).toFixed(1)}%
                                </span>
                            )}

                            {/* ✅ [날짜/시간 추가] (전일 : 000원, 11.24 09:30) */}
                            {item.previousCollectedDate && (
                                <span style={{color: '#999', marginLeft: '6px'}}>
                                    (전일 : {item.previousPrice.toLocaleString()}원, 
                                    {' ' + new Date(item.previousCollectedDate).toLocaleDateString('ko-KR', {
                                        month: 'numeric', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })})
                                </span>
                            )}
                        </p>
                    ) : (
                        <p style={{fontSize: '0.85em', color: '#999', marginTop: '4px', marginBottom: '4px'}}>
                            <span style={{background:'#ffc107', color:'#fff', padding:'2px 6px', borderRadius:'4px', marginRight:'5px', fontSize:'0.9em'}}>NEW</span>
                            최근 데이터 기준
                        </p>
                    )}
                    
                    <p className={styles.safetyStatusLine}>
                        <strong>[ 안전 ] : &nbsp;</strong> 
                        
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