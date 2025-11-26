import React, {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';
import styles from './SafetyList.module.css';

const SafetyAlertList = () => {
    const [alertList, setAlertList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1');

    // 정렬 파라미터 (기본값 설정)
    const sort = searchParams.get('sort') || 'alertId'; // 기본 정렬 컬럼
    const order = searchParams.get('order') || 'desc';   // 기본 정렬 방향

    useEffect(() => {
        const fetchAlertList = () => {
            const Params = new URLSearchParams(searchParams);
            if(!Params.has('page')){
                Params.set('page','1');
            }
            
            fetch(`/api/board/safety/list?${Params.toString()}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setAlertList(data.list || []);
                setPageInfo(data.pi);
            })
            .catch(err => console.log(err))
        }

        fetchAlertList();
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

            if (currentSort === column) {
                newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            } else {
                newOrder = 'desc'; 
            }

            prev.set('sortColumn', column);
            prev.set('sortOrder', newOrder);
            prev.set('page', '1');

            return prev;
        });
    };

    // 정렬 화살표 표시용 함수
    const renderSortIcon = (column) => {
        if (sort !== column) return <span style={{color: '#ccc', fontSize: '0.8em'}}> ↕</span>;
        return <span style={{fontWeight: 'bold', color: '#333'}}> {order === 'asc' ? "▲" : "▼"}</span>;
    };

    // 위험 유형별 뱃지 색상
    const getHazardTypeBadgeClass = (hazardType) => {
        if (hazardType === '위해식품정보') return styles.badgeDanger;
        if (hazardType === '글로벌 동향정보') return styles.badgeGlobal;
        return styles.badgeDefault;
    };

    return(
        <>
            <div className={styles.container}>
                <div className={styles.main}>
                <h1>안전 정보 뉴스</h1>

                <form onSubmit={handleSearch} className={styles.searchBox}>
                    <select 
                        name="type"
                        value={searchParams.get('type') || 'all'}
                        onChange={handleSearchChange}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="nation">국가</option>
                        <option value="hazardType">위험유형</option>
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

                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th onClick={() => handleSort('nation')} className={styles.sortable}>
                                공표 국가 {renderSortIcon('nation')}
                            </th>
                            <th onClick={() => handleSort('hazardType')} className={styles.sortable}>
                                위험 유형 {renderSortIcon('hazardType')}
                            </th>
                            <th onClick={() => handleSort('title')} className={styles.sortable}>
                                제목 {renderSortIcon('title')}
                            </th>
                            <th onClick={() => handleSort('publicationDate')} className={styles.sortable}>
                                공표일 {renderSortIcon('publicationDate')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertList.length > 0 ? (
                            alertList.map((alert, index) => (
                                <tr key={alert.alertId}>
                                    <td>{alert.alertId}</td>
                                    <td>{alert.nation}</td>
                                    <td>
                                        <span className={getHazardTypeBadgeClass(alert.hazardType)}>
                                            {alert.hazardType}
                                        </span>
                                    </td>
                                    <td className={styles.titleCell}>
                                        <Link to={`/safety/alert/detail/${alert.alertId}`}>
                                            {alert.title}
                                        </Link>
                                    </td>
                                    <td>
                                        {new Date(alert.publicationDate).toLocaleDateString("ko-KR")}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">등록된 안전 정보가 없습니다.</td>
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

export default SafetyAlertList;