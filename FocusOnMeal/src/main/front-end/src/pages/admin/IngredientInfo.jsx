import React, { useState, useEffect } from 'react';
import axios from "axios";
import styles from "./IngredientInfo.module.css";

import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/common/Pagination";

const IngredientInfo = () => {
    const [ingredientList, setIngredientList] = useState([]);
    const [pageInfo, setPageInfo] = useState({ maxPage: 1 });
    const [currentPage, setCurrentPage] = useState(1);

    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    
    const [imgRefreshKey, setImgRefreshKey] = useState(Date.now());

    const handleToggleStatus = (ingredient) => {
        const newStatus = ingredient.statusYn === "Y" ? "N" : "Y";

        axios.patch(`/api/admin/ingredient/status`, null, {
            params: { ingredientId: ingredient.ingredientId, statusYn: newStatus },
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
        })
        .then(() => {
             setIngredientList(prev =>
                prev.map(item =>
                    item.ingredientId === ingredient.ingredientId ? { ...item, statusYn: newStatus} : item
                )
            );
        })
        .catch(err => {
            console.error(err);
            alert("상태 변경 중 오류가 발생했습니다.");
        });
    };

    const handleSearch = () =>{
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
    };

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSort = (column) => {
        const newOrder = (sortColumn === column && sortOrder === "asc") ? "desc" : "asc";
        setSortColumn(column);
        setSortOrder(newOrder);
    };
    
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

    const handleImageError = (e) => {
        e.target.src = '/images/default_ingredient.png';
    };

    const handleNutritionEdit = (ingredientId) => {
        // 영양성분 수정 모달 또는 페이지로 이동
        alert(`식재료 ID ${ingredientId}의 영양성분을 수정합니다.`);
        // TODO: 모달 열기 또는 수정 페이지로 이동
    };

    useEffect(() => {
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
        fetchIngredientList();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder]);

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <h2 className={styles.title}>식재료 관리</h2>
                
                <div className={styles.searchBox}>
                    <select
                        value={searchType}
                        onChange={e => setSearchType(e.target.value)}
                        className={styles.selectBox}
                    >
                        <option value="all">전체</option>
                        <option value="ingredientName">재료명</option>
                        <option value="categoryName">카테고리</option>
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
                            <th className={styles.noCol} onClick={() => handleSort("ingredientId")}>
                                No
                                <span className={`${styles.sortArrow} ${sortColumn === "ingredientId" ? styles.activeSort : ""}`}>
                                    {sortColumn === "ingredientId" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>
                            
                            <th className={styles.imageCol}>이미지</th>

                            <th className={styles.categoryCol} onClick={() => handleSort("category")}>
                                카테고리
                                <span className={`${styles.sortArrow} ${sortColumn === "category" ? styles.activeSort : ""}`}>
                                    {sortColumn === "category" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.ingredientNameCol} onClick={() => handleSort("name")}>
                                재료명
                                <span className={`${styles.sortArrow} ${sortColumn === "name" ? styles.activeSort : ""}`}>
                                    {sortColumn === "name" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.unitCol} onClick={() => handleSort("standardUnit")}>
                                기준단위
                                <span className={`${styles.sortArrow} ${sortColumn === "standardUnit" ? styles.activeSort : ""}`}>
                                    {sortColumn === "standardUnit" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("currentPrice")}>
                                현재가격
                                <span className={`${styles.sortArrow} ${sortColumn === "currentPrice" ? styles.activeSort : ""}`}>
                                    {sortColumn === "currentPrice" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.priceCol} onClick={() => handleSort("previousPrice")}>
                                이전가격
                                <span className={`${styles.sortArrow} ${sortColumn === "previousPrice" ? styles.activeSort : ""}`}>
                                    {sortColumn === "previousPrice" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.dateCol} onClick={() => handleSort("collectedDate")}>
                                최근 수집일
                                <span className={`${styles.sortArrow} ${sortColumn === "collectedDate" ? styles.activeSort : ""}`}>
                                    {sortColumn === "collectedDate" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
                            </th>

                            <th className={styles.nutritionCol}>영양성분</th>
                            
                            <th className={styles.statusCol} onClick={() => handleSort("statusYn")}>
                                활성상태
                                <span className={`${styles.sortArrow} ${sortColumn === "statusYn" ? styles.activeSort : ""}`}>
                                    {sortColumn === "statusYn" ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                                </span>
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
                                            <img 
                                                src={`/images/ingredients/${item.ingredientId}.jpg?t=${imgRefreshKey}`} 
                                                alt={item.name || 'ingredient'} 
                                                className={styles.ingredientImage}
                                                onError={handleImageError}
                                            />
                                            <label className={styles.imageChangeLabel}>
                                                [변경]
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    className={styles.fileInput}
                                                    onChange={(e) => handleImageUpload(item.ingredientId, e.target.files[0])}
                                                />
                                            </label>
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

                                    <td>{item.standardUnit || '1kg'}</td>
                                    
                                    <td>{item.currentPrice ? `${item.currentPrice.toLocaleString()}원` : '-'}</td>
                                    
                                    <td>
                                        {item.previousPrice ? `${item.previousPrice.toLocaleString()}원` : '-'}
                                        {item.previousCollectedDate && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                                ({new Date(item.previousCollectedDate).toLocaleDateString("ko-KR")})
                                            </div>
                                        )}
                                    </td>
                                    
                                    <td>
                                        {item.collectedDate ? new Date(item.collectedDate).toLocaleDateString("ko-KR") : 
                                         item.enrollDate ? new Date(item.enrollDate).toLocaleDateString("ko-KR") : "-"}
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
        </div>
    );
};

export default IngredientInfo;