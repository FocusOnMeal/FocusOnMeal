import React, {useState, useEffect, useRef} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';
import styles from './SafetyList.module.css';
import Footer from '../../../components/common/Footer';

const SafetyAlertList = () => {
    const [alertList, setAlertList] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
    const currentPage = parseInt(searchParams.get('page') || '1');

    // 드롭다운 상태
    const [showNationDropdown, setShowNationDropdown] = useState(false);
    const [showHazardDropdown, setShowHazardDropdown] = useState(false);
    const nationDropdownRef = useRef(null);
    const hazardDropdownRef = useRef(null);

    // 정렬 파라미터 (기본값 설정)
    const sort = searchParams.get('sort') || 'alertId';
    const order = searchParams.get('order') || 'desc';

    // 필터 파라미터
    const nationFilter = searchParams.get('nationFilter') || '';
    const hazardFilter = searchParams.get('hazardFilter') || '';

    // 국가 초성 배열
    const nationInitials = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    
    // 위험 유형 배열
    const hazardTypes = ['위해식품정보', '글로벌 동향정보', '연구평가정보', '법제도정보'];

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (nationDropdownRef.current && !nationDropdownRef.current.contains(event.target)) {
                setShowNationDropdown(false);
            }
            if (hazardDropdownRef.current && !hazardDropdownRef.current.contains(event.target)) {
                setShowHazardDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                setKeyword(searchParams.get('keyword') || '');
                setSearchType(searchParams.get('type') || 'all');
            })
            .catch(err => console.log(err))
        }

        fetchAlertList();
    }, [searchParams]);

    const changePage = page => {
        setSearchParams(prev => {
            const Params = new URLSearchParams(prev);
            Params.set('page', page.toString());
            return Params;
        }, { replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            const Params = new URLSearchParams(prev);
            Params.set('type', searchType);
            Params.set('keyword', keyword);
            Params.set('page', '1');
            return Params;
        }, { replace: true });
    };

    const handleKeywordChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleTypeChange = (e) => {
        setSearchType(e.target.value);
    };

    // 국가 필터 적용
    const handleNationFilter = (initial) => {
        setSearchParams(prev => {
            const Params = new URLSearchParams(prev);
            if (nationFilter === initial) {
                // 같은 필터 클릭시 해제
                Params.delete('nationFilter');
            } else {
                Params.set('nationFilter', initial);
            }
            Params.set('page', '1');
            return Params;
        }, { replace: true });
        setShowNationDropdown(false);
    };

    // 위험 유형 필터 적용
    const handleHazardFilter = (type) => {
        setSearchParams(prev => {
            const Params = new URLSearchParams(prev);
            if (hazardFilter === type) {
                // 같은 필터 클릭시 해제
                Params.delete('hazardFilter');
            } else {
                Params.set('hazardFilter', type);
            }
            Params.set('page', '1');
            return Params;
        }, { replace: true });
        setShowHazardDropdown(false);
    };

    // 컬럼 정렬 핸들러
    const handleSort = (column) => {
        setSearchParams(prev => {
            const Params = new URLSearchParams(prev);
            const currentSort = Params.get('sortColumn');
            const currentOrder = Params.get('sortOrder') || 'desc';

            let newOrder = 'asc';

            if (currentSort === column) {
                newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            } else {
                newOrder = 'desc'; 
            }

            Params.set('sortColumn', column);
            Params.set('sortOrder', newOrder);
            Params.set('page', '1');

            return Params;
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
        if (hazardType === '연구평가정보') return styles.badgeResearch;
        if (hazardType === '법제도정보') return styles.badgeLaw;
        return styles.badgeDefault;
    };

    return(
        <>
            <div className={styles.container}>
                <div className={styles.main}>
                <h1 className={styles.title}>안전 정보 뉴스</h1>

                <form onSubmit={handleSearch} className={styles.searchBox}>
                    <select
                        name="type"
                        value={searchType}
                        onChange={handleTypeChange}
                        className={styles.select}
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
                        value={keyword}
                        onChange={handleKeywordChange}
                        className={styles.input}
                    />
                    <button type="submit" className={styles.searchBtn}>검색</button>
                </form>

                <table className={styles.alertTable}>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th className={styles.filterHeader}>
                                <div className={styles.filterWrapper} ref={nationDropdownRef}>
                                        공표 국가 
                                        {nationFilter && <span className={styles.activeFilter}>({nationFilter})</span>}
                                    {showNationDropdown && (
                                        <div className={styles.dropdownMenu}>
                                            <div className={styles.dropdownHeader}>
                                                초성 선택
                                                {nationFilter && (
                                                    <button 
                                                        className={styles.resetButton}
                                                        onClick={() => handleNationFilter(nationFilter)}
                                                    >
                                                        초기화
                                                    </button>
                                                )}
                                            </div>
                                            <div className={styles.initialGrid}>
                                                {nationInitials.map(initial => (
                                                    <button
                                                        key={initial}
                                                        type="button"
                                                        className={`${styles.initialButton} ${nationFilter === initial ? styles.active : ''}`}
                                                        onClick={() => handleNationFilter(initial)}
                                                    >
                                                        {initial}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </th>
                            <th className={styles.filterHeader}>
                                <div className={styles.filterWrapper} ref={hazardDropdownRef}>
                                    <button 
                                        type="button"
                                        className={styles.filterButton}
                                        onClick={() => setShowHazardDropdown(!showHazardDropdown)}
                                    >
                                        위험 유형
                                        {hazardFilter && <span className={styles.activeFilter}>({hazardFilter})</span>}
                                        <span className={styles.dropdownIcon}>▼</span>
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
                                        <Link to={`/board/safety/detail/${alert.alertId}`}>
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
        <Footer />
        </>
    );
};

export default SafetyAlertList;