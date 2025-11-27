import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './SafetyAlert.module.css';
import Sidebar from '../../components/mypage/Sidebar';
import Pagination from '../../components/common/Pagination';
import axios from 'axios';

const SafetyAlert = () => {

    // 1. 데이터 상태 관리
    const [alertList, setAlertList] = useState([]);
    
    // 2. 유저 알림 설정 상태
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false); // 전체 알림 ON/OFF
    const [subscribedIngredients, setSubscribedIngredients] = useState([]); // 개별 구독 중인 식자재 목록

    // 페이지네이션 & 검색 & 정렬 상태
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortColumn, setSortColumn] = useState("alertId");
    const [sortOrder, setSortOrder] = useState("desc");

    const handleSearch = () =>{
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
    }

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // 알림 수신 여부 토글 핸들러
    const handleToggleNotification = async () => {
        const token = localStorage.getItem("token");
        const newValue = !isNotificationEnabled;

        try {
            await axios.patch("/api/mypage/settings/safetyAlert/toggle", 
                { notificationEnabled: newValue ? 'Y' : 'N' }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsNotificationEnabled(newValue);
            if (newValue) {
                alert("모든 안전 알림을 수신합니다.");
            } else {
                alert("전체 알림이 해제되었습니다.\n(관심 식자재 알림은 계속 수신됩니다.)");
            }
        } catch (err) {
            console.error("설정 변경 실패:", err);
            alert("설정 변경에 실패했습니다.");
        }
    };

    // 데이터 조회
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const res = await axios.get("/api/mypage/settings/safetyAlert", {
                    params: {
                        page: currentPage,
                        type: fetchSearchType,
                        keyword: fetchSearchKeyword,
                        sortColumn,
                        sortOrder
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // response 구조에 맞게 저장
                setAlertList(res.data.alertList);
                setPageInfo(res.data.pageInfo);
                setIsNotificationEnabled(res.data.userSetting === "Y");
                setSubscribedIngredients(res.data.subscribedIngredients);

            } catch (err) {
                console.error("안전 정보 조회 실패:", err);
            }
        };

        fetchAlerts();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder]);

    return(
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.main}>
                
                {/* 상단 설정 영역 */}
                <div className={styles.settingsCard}>
                    <div className={styles.settingHeader}>
                        <div>
                            <h2 className={styles.settingTitle}>안전 알림 설정</h2>
                            <p className={styles.settingDesc}>
                                {isNotificationEnabled 
                                    ? "현재 모든 위해 식자재 정보를 수신하고 있습니다."
                                    : "전체 알림이 꺼져 있습니다. 관심 식자재 정보만 수신합니다."}
                            </p>
                        </div>
                        
                        {/* 토글 스위치 */}
                        <div className={styles.toggleWrapper}>
                            <span className={styles.toggleLabel}>전체 알림</span>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={isNotificationEnabled}
                                    onChange={handleToggleNotification}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {/* 개별 구독 정보 */}
                    {!isNotificationEnabled && (
                        <div className={styles.subscriptionBox}>
                            <span className={styles.subTitle}>🔔 수신 중인 관심 식자재:</span>
                            {subscribedIngredients.length > 0 ? (
                                <div className={styles.tagContainer}>
                                    {subscribedIngredients.map((ing) => (
                                        <Link 
                                            key={ing.ingredientId} 
                                            to={`/ingredient/detail/${ing.ingredientId}`}
                                            className={styles.ingredientTag}
                                        >
                                            {ing.ingredientName}
                                        </Link>
                                    ))}
                                    <Link to="/ingredient/list" className={styles.addTagBtn}>+ 추가</Link>
                                </div>
                            ) : (
                                <span className={styles.emptyText}>
                                    수신 중인 식자재가 없습니다. 식자재 상세페이지에서 알림을 설정해보세요.
                                </span>
                            )}
                        </div>
                    )}
                </div>


                {/* 검색 및 리스트 영역 */}
                <div className={styles.contentHeader}>
                    <h3 className={styles.listTitle}>지난 알림 내역</h3>
                    <div className={styles.searchBox}>
                        <select
                            value={searchType}
                            onChange={e => setSearchType(e.target.value)}
                            className={styles.selectBox}
                        >
                            <option value="all">전체</option>
                            <option value="title">제목</option>
                            <option value="nation">국가</option>
                            <option value="hazard">위해 유형</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색어 입력"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                            onKeyDown={handleSearchOnEnter}
                            className={styles.searchInput}
                        />
                        <button onClick={handleSearch} className={styles.searchBtn}>검색</button>
                    </div>
                </div>

                {/* 테이블 */}
                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th className={styles.idCol} onClick={() => handleSort("alertId")}>
                                No. <span className={styles.sortArrow}>{sortColumn === "alertId" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.nationCol} onClick={() => handleSort("nation")}>
                                국가 <span className={styles.sortArrow}>{sortColumn === "nation" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.hazardCol} onClick={() => handleSort("hazardType")}>
                                위해 유형 <span className={styles.sortArrow}>{sortColumn === "hazardType" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.titleCol} onClick={() => handleSort("title")}>
                                제목 (내용) <span className={styles.sortArrow}>{sortColumn === "title" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.dateCol} onClick={() => handleSort("publicationDate")}>
                                발행일 <span className={styles.sortArrow}>{sortColumn === "publicationDate" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                            <th className={styles.linkCol}>원문</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertList?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.emptyRow}>알림 내역이 없습니다.</td>
                            </tr>
                        ) : (
                            alertList.map((alert) => (
                                <tr key={alert.alertId}>
                                    <td>{alert.alertId}</td>
                                    <td>{alert.nation}</td>
                                    <td><span className={styles.badgeHazard}>{alert.hazardType}</span></td>
                                    <td className={styles.alignLeft}>{alert.title}</td>
                                    <td>{alert.publicationDate ? new Date(alert.publicationDate).toLocaleDateString("ko-KR") : "-"}</td>
                                    <td>
                                        {alert.originalUrl ? (
                                            <a href={alert.originalUrl} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>이동</a>
                                        ) : "-"}
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
            </div>
        </div>
    )
}
export default SafetyAlert;