import Sidebar from "../../components/admin/Sidebar";
import Pagination from "../../components/common/Pagination";
import styles from "./MemberInfo.module.css";
import { useState, useEffect } from 'react';
import axios from "axios";

const MemberInfo = () => {

    const [memberInfo, setMemberInfo] = useState([]);
    
    // 페이지네이션
    const [pageInfo, setPageInfo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // api 요청용 검색
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');

    // 화면용 검색
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 정렬 기준 컬럼
    const [sortColumn, setSortColumn] = useState(null);
    // 정렬 순서(오름차순, 내림차순)
    const [sortOrder, setSortOrder] = useState("asc");

    // 회원 등급 변경 토글
    const handleToggleAdminYn = (member) => {
        const newGrade = member.adminYn === "Y" ? "N" : "Y";
        console.log("클릭된 member:", member);
        console.log("계산된 newGrade:", newGrade)

        axios.patch(`/api/admin/memberInfo/adminYn`, null, {
            params: {
                memberId: member.memberId,
                adminYn: newGrade
            },
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        })
        .then((res) => {
            // 서버에서 새 닉네임 받기
            const newNickname = res.data.newNickname;
            console.log("서버로부터 받은 새 닉네임:", newNickname);
            setMemberInfo(prev =>
                prev.map(m =>
                    m.memberId === member.memberId ? { ...m, adminYn: newGrade, memberNickname: newNickname } : m
                )
            );
        })
        .catch(err => {
            console.error("등급 변경 실패:", err);
            alert("등급 변경 중 오류가 발생했습니다.");
        });
    };

    // 회원 상태 변경 토글
    const handleToggleStatus = (member) => {
        const newStatus = member.statusYn === "Y" ? "N" : "Y";

        axios.patch(`/api/admin/memberInfo/status`, null, {
            params: {
                memberId: member.memberId,
                statusYn: newStatus
            },
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`
            }
        })
        .then(() => {
            setMemberInfo(prev =>
                prev.map(m =>
                    m.memberId === member.memberId ? { ...m, statusYn: newStatus} : m
                )
            );
        })
        .catch(err => console.error(err));
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
    
    useEffect(() => {
        const fetchMemberInfo = () => {
            const token = sessionStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

            const params = {
                page : currentPage,
                type : fetchSearchType,
                keyword : fetchSearchKeyword,
                sortColumn,
                sortOrder
            };
            if (!params.keyword){
                params.type = 'all';
            }

                axios.get("/api/admin/memberInfo", {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(res => {
                    console.log("[API 성공] 서버 응답:", res);
                    console.log("[API 성공] 받은 데이터:", res.data);
                    
                    setMemberInfo(res.data.memberList);
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
        fetchMemberInfo(currentPage);
    }, [currentPage, fetchSearchType, fetchSearchKeyword, sortColumn,sortOrder]);

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <h2 className={styles.title}>회원 관리</h2>
                <div className={styles.searchBox}>
                    <select
                        value={searchType}
                        onChange={e => setSearchType(e.target.value)}
                        className={styles.selectBox}
                        >
                            <option value="all">전체</option>
                            <option value="memberId">아이디</option>
                            <option value="memberName">이름</option>
                            <option value="memberNickname">닉네임</option>
                        </select>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
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
                <table className={styles.memberTable}>
                    <thead>
                        <tr>
                            <th className={styles.idCol} onClick={() => handleSort("memberId")}>
                                아이디 
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "memberId" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "memberId" 
                                    ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.nicknameCol} onClick={() => handleSort("memberNickname")}>
                                닉네임
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "memberNickname" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "memberNickname" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.nameCol} onClick={() => handleSort("memberName")}>
                                이름
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "memberName" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "memberName" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.phoneCol} onClick={() => handleSort("phone")}>
                                전화번호
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "phone" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "phone" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.emailCol} onClick={() => handleSort("email")}>
                                이메일
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "email" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "email" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.genderCol} onClick={() => handleSort("gender")}>
                                성별
                                <span className={`${styles.sortArrow} ${sortColumn === "gender" ? styles.activeSort : ""}`}>
                                    {sortColumn === "gender" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                            <th className={styles.dateCol} onClick={() => handleSort("enrollDate")}>
                                가입일
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "enrollDate" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "enrollDate" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>
                            <th className={styles.gradeCol} onClick={() => handleSort("adminYn")}>
                                등급
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "adminYn" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "adminYn" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>
                            <th className={styles.statusCol} onClick={() => handleSort("statusYn")}>
                                상태
                                <span className={`${styles.sortArrow} ${
                                    sortColumn === "statusYn" ? styles.activeSort : ""
                                }`}>
                                    {sortColumn === "statusYn" ? (sortOrder === "asc" ? "▲" : "▼") : "▲▼"}
                                </span>
                            </th>

                        </tr>
                    </thead>

                    <tbody>
                        {/* 검색 결과 없을 때 */}
                        {memberInfo?.length === 0 && (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        {memberInfo.map((m, i) => (
                            <tr key={i}>
                                <td className={styles.idCol}>{m.memberId}</td>
                                <td>
                                    <span className={styles.nicknameWrapper}>
                                        <span className={styles.truncatedText}>
                                            {m.memberNickname}
                                        </span>
                                        <span className={styles.nicknameTooltip}>
                                            {m.memberNickname}
                                        </span>
                                    </span>
                                </td>
                                <td className={styles.nameCol}>{m.memberName}</td>
                                <td className={styles.phoneCol}>{m.phone}</td>
                                <td className={styles.emailCol}>{m.email}</td>
                                <td className={styles.genderCol}>{m.gender}</td>
                                <td className={styles.dateCol}>{new Date(m.enrollDate).toLocaleDateString("ko-KR")}</td>
                                <td className={styles.toggle}>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                        type="checkbox"
                                        checked={m.adminYn === "Y"}
                                        onChange={() => handleToggleAdminYn(m)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>

                                <td className={styles.toggle}>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                        type="checkbox"
                                        checked={m.statusYn === "Y"}
                                        onChange={() => handleToggleStatus(m)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>

                            </tr>
                        ))}
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

export default MemberInfo;
