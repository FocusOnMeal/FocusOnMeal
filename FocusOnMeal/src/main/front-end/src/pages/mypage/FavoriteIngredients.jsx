import styles from "./FavoriteIngredients.module.css";

const FavoriteIngredients = () => {
    return(
        <>
            <div className={styles.container}>
                <h2>찜한 식재료</h2>
                {/* API로 찜 목록 불러오는 로직 추가 예정 */}
            </div>
        </>
    )
}

export default FavoriteIngredients;