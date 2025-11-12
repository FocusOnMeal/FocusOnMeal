import React, {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';

const NoticeList = () => {
    const [noticeList , setNoticeList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');

    // searchParams 가 변경(검색, 이동)될 때마다 데이터 리로드
    useEffect(() => {
        const fetchNoticeList = () => {

            const Params = new URLSearchParams(searchParams);
            if(!Params.has('page')){
                Params.set('page','1');
            }
        fetch(`/board/notice/list?${Params.toString()}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setNoticeList(data.list);
            setPageInfo(data.pi);

        })
        .catch(err => console.log(err))
    }

        fetchNoticeList();
    },[searchParams]);

    const changePage = page => {
        setSearchParams(prev => {
            prev.set('page', page.toString());
            return prev;
        }, { replace: true }); // 브라우저 히스토리 스택에 쌓이지 않게
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            prev.set('page', '1'); // 검색 시 1페이지로 리셋
            return prev;
        }, { replace: true });
    };

    // <input>, <select>의 변경을 searchParams에 바로 반영
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => {
            prev.set(name, value);
            // 검색 조건 변경 시 1페이지로 리셋
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    return(
        <>
            <div className="container">
                {/* 사이드바 */}
                <aside className="sidebar">
                    <ul>
                        <li><Link to="/ingredient/list">식자재</Link></li>
                        <li><Link to="/meal/mealAI">식단</Link></li>
                        <li><Link to="/safety/list">안전정보</Link></li>
                        <li><Link to="/notice/list" className="active">공지사항</Link></li>
                    </ul>
                </aside>

                {/* 메인 영역 */}
                <div className="main">
                    <h1>공지사항</h1>

                {/* 검색영역 */}
                <form onSubmit={handleSearch} className ="search-box">
                    <select 
                        name="type"
                        value={searchParams.get('type') || 'all'}
                        onChange={handleSearchChange}
                    >
                        <option value="all">제목+내용</option>
                        <option value="title">제목</option>
                        <option value="content">내용</option>
                    </select>
                    <input 
                        type="text" 
                        name="keyword" 
                        placeholder="검색어를 입력하세요."
                        value={searchParams.get('keyword') || ''}
                        onChange={handleSearchChange}
                    />
                    <button type="submit">🔍</button>
                </form>

                {/* 공지사항 테이블 */}
                <table className ="notice-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.length > 0 ? (
                            noticeList.map((notice) => (
                                <tr key={notice.noticeNo}>
                                    <td>{notice.noticeNo}</td>
                                    <td>
                                        {/* 1. 필독 뱃지 (최우선) */}
                                        {notice.noticeImportant === 'Y' && (
                                            <span className="badge badge-important">필독</span>
                                        )}

                                        {/* 2. NEW 뱃지 (필독이 아니고 신규가 Y값일 때 표시) */}
                                        {notice.noticeImportant !== 'Y' && notice.noticeIsnew === 'Y' && (
                                            <span className="badge badge-new">NEW</span>
                                        )}

                                        <Link to={`/notice/detail?no=${notice.noticeNo}`}>
                                            {notice.noticeSubject}
                                        </Link>
                                    </td>
                                    <td>{notice.memberId}</td>
                                    <td>
                                        {new Date(notice.noticeCreateat).toLocaleDateString(
                                            "ko-KR"
                                        )}
                                    </td>
                                    <td>{notice.viewCount}</td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">등록된 공지사항이 없습니다.</td>
                                </tr>
                        )}
                    </tbody>
                </table>
                <Pagination
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    changePage={changePage}
                />
            </div>
        </div>
        </>
    );
};

export default NoticeList;