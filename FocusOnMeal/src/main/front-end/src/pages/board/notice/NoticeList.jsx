import React, {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';
import styles from './noticeList.module.css';

const NoticeList = () => {
    const [importantList, setImportantList] = useState([]); // 필독 공지
    const [noticeList , setNoticeList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');

    // 정렬 파라미터 (기본값 설정)
    const sort = searchParams.get('sort') || 'noticeNo'; // 기본 정렬 컬럼
    const order = searchParams.get('order') || 'desc';   // 기본 정렬 방향

    useEffect(() => {
        const fetchNoticeList = () => {
            const Params = new URLSearchParams(searchParams);
            if(!Params.has('page')){
                Params.set('page','1');
            }
            
            fetch(`/api/board/notice/list?${Params.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setImportantList(data.importantList || []); 
                setNoticeList(data.list || []);
                setPageInfo(data.pi);
            })
            .catch(err => console.log(err))
        }

        fetchNoticeList();
    }, [searchParams]);

    const changePage = page => {
        setSearchParams(prev => {
            prev.set('page', page.toString());
            return prev;
        }, { replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => {
            prev.set(name, value);
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    };

    // 컬럼 정렬 핸들러
    const handleSort = (column) => {
        setSearchParams(prev => {
            const currentSort = prev.get('sortColumn');
            const currentOrder = prev.get('sortOrder') || 'desc';

            let newOrder = 'asc';

            // 같은 컬럼을 클릭한 경우에만 정렬 방향 토글 (asc <-> desc)
            // 다른 컬럼을 클릭하면 무조건 asc(오름차순) 혹은 desc(내림차순) 초기값으로 시작
            if (currentSort === column) {
                newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            } else {
                // 새로운 컬럼 클릭 시 기본 정렬 설정 (보통 최신순/높은순인 desc를 선호하면 desc로 설정)
                newOrder = 'desc'; 
            }

            prev.set('sortColumn', column);
            prev.set('sortOrder', newOrder);
            prev.set('page', '1'); // 정렬 변경 시 1페이지로 이동

            return prev;
        });
    };

    // 정렬 화살표 표시용 함수
    const renderSortIcon = (column) => {
        if (sort !== column) return <span style={{color: '#ccc', fontSize: '0.8em'}}> ↕</span>; // 정렬 안 된 상태 (회색)
        return <span style={{fontWeight: 'bold', color: '#333'}}> {order === 'asc' ? "▲" : "▼"}</span>; // 활성화 된 상태
    };

    // 정렬 가능한 헤더 스타일 (마우스 커서 포인터)
    const thStyle = { cursor: 'pointer', userSelect: 'none' };

    return(
        <>
            <div className={styles.container}>
                <div className={styles.main}>
                <h1>공지사항</h1>

                <form onSubmit={handleSearch} className ={styles.searchBox}>
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
                        className={styles.input}
                    />
                    <button type="submit" className={styles.searchBtn}>🔍</button>
                </form>

                <table className ={styles.noticeTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th onClick={() => handleSort('noticeSubject')} className={styles.sortable}>
                                제목 {renderSortIcon('noticeSubject')}
                            </th>
                            <th>작성자</th> 
                            <th onClick={() => handleSort('noticeCreateAt')} className={styles.sortable}>
                                작성일 {renderSortIcon('noticeCreateAt')}
                            </th>
                            <th onClick={() => handleSort('viewCount')} className={styles.sortable}>
                                조회수 {renderSortIcon('viewCount')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {importantList.map((notice) => (
                            <tr key={`imp-${notice.noticeNo}`} className={styles.importantRow} style={{backgroundColor: '#f9f9f9'}}>
                                <td>
                                    <span className={styles.badgeImportant}>필독</span>
                                </td>
                                <td style={{fontWeight: 'bold'}}>
                                    <Link to={`/board/notice/detail/${notice.noticeNo}`}>
                                        {notice.noticeSubject}
                                    </Link>
                                </td>
                                <td>관리자</td>
                                <td>{new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}</td>
                                <td>{notice.viewCount}</td>
                            </tr>
                        ))}
                        {noticeList.length > 0 ? (
                            noticeList.map((notice) => (
                                <tr key={notice.noticeNo}>
                                    <td>[공지]</td>
                                    <td>
                                        {/* 필독은 위에서 처리했으므로 여기선 NEW 뱃지만 체크 */}
                                        {notice.noticeIsnew === 'Y' && (
                                            <span className={styles.badgeNew}>NEW</span>
                                        )}
                                        <Link to={`/board/notice/detail/${notice.noticeNo}`}>
                                            {notice.noticeSubject}
                                        </Link>
                                    </td>
                                    <td>관리자</td>
                                    <td>{new Date(notice.noticeCreateAt).toLocaleDateString("ko-KR")}</td>
                                    <td>{notice.viewCount}</td>
                                </tr>
                                ))
                            ) : (
                                (importantList.length === 0 && noticeList.length === 0) && (
                                <tr>
                                    <td colSpan="5">등록된 공지사항이 없습니다.</td>
                                </tr>
                            )
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