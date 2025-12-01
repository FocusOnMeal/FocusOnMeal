import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import styles from "./IngredientInfo.module.css";

import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/common/Pagination";

// 자주 쓰이는 카테고리 목록
const CATEGORIES = [
    "식량작물", "채소류", "과일류", "육류", "수산물", "가공식품", "난류", "우유/유제품", "기타"
];

const IngredientInfo = () => {
    const [ingredientList, setIngredientList] = useState([]);
    const [pageInfo, setPageInfo] = useState({ maxPage: 1 });
    const [currentPage, setCurrentPage] = useState(1);

    // 검색 상태
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    
    // UI 입력 상태
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    
    // 정렬 상태
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    // 카테고리 필터 팝업 상태
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const categoryFilterRef = useRef(null);
    
    // [추가] 이미지 미리보기 모달 상태
    const [previewImage, setPreviewImage] = useState(null);
    
    const [imgRefreshKey, setImgRefreshKey] = useState(Date.now());

    // 외부 클릭 시 카테고리 필터 닫기
    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target)) {
                setShowCategoryFilter(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [categoryFilterRef]);


    // 상태 변경 (삭제 처리)
    const handleToggleStatus = (ingredient) => {
        if (!window.confirm("정말로 삭제하시겠습니까? (복구 불가)")) return;

        const newStatus = ingredient.statusYn === "Y" ? "N" : "Y";

        axios.patch(`/api/admin/ingredient/status`, null, {
            params: { ingredientId: ingredient.ingredientId, statusYn: newStatus },
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        })
        .then(() => {
             alert("삭제되었습니다.");
             fetchIngredientList(); 
        })
        .catch(err => {
            console.error(err);
            alert("상태 변경 중 오류가 발생했습니다.");
        });
    };

    // 일반 검색 실행
    const handleSearch = () => {
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
        setSortColumn(null);
        setSortOrder('asc');
    };

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleCategoryFilter = (selectedCategory) => {
        setCurrentPage(1);
        setFetchSearchType('categoryName');
        setFetchSearchKeyword(selectedCategory);
        setSearchKeyword(''); 
        setShowCategoryFilter(false);
    };

    const handleSort = (column) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortOrder("asc");
        } else {
            if (sortOrder === "asc") {
                setSortOrder("desc");
            } else if (sortOrder === "desc") {
                setSortColumn(null);
                setSortOrder("asc");
            }
        }
    };
    
    // 이미지 변경 (업로드)
    const handleImageUpload = async (ingredientId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("ingredientId", ingredientId);
        formData.append("file", file);
        try {
            await axios.post("/api/admin/ingredient/image", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
            alert("이미지가 변경되었습니다.");
            setImgRefreshKey(Date.now());
        } catch (err) {
            console.error(err);
            alert("이미지 업로드 실패");
        }
    };

    // [추가] 이미지 삭제 (기본 이미지로 변경)
    const handleImageDelete = async (ingredientId) => {
        if (!window.confirm("등록된 이미지를 삭제하시겠습니까? \n(기본 이미지로 변경됩니다)")) return;

        try {
            // DELETE 메서드로 요청 (백엔드에 해당 매핑이 있어야 합니다)
            // 만약 백엔드가 DELETE를 지원하지 않는다면 POST/PATCH로 null을 보내는 등 백엔드 로직에 맞춰야 합니다.
            await axios.delete(`/api/admin/ingredient/image/${ingredientId}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            
            alert("이미지가 삭제되었습니다.");
            setImgRefreshKey(Date.now()); // 이미지 새로고침 -> 404가 뜨면서 onError가 발동해 기본 이미지로 보임
        } catch (err) {
            console.error(err);
            alert("이미지 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleImageError = (e) => {
        e.target.src = '/images/default_ingredient.png';
        // 모달에서 에러난 경우 클릭 이벤트 제거 (미리보기 방지)
        e.target.onclick = null;
        e.target.style.cursor = 'default';
    };

    // [추가] 이미지 클릭 핸들러 (모달 열기)
    const handleImageClick = (src) => {
        // 기본 이미지가 아닐 때만 확대 (선택 사항)
        if (src.includes('default_ingredient.png')) return;
        setPreviewImage(src);
    };

    const handleNutritionEdit = (ingredientId) => {
        alert(`식재료 ID ${ingredientId}의 영양성분을 수정합니다.`);
    };

    const fetchIngredientList = () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const params = {
            page: currentPage,
            type: fetchSearchType,
            keyword: fetchSearchKeyword,
            sortColumn,
            sortOrder
        };
        if (!params.keyword) params.type = 'all';

        axios.get("/api/admin/ingredient", {
            params: params,
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setIngredientList(res.data.ingredientList);
            setPageInfo(res.data.pageInfo);
        })
        .catch(err => console.error("API Error:", err));
    };

    useEffect(() => {
        fetchIngredientList();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder]);

    const renderSortArrow = (column) => {
        if (sortColumn !== column) return <span className={styles.sortArrow}>↕</span>;
        return (
            <span className={`${styles.sortArrow} ${styles.activeSort}`}>
                {sortOrder === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <h2 className={styles.title}>식재료 관리</h2>
                
                <div className={styles.searchBox}>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className={styles.selectBox}
                    >
                        <option value="all">전체</option>
                        <option value="ingredientName">재료명</option>
                        <option value="categoryName">카테고리(직접입력)</option> 
                    </select>

                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        onKeyDown={handleSearchOnEnter}
                        className={styles.searchInput}
                    />

                    <button onClick={handleSearch} className={styles.searchBtn}>
                        검색
                    </button>
                </div>
                
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th className={styles.noCol} onClick={() => handleSort("ingredientId")} style={{cursor: 'pointer'}}>
                                No {renderSortArrow("ingredientId")}
                            </th>
                            
                            <th className={styles.imageCol}>이미지</th>

                            <th className={styles.categoryCol}>
                                <div className={styles.thWrapper} ref={categoryFilterRef}>
                                    <div 
                                        className={styles.headerContent}
                                        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                                    >
                                        카테고리 
                                        <span style={{marginLeft: '4px', fontSize: '12px'}}>
                                            {fetchSearchType === 'categoryName' && fetchSearchKeyword ? '▼' : '▽'}
                                        </span>
                                    </div>

                                    {showCategoryFilter && (
                                        <div className={styles.filterDropdown}>
                                            <div 
                                                className={styles.filterItem}
                                                onClick={() => {
                                                    handleSearch(); 
                                                    setFetchSearchType('all');
                                                    setFetchSearchKeyword('');
                                                    setSearchKeyword('');
                                                    setShowCategoryFilter(false);
                                                }}
                                            >
                                                전체 보기
                                            </div>
                                            {CATEGORIES.map(cat => (
                                                <div 
                                                    key={cat} 
                                                    className={styles.filterItem}
                                                    onClick={() => handleCategoryFilter(cat)}
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </th>

                            <th className={styles.ingredientNameCol} onClick={() => handleSort("name")} style={{cursor: 'pointer'}}>
                                재료명 {renderSortArrow("name")}
                            </th>

                            <th className={styles.unitCol} onClick={() => handleSort("standardUnit")} style={{cursor: 'pointer'}}>
                                기준단위 {renderSortArrow("standardUnit")}
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("currentPrice")} style={{cursor: 'pointer'}}>
                                현재가격 {renderSortArrow("currentPrice")}
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("previousPrice")} style={{cursor: 'pointer'}}>
                                이전가격 {renderSortArrow("previousPrice")}
                            </th>

                            <th className={styles.dateCol} onClick={() => handleSort("collectedDate")} style={{cursor: 'pointer'}}>
                                최근 수집일 {renderSortArrow("collectedDate")}
                            </th>

                            <th className={styles.nutritionCol}>영양성분</th>
                            
                            <th className={styles.statusCol} onClick={() => handleSort("statusYn")} style={{cursor: 'pointer'}}>
                                활성상태 {renderSortArrow("statusYn")}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {ingredientList?.length === 0 ? (
                            <tr>
                                <td colSpan="10" className={styles.emptyCell}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            ingredientList.map((item) => (
                                <tr key={item.ingredientId}>
                                    <td>{item.ingredientId}</td>
                                    
                                    <td>
                                        <div className={styles.imageWrapper}>
                                            {/* [수정] 이미지 클릭 시 미리보기 함수 호출 */}
                                            <img 
                                                src={`/images/ingredients/${item.ingredientId}.jpg?t=${imgRefreshKey}`} 
                                                alt={item.name || 'ingredient'} 
                                                className={styles.ingredientImage}
                                                onError={handleImageError}
                                                onClick={(e) => handleImageClick(e.target.src)}
                                            />
                                            <div style={{display:'flex', alignItems:'center'}}>
                                                <label className={styles.imageChangeLabel}>
                                                    [변경]
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        className={styles.fileInput}
                                                        onChange={(e) => handleImageUpload(item.ingredientId, e.target.files[0])}
                                                    />
                                                </label>
                                                {/* [추가] 삭제 버튼 */}
                                                <button 
                                                    className={styles.deleteBtn} 
                                                    onClick={() => handleImageDelete(item.ingredientId)}
                                                >
                                                    [삭제]
                                                </button>
                                            </div>
                                        </div>
                                    </td>

                                    <td>{item.category || '-'}</td>

                                    <td className={styles.nameCell}>
                                        <div className={styles.textWrapper}>
                                            <span className={styles.truncatedText}>
                                                {item.name || '-'}
                                            </span>
                                            <div className={styles.tooltip}>
                                                {item.name || '-'}
                                            </div>
                                        </div>
                                    </td>

                                    <td>1{item.standardUnit || '1kg'}</td>
                                    
                                    <td>
                                        {item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '-'}
                                        {item.collectedDate && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                ({new Date(item.collectedDate).toLocaleDateString("ko-KR")})
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {item.previousPrice ? `${item.previousPrice.toLocaleString()}원` : '-'}
                                        {item.previousCollectedDate && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                ({new Date(item.previousCollectedDate).toLocaleDateString("ko-KR")})
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {item.collectedDate ? 
                                            new Date(item.collectedDate).toLocaleString("ko-KR", {
                                                year: 'numeric', 
                                                month: '2-digit', 
                                                day: '2-digit', 
                                                hour: '2-digit', 
                                                minute: '2-digit'
                                            }) : 
                                         item.enrollDate ? 
                                            new Date(item.enrollDate).toLocaleString("ko-KR", {
                                                year: 'numeric', 
                                                month: '2-digit', 
                                                day: '2-digit', 
                                                hour: '2-digit', 
                                                minute: '2-digit'
                                            }) : "-"}
                                    </td>

                                    <td>
                                        <button 
                                            className={styles.editBtn}
                                            onClick={() => handleNutritionEdit(item.ingredientId)}
                                        >
                                            [수정]
                                        </button>
                                    </td>
                                    
                                    <td>
                                        <label className={styles.toggleSwitch}>
                                            <input
                                                type="checkbox"
                                                checked={item.statusYn === "Y"}
                                                onChange={() => handleToggleStatus(item)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <Pagination 
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={(page) => setCurrentPage(page)}
                />
            </main>

            {/* [추가] 이미지 미리보기 모달 */}
            {previewImage && (
                <div className={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setPreviewImage(null)}>
                            &times;
                        </button>
                        <img src={previewImage} alt="확대 보기" className={styles.modalImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default IngredientInfo;