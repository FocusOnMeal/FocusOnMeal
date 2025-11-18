import Sidebar from "../../components/admin/Sidebar";
import styles from "./MemberInfo.module.css";
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../components/common/Pagination";


const MemberInfo = () => {

    const [memberInfo, setMemberInfo] = useState([]);
    //const [searchParams, setSearchParams] = useSearchParams();
    
    // 페이지네이션
    const [pageInfo, setPageInfo] = useState(null);
    // const currentPage = parseInt(searchParams.get('page') || '1');
    const [currentPage, setCurrentPage] = useState(1);

    // api 요청용 검색
    const [fetchSearchType, setFetchSearchType] = useState('all'); 
    const [fetchSearchKeyword, setFetchSearchKeyword] = useState('');

    // 화면용 검색
    const [searchType, setSearchType] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

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
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then(() => {
            setMemberInfo(prev =>
                prev.map(m =>
                    m.memberId === member.memberId ? { ...m, adminYn: newGrade } : m
                )
            );
        })
        .catch(err => console.error(err));
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
                Authorization: `Bearer ${localStorage.getItem("token")}`
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

    // 페이지 변경 핸들러
    const changePage = page => {
        setSearchParams({page:page.toString()})
    }

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


    useEffect(() => {
        const fetchMemberInfo = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

            const params = {
                page : currentPage,
                type : fetchSearchType,
                keyword : fetchSearchKeyword
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
    }, [currentPage, fetchSearchType, fetchSearchKeyword]);

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
                            <th>아이디</th>
                            <th>닉네임</th>
                            <th>이름</th>
                            <th>전화번호</th>
                            <th>이메일</th>
                            <th>성별</th>
                            <th>가입일</th>
                            <th>회원등급</th>
                            <th>상태</th>
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
                        {memberInfo?.map((m, i) => (
                            <tr key={i}>
                                <td>{m.memberId}</td>
                                <td>{m.memberNickname}</td>
                                <td>{m.memberName}</td>
                                <td>{m.phone}</td>
                                <td>{m.email}</td>
                                <td>{m.gender}</td>
                                <td>{new Date(m.enrollDate).toLocaleDateString("ko-KR")}</td>
                                <td>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                        type="checkbox"
                                        checked={m.adminYn === "Y"}
                                        onChange={() => handleToggleAdminYn(m)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>

                                <td>
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
