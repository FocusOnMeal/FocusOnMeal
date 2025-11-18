import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './list.module.css';
// (Pagination.jsx 파일의 실제 경로에 맞게 수정하세요)
import Pagination from '../../components/common/Pagination'; 

const CATEGORIES = ['식량작물', '채소류', '특용작물', '과일류', '수산물'];

function IngredientSearch() {

  const [originalResults, setOriginalResults] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/ingredient/api/list');
        console.log("API 응답:", response.data); 
        
        if (Array.isArray(response.data)) {
            setOriginalResults(response.data);
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
    if (selectedCategory !== '전체' && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // --- 페이징 계산 로직 ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

  const maxPage = Math.ceil(filteredResults.length / itemsPerPage);
  const navSize = 5;
  const startNavi = Math.floor((currentPage - 1) / navSize) * navSize + 1;
  const endNavi = Math.min(startNavi + navSize - 1, maxPage);
  
  const pageInfo = {
    startNavi,
    endNavi,
    maxPage
  };

  const changePage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > maxPage) return;
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); 
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchText]);


  const handleReset = () => {
    setSelectedCategory('전체');
    setSearchText('');
  };

  if (loading) return <div className={styles.container}>데이터를 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <h2>식재료 목록</h2>
      <p className={styles.infoText}>
        ※ 모든 데이터는 <strong>서울 / 소매 / 1kg</strong> 기준입니다.
      </p>

      {/* --- [ ★★★ 수정 ★★★ ] --- */}
      {/* 사라졌던 필터 UI 코드를 다시 복원합니다. */}
      <form onSubmit={(e) => e.preventDefault()} className={styles.filterSection}>
        <div className={styles.filterGrid}>
          
          {/* 1. 카테고리 필터 */}
          <div className={styles.filterGroup}>
            <label>분류</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="전체">전체</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* 2. 식재료명 검색 */}
          <div className={styles.filterGroup}>
            <label htmlFor="food-search">식재료명</label>
            <input
              type="text"
              id="food-search"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="예: 사과, 고등어"
            />
          </div>
        </div>
        
        {/* 3. 초기화 버튼 */}
        <div className={styles.filterActions}>
          <button 
            type="reset" 
            className={styles.resetButton} 
            onClick={handleReset}
          >
            초기화
          </button>
        </div>
      </form>
      {/* --- 필터 UI 복원 끝 --- */}


      <p className={styles.resultsHeader}>
        검색 결과 총 : <span>{filteredResults.length}</span>건
      </p>

      {/* --- [5. 결과 리스트 렌더링] --- */}
      <section>
        <ul className={styles.resultsList}>
          {currentItems.length === 0 && ( 
            <li className={styles.noResults}>
              검색 결과가 없습니다.
            </li>
          )}

          {currentItems.map((item) => ( 
              <li key={item.ingredientId} className={styles.resultItem}>
                <div className={styles.itemHeader}>
                  <Link to={`/ingredient/detail/${item.ingredientId}`} className={styles.itemTitleLink}>
                    <h3 className={styles.itemTitle}>
                      {item.name} <small>({item.category})</small>
                    </h3>
                  </Link>
                </div>
                <div className={styles.itemDetails}>
                  <p>
                    <strong>가격 (1kg):</strong> 
                    {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '정보 없음'}
                  </p>
                  <p>
                    <strong>기준일:</strong> 
                    {item.collectedDate ? item.collectedDate.substring(0, 10) : '-'}
                  </p>
                </div>
              </li>
            ))}
        </ul>
      </section>

        <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '20px 0' // (위아래 여백도 살짝 추가)
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