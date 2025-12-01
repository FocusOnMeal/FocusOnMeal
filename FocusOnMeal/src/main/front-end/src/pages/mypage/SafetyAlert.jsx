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
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [subscribedIngredients, setSubscribedIngredients] = useState([]);

    // 3. 체크박스 선택 상태
    const [selectedIds, setSelectedIds] = useState([]);

    // 읽음 상태 필터
    const [filterReadStatus, setFilterReadStatus] = useState('all');

    // 페이지네이션 & 검색 & 정렬 상태
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [sortColumn, setSortColumn] = useState("sentAt");
    const [sortOrder, setSortOrder] = useState("desc");

    // 선택 모드인지 확인하는 변수
    const isSelectionMode = selectedIds.length > 0;

    // 탭 활성화 스타일 도우미 함수
    const getTabClass = (status) => 
        filterReadStatus === status ? styles.activeTab : styles.inactiveTab;

    const handleSearch = () =>{
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
        setSelectedIds([]);
    }

    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleReadStatusChange = (e) => {
        setFilterReadStatus(e.target.value);
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    const handleToggleNotification = async () => {
        const token = sessionStorage.getItem("token");
        const newValue = !isNotificationEnabled;

        try {
            await axios.patch("/api/mypage/settings/safetyAlert/toggle", 
                { notificationEnabled: newValue ? 'Y' : 'N' }, {
                headers: { Authorization: `Bearer ${token}` }
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

    // === 체크박스 로직 ===
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = alertList.map((alert) => alert.notificationId);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // === 일괄 / 개별 처리 로직 ===
    const handleMarkAsRead = async (ids) => {
        if (!ids || ids.length === 0) return;
        
        try {
            const token = sessionStorage.getItem("token");
            await Promise.all(ids.map(id => 
                axios.patch(`/api/mypage/settings/safetyAlert/${id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            if (filterReadStatus === 'N') {
                await fetchAlerts(); 
            } else {
                setAlertList(prev => prev.map(item => 
                    ids.includes(item.notificationId) ? { ...item, isRead: 'Y' } : item
                ));
            }
            
            if (ids.length > 1) {
                setSelectedIds([]);
                alert("선택한 알림을 읽음 처리했습니다.");
            }

        } catch (err) {
            console.error("읽음 처리 실패:", err);
            alert("읽음 처리에 실패했습니다.");
        }
    };

    const handleDelete = async (ids) => {
        if (!ids || ids.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        if (!window.confirm(`${ids.length}개의 알림을 삭제하시겠습니까?`)) return;

        try {
            const token = sessionStorage.getItem("token");
            await Promise.all(ids.map(id => 
                axios.delete(`/api/mypage/settings/safetyAlert/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            alert("삭제되었습니다.");
            fetchAlerts(); // 삭제 후 목록 갱신

        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제에 실패했습니다.");
        }
    };

    useEffect(() => {
        console.log("alertList:", alertList);
    }, [alertList]);

    const fetchAlerts = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const res = await axios.get("/api/mypage/settings/safetyAlert", {
                params: {
                    page: currentPage,
                    type: fetchSearchType,
                    keyword: fetchSearchKeyword,
                    sortColumn,
                    sortOrder,
                    readStatus: filterReadStatus
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setAlertList(res.data.alertList);
            setPageInfo(res.data.pageInfo);
            setIsNotificationEnabled(res.data.userSetting === "Y");
            setSubscribedIngredients(res.data.subscribedIngredients);
            setSelectedIds([]);

        } catch (err) {
            console.error("안전 정보 조회 실패:", err);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder, filterReadStatus]);

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

                <div className={`${styles.toolbar} ${isSelectionMode ? styles.activeToolbar : ''}`}>
                    
                    {isSelectionMode ? (
                        // [Mode 1: 선택되었을 때 - 액션 모드]
                        <div className={styles.actionHeader}>
                            <div className={styles.selectionInfo}>
                                <span className={styles.selectionCount}>
                                    {selectedIds.length}개 선택됨
                                </span>
                                <button 
                                    className={styles.clearSelectionBtn} 
                                    onClick={() => setSelectedIds([])}
                                >
                                    선택 해제
                                </button>
                            </div>
                            
                            <div className={styles.actionButtons}>
                                <button 
                                    className={styles.contextBtn} 
                                    onClick={() => handleMarkAsRead(selectedIds)}
                                    title="읽음 처리"
                                >
                                    📩 읽음 처리
                                </button>
                                <button 
                                    className={`${styles.contextBtn} ${styles.deleteBtn}`} 
                                    onClick={() => handleDelete(selectedIds)}
                                    title="삭제"
                                >
                                    🗑️ 삭제
                                </button>
                            </div>
                        </div>
                    ) : (
                        // [Mode 2: 평상시 - 검색 및 필터 모드]
                        <div className={styles.defaultHeader}>
                            {/* 탭 메뉴 (읽음 상태 필터) */}
                            <div className={styles.tabGroup}>
                                <button 
                                    className={getTabClass('all')} 
                                    onClick={() => handleReadStatusChange({target: {value: 'all'}})}
                                >
                                    전체
                                </button>
                                <button 
                                    className={getTabClass('N')} 
                                    onClick={() => handleReadStatusChange({target: {value: 'N'}})}
                                >
                                    안 읽음
                                </button>
                                <button 
                                    className={getTabClass('Y')} 
                                    onClick={() => handleReadStatusChange({target: {value: 'Y'}})}
                                >
                                    읽음
                                </button>
                            </div>

                            {/* 검색창 */}
                            <div className={styles.searchBox}>
                                <select
                                    value={searchType}
                                    onChange={e => setSearchType(e.target.value)}
                                    className={styles.selectBox} // 또는 styles.minimalSelect
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
                                    className={styles.searchInput} // 또는 styles.minimalInput
                                />
                                <button onClick={handleSearch} className={styles.searchBtn}>검색</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 테이블 */}
                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th className={styles.checkCol}>
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll}
                                    checked={alertList.length > 0 && selectedIds.length === alertList.length}
                                />
                            </th>
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
                            <th className={styles.dateCol} onClick={() => handleSort("sentAt")}>
                                수신일 <span className={styles.sortArrow}>{sortColumn === "sentAt" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertList?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className={styles.emptyRow}>알림 내역이 없습니다.</td>
                            </tr>
                        ) : (
                            alertList.map((alert) => (
                                <tr key={alert.notificationId} className={alert.isRead === 'Y' ? styles.readRow : styles.unreadRow}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            onChange={() => handleSelectOne(alert.notificationId)}
                                            checked={selectedIds.includes(alert.notificationId)}
                                        />
                                    </td>
                                    <td>{alert.notificationId}</td>
                                    <td>{alert.nation}</td>
                                    <td><span className={styles.badgeHazard}>{alert.hazardType}</span></td>
                                    <td>
                                        {alert.originalUrl ? (
                                            <a 
                                                href={alert.originalUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.titleLink}
                                            >
                                                {alert.title}
                                            </a>
                                        ) : (
                                            <span>{alert.title}</span>
                                        )}
                                    </td>
                                    <td>
                                        {alert.publicationDate 
                                            ? new Date(alert.publicationDate).toLocaleDateString("ko-KR") 
                                            : "-"}
                                    </td>
                                    <td>
                                        {alert.sentAt 
                                            ? new Date(alert.sentAt).toLocaleDateString("ko-KR") 
                                            : "-"}
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