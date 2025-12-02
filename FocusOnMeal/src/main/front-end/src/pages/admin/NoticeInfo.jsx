import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeInfo.module.css";
import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/common/Pagination";


const NoticeInfo = () => {

    // 페이지 이동용
    const navigate = useNavigate();

    const [noticeInfo, setNoticeInfo] = useState([]);

    // 페이지네이션
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // api 요청용 검색
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');

    // 화면용 검색
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 정렬기준 컬럼
    const [sortColumn, setSortColumn] = useState(null);

    // 정렬 순서
    const [sortOrder, setSortOrder] = useState("asc");

    // 뱃지 필터
    const [filterType, setFilterType] = useState("ALL"); 
    
    // 모달 선택 + 선택된 공지
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);

    // 제목 클릭 시 모달 열기
    const openModal = (notice) => {
        setSelectedNotice({...notice});
        setIsModalOpen(true);
    }

    // modal close
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotice(null);
    }

    // save modify
    const handleSave = () => {
        const token = sessionStorage.getItem("token");

        const payload = { ...selectedNotice };

        delete payload.noticeCreateAt;   // 날짜 제외
        delete payload.viewCount;       // 조회수 제외

        axios.patch(`/api/admin/noticeInfo/modify`, payload, {
            headers: { Authorization: `Bearer ${token}`}
        })
        .then(()=>{
            setNoticeInfo(prev => 
                prev.map(n=>
                    n.noticeNo === selectedNotice.noticeNo ? selectedNotice : n
                )
            );
            closeModal();
        })
        .catch(err => console.error(err));
    };

    // 공지 삭제
    const handleDelete = (noticeNo) => {
        if (!window.confirm("해당 공지사항을 삭제하시겠습니까?")) return;

        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        axios
            .delete(`/api/admin/noticeInfo/${noticeNo}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                // 삭제 성공 시, 화면 목록에서도 제거
                setNoticeInfo((prev) => prev.filter((n) => n.noticeNo !== noticeNo));
            })
            .catch((err) => {
                console.error(err);
                alert("공지사항 삭제 중 오류가 발생했습니다.");
            });
    };

    // 검색 핸들러
    const handleSearch = () =>{
        setCurrentPage(1);
        setFetchSearchType(searchType);
        setFetchSearchKeyword(searchKeyword);
    }

    // Enter 키로 검색
    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 정렬 핸들러
    const handleSort = (column) => {
        if (sortColumn === column) {
            // 같은 컬럼 클릭 → asc ↔ desc 토글
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // 새로운 컬럼 클릭 → 오름차순으로 초기화
            setSortColumn(column);
            setSortOrder("asc");
        }
        
    };

    // 필터 변경 핸들러
    const handleFilterChange = (type) => {
        setFilterType(type);   // ALL / NEW / IMPORTANT
        setCurrentPage(1);     // 필터 바꿀 때 페이지 1로
    };


    useEffect(() => {
        const fetchNoticeInfo = () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

            const params = {
                page: currentPage,
                type: fetchSearchType,
                keyword: fetchSearchKeyword,
                sortColumn,
                sortOrder,
                filterType
            }

            if(!params.keyword){
                params.type = 'all';
            }

                axios.get("/api/admin/noticeInfo", {
                    params : params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(res => {
                    console.log("[API 성공] 서버 응답:", res);
                    console.log("[API 성공] 받은 데이터:", res.data);
                    
                    setNoticeInfo(res.data.noticeList);
                    setPageInfo(res.data.pageInfo);
                })
                .catch(err => {
                    console.error("[API 실패] 에러 발생:", err);

                    // --- 서버로부터 응답이 온 경우 ---
                    // (예: 401, 403, 404, 500 에러)
                    if (err.response) {
                        console.error("[서버 응답 에러] 상세:", err.response);
                        console.error("[서버 응답 에러] 상태 코드:", err.response.status);
                        console.error("[서버 응답 에러] 서버 메시지:", err.response.data);
                    } 
                    // --- 서버로 요청은 갔으나 응답을 못 받은 경우 ---
                    // (예: 네트워크 오류, CORS, 타임아웃)
                    else if (err.request) {
                        console.error("[요청 에러] 응답을 받지 못함:", err.request);
                    } 
                    // --- 요청을 보내기 전 설정 단계에서 에러가 난 경우 ---
                    else {
                        console.error("[설정 에러] 요청 설정 중 오류:", err.message);
                    }
                });
        };
        fetchNoticeInfo(currentPage);
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn, sortOrder, filterType]);


    return (
        <div className={styles.container}>
            <Sidebar/>
            <div className={styles.main}>
                <h1>공지사항</h1>
                <div className={styles.controlsContainer}>
                    {/* NEW / 필독 버튼 필터 */}
                    <div className={styles.filterButtons}>
                        <button
                            className={`${styles.filterBtn} ${
                                filterType === "ALL" ? styles.activeFilter : ""
                            }`}
                            onClick={() => handleFilterChange("ALL")}
                        >
                            전체
                        </button>

                        <button
                            className={`${styles.filterBtn} ${
                                filterType === "NEW" ? styles.activeFilter : ""
                            }`}
                            onClick={() => handleFilterChange("NEW")}
                        >
                            NEW
                        </button>

                        <button
                            className={`${styles.filterBtn} ${
                                filterType === "IMPORTANT" ? styles.activeFilter : ""
                            }`}
                            onClick={() => handleFilterChange("IMPORTANT")}
                        >
                            필독!
                        </button>
                    </div>

                    
                    {/* 🔎 검색 UI */}
                    <div className={styles.searchBox}>
                        <select 
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className={styles.selectBox}
                        >
                            <option value="all">전체</option>
                            <option value="title">제목</option>
                            <option value="content">내용</option>
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
                <table className={styles.noticeTable}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("noticeNo")}>
                                번호
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "noticeNo" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                    ▲▼
                                </span>
                            </th>
                            <th onClick={() => handleSort("noticeSubject")}>
                                제목
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "noticeSubject" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                    ▲▼
                                </span>
                            </th>
                            <th>
                                작성자
                            </th>
                            <th onClick={() => handleSort("noticeCreateAt")}>
                                작성일
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "noticeCreateAt" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                    ▲▼
                                </span>
                            </th>
                            <th onClick={() => handleSort("viewCount")}>
                                조회수
                                <span className={`${styles.sortIcon} ${
                                    sortColumn === "viewCount" ? (sortOrder === "asc" ? styles.asc : styles.desc) : ""
                                }`}>
                                    ▲▼
                                </span>
                            </th>
                            <th>관리</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(noticeInfo) && noticeInfo.length > 0 ? (
                            noticeInfo.map((notice) => (
                                <tr key={notice.noticeNo}>
                                    <td>{notice.noticeNo}</td>

                                    <td className={styles.titleCol}>
                                        {/* 필독 */}
                                        {notice.noticeImportant === "Y" && (
                                            <span className={styles.badgeImportant}>필독 !</span>
                                        )}

                                        {/* NEW */}
                                        {notice.noticeImportant !== "Y" &&
                                            notice.noticeIsNew === "Y" && (
                                                <span className={styles.badgeIsNew}>NEW</span>
                                            )}

                                        <span 
                                            className={styles.subjectLink}
                                            onClick={() => navigate(`/board/notice/detail/${notice.noticeNo}`)}
                                        >
                                            {notice.noticeSubject}
                                        </span>
                                    </td>

                                    <td>{notice.memberId}</td>

                                    <td>
                                        {new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}
                                    </td>

                                    <td>{notice.viewCount}</td>

                                    <td>
                                        <div className={styles.btnGroup}>
                                            <button 
                                                className={styles.editBtn} 
                                                onClick={() => openModal(notice)}
                                            >
                                                수정
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(notice.noticeNo)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    등록된 공지사항이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className={styles.addBtnContainer}>
                    <button className={styles.addBtn}
                    onClick={() => navigate('/admin/noticeInfo/insert')}>
                        공지사항 추가 +
                    </button>
                </div>
                <Pagination
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modal */}
            {isModalOpen && selectedNotice && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>공지사항 수정</h2>

                        <label>제목</label>
                        <input
                            type="text"
                            value={selectedNotice.noticeSubject}
                            onChange={(e) =>
                                setSelectedNotice({ ...selectedNotice, noticeSubject: e.target.value })
                            }
                        />

                        <label>내용</label>
                        <textarea
                            value={selectedNotice.noticeContent}
                            onChange={(e) =>
                                setSelectedNotice({ ...selectedNotice, noticeContent: e.target.value })
                            }
                        />

                        {/* NEW 여부 토글 */}
                        <label>NEW 표시</label>
                        <button
                            className={
                                selectedNotice.noticeIsNew === "Y" 
                                ? styles.toggleOn 
                                : styles.toggleOff
                            }
                            onClick={() =>
                                setSelectedNotice({
                                    ...selectedNotice,
                                    noticeIsNew: selectedNotice.noticeIsNew === "Y" ? "N" : "Y"
                                })
                            }
                        >
                            {selectedNotice.noticeIsNew === "Y" ? "ON" : "OFF"}
                        </button>

                        {/* 필독 여부 토글 */}
                        <label>필독 여부</label>
                        <button
                            className={
                                selectedNotice.noticeImportant === "Y"
                                ? styles.toggleOn 
                                : styles.toggleOff
                            }
                            onClick={() =>
                                setSelectedNotice({
                                    ...selectedNotice,
                                    noticeImportant: selectedNotice.noticeImportant === "Y" ? "N" : "Y"
                                })
                            }
                        >
                            {selectedNotice.noticeImportant === "Y" ? "필독" : "일반"}
                        </button>

                        <div className={styles.modalButtons}>
                            <button onClick={handleSave} className={styles.saveBtn}>저장</button>
                            <button onClick={closeModal} className={styles.closeBtn}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeInfo;