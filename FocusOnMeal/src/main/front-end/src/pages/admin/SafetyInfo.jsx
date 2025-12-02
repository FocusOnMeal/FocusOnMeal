import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/common/Pagination';
import Sidebar from '../../components/admin/Sidebar';
import styles from './SafetyInfo.module.css';

const AdminSafetyList = () => {
    const [alertList, setAlertList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // API 요청용 검색
    const [fetchSearchType, setFetchSearchType] = useState('all');
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    
    // 화면용 검색
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    
    // 정렬 기준
    const [sortColumn, setSortColumn] = useState('publicationDate'); // 기본값을 publicationDate로 설정
    const [sortOrder, setSortOrder] = useState('desc'); // 기본값을 desc(최신순)로 설정
    
    // 위험 유형 필터
    const [showHazardDropdown, setShowHazardDropdown] = useState(false);
    const [hazardFilter, setHazardFilter] = useState('');
    
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();
    
    // 위험 유형 배열
    const hazardTypes = ['위해식품정보', '글로벌 동향정보', '연구평가정보', '법제도정보'];

    useEffect(() => {
        fetchAlertList();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder, hazardFilter]);

    const fetchAlertList = () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            console.error("JWT 토큰이 없습니다.");
            alert("로그인이 필요합니다.");
            return;
        }

        const params = {
            page: currentPage,
            type: fetchSearchType,
            keyword: fetchSearchKeyword,
            sortColumn,
            sortOrder,
            hazardFilter  // 위험 유형 필터 추가
        };

        if (!params.keyword) {
            params.type = 'all';
        }

        axios.get("/api/admin/safetyInfo/list", {
            params: params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log("[API 성공] 서버 응답:", res);
            console.log("[API 성공] 받은 데이터:", res.data);
            
            setAlertList(res.data.list || []);
            setPageInfo(res.data.pi);
        })
        .catch(err => {
            console.error("[API 실패] 에러 발생:", err);

            if (err.response) {
                console.error("[서버 응답 에러] 상세:", err.response);
                console.error("[서버 응답 에러] 상태 코드:", err.response.status);
                console.error("[서버 응답 에러] 서버 메시지:", err.response.data);
                
                if (err.response.status === 403) {
                    alert('관리자 권한이 필요합니다.');
                }
            } else if (err.request) {
                console.error("[요청 에러] 응답을 받지 못함:", err.request);
            } else {
                console.error("[설정 에러] 요청 설정 중 오류:", err.message);
            }
        });
    };

    // 검색 핸들러
    const handleSearch = () => {
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
    };

    // Enter 키로 검색
    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 정렬 핸들러
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(alertList.map(alert => alert.alertId));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (alertId) => {
        setSelectedItems(prev => {
            if (prev.includes(alertId)) {
                return prev.filter(id => id !== alertId);
            } else {
                return [...prev, alertId];
            }
        });
    };

    const handleDelete = async () => {
        if (selectedItems.length === 0) {
            alert('삭제할 항목을 선택해주세요.');
            return;
        }

        if (!window.confirm(`선택한 ${selectedItems.length}개의 항목을 삭제하시겠습니까?`)) {
            return;
        }

        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        try {
            await axios.delete('/api/admin/safetyInfo/delete', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { alertIds: selectedItems }
            });

            alert('삭제되었습니다.');
            setSelectedItems([]);
            fetchAlertList();
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // 위험 유형 필터 적용
    const handleHazardFilter = (type) => {
        if (hazardFilter === type) {
            // 같은 필터 클릭시 해제
            setHazardFilter('');
        } else {
            setHazardFilter(type);
        }
        setCurrentPage(1);
        setShowHazardDropdown(false);
    };

    const getHazardTypeBadgeClass = (hazardType) => {
        if (hazardType === '위해식품정보') return styles.badgeDanger;
        if (hazardType === '글로벌 동향정보') return styles.badgeGlobal;
        if (hazardType === '연구평가정보') return styles.badgeResearch;
        if (hazardType === '법제도정보') return styles.badgeLaw;
        return styles.badgeDefault;
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                <h1>안전정보 뉴스 관리</h1>
                
                <div className={styles.controlsContainer}>
                    {/* 검색 UI */}
                    <div className={styles.searchBox}>
                        <select 
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className={styles.selectBox}
                        >
                            <option value="all">전체</option>
                            <option value="title">제목</option>
                            <option value="nation">국가</option>
                            <option value="hazardType">위험유형</option>
                        </select>

                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={handleSearchOnEnter}
                            className={styles.searchInput}
                        />

                        <button 
                            onClick={handleSearch}
                            className={styles.searchBtn}
                        >
                            검색
                        </button>
                    </div>
                </div>

                <div className={styles.actionBar}>
                    <button 
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={selectedItems.length === 0}
                    >
                        선택 삭제 ({selectedItems.length})
                    </button>
                    
                    <button 
                        className={styles.addBtn}
                        onClick={() => navigate('/admin/safetyInfo/register')}
                    >
                        안전정보 추가 +
                    </button>
                </div>

                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={alertList.length > 0 && selectedItems.length === alertList.length}
                                />
                            </th>
                            <th className={styles.sortable}
                                onClick={() => handleSort("alertId")}>
                                번호
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "alertId" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                </span>
                            </th>
                            <th>
                                공표 국가
                            </th>
                            <th className={styles.filterHeader}>
                                <div className={styles.filterWrapper}>
                                    <button 
                                        type="button"
                                        className={styles.filterButton}
                                        onClick={() => setShowHazardDropdown(!showHazardDropdown)}
                                    >
                                        위험 유형
                                        {hazardFilter && <span className={styles.activeFilter}> ({hazardFilter})</span>}
                                        <span className={styles.dropdownIcon}> ▼</span>
                                    </button>
                                    {showHazardDropdown && (
                                        <div className={styles.dropdownMenu}>
                                            <div className={styles.dropdownHeader}>
                                                유형 선택
                                                {hazardFilter && (
                                                    <button 
                                                        className={styles.resetButton}
                                                        onClick={() => handleHazardFilter(hazardFilter)}
                                                    >
                                                        초기화
                                                    </button>
                                                )}
                                            </div>
                                            <div className={styles.typeList}>
                                                {hazardTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`${styles.typeButton} ${hazardFilter === type ? styles.active : ''}`}
                                                        onClick={() => handleHazardFilter(type)}
                                                    >
                                                        <span className={getHazardTypeBadgeClass(type)}></span>
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th>제목</th>
                            <th className={styles.sortable}
                                onClick={() => handleSort("publicationDate")}>
                                공표일
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "publicationDate" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                </span>
                            </th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(alertList) && alertList.length > 0 ? (
                            alertList.map((alert) => (
                                <tr key={alert.alertId}>
                                    <td>
                                        <input 
                                            type="checkbox"
                                            checked={selectedItems.includes(alert.alertId)}
                                            onChange={() => handleSelectItem(alert.alertId)}
                                        />
                                    </td>
                                    <td>{alert.alertId}</td>
                                    <td>{alert.nation}</td>
                                    <td>
                                        <span className={getHazardTypeBadgeClass(alert.hazardType)}>
                                            {alert.hazardType}
                                        </span>
                                    </td>
                                    <td className={styles.titleCell}>
                                        {alert.title}
                                    </td>
                                    <td>
                                        {new Date(alert.publicationDate).toLocaleDateString("ko-KR")}
                                    </td>
                                    <td>
                                        <div className={styles.btnGroup}>
                                            <button 
                                                className={styles.editBtn}
                                                onClick={() => navigate(`/admin/safetyInfo/update/${alert.alertId}`)}
                                            >
                                                수정
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>
                                    등록된 안전 정보가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <Pagination
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={(page) => setCurrentPage(page)}
                />
            </div>
        </div>
    );
};

export default AdminSafetyList;