import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from "./components/common/Header";

import MainPage from './pages/main/MainPage';

// 회원
import Login from './pages/member/Login'
import Join from './pages/member/Join';
import MyForm from './pages/member/MyForm';
import Terms from './pages/member/TermsContent';
import Privacy from './pages/member/PrivacyContent';
import FindId from './pages/member/findId';
import FindPw from './pages/member/findPassword';
import MemberDelete from './pages/member/MemberDelete';
// ✅ 추가: 비밀번호 재설정 페이지
import ResetPassword from './pages/member/ResetPassword';

// 마이페이지
import Dashboard from './pages/mypage/Dashboard';
import ProtectedRoute from './components/mypage/ProtectedRoute';
import MyMeal from './pages/mypage/MyMeal';
import PriceAlert from './pages/mypage/priceAlert';

// 알레르기 정보 관리 및 수정
import Allergies from './pages/mypage/Allergies';
// 개인 정보 수정
import EditProfile from "./pages/mypage/EditProfile";
import SafetyAlert from './pages/mypage/SafetyAlert';
import FavoriteIngredients from './pages/mypage/FavoriteIngredients';

// 식재료
import IngredientSearch from './pages/ingredient/list';
import IngredientDetail from './pages/ingredient/detail';

// 식단
import MealPlan from './pages/meal/MealPlan';

//게시판
import NoticeList from './pages/board/notice/NoticeList';
import NoticeDetail from './pages/board/notice/NoticeDetail';

// 안전정보게시판
import SafetyAlertList from './pages/board/safety/SafetyList';
import SafetyAlertDetail from './pages/board/safety/SafetyDetail';

//관리자
import AdminDashboard from './pages/admin/AdminDashboard';
import MemberInfo from './pages/admin/MemberInfo';
import NoticeInfo from './pages/admin/NoticeInfo';
import IngredientInfo from './pages/admin/IngredientInfo';
import AdminSafetyList from './pages/admin/SafetyInfo';
import AdminSafetyForm from './pages/admin/SafetyForm';

function App() {
  
  return (
    <> 
      <Header />
      <Routes>
        {/* 메인페이지 */}
        <Route path="/" element={<MainPage />} />

        {/* 회원 관련 */}
        <Route path="/member/login" element={<Login />} />
        <Route path="/member/form" element={<MyForm />} />
        <Route path="/member/terms" element={<Terms />} />
        <Route path="/member/privacy" element={<Privacy />} />
        <Route path="/member/join" element={<Join />} />
        <Route path="/member/findId" element={<FindId />} />
        <Route path="/member/findPassword" element={<FindPw />} />
        <Route path="/member/resetPassword" element={<ResetPassword />} />
        <Route path="/member/delete" element={<MemberDelete />} />

        {/* 마이페이지 관련 */}
        <Route path="/mypage" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/mypage/myMeal" element={
          <ProtectedRoute>
            <MyMeal />
          </ProtectedRoute>
        } />
        <Route path="/mypage/allergies" element={<Allergies />} />
        <Route path="/mypage/profile" element={<EditProfile />} />

        <Route path="/mypage/setting/safetyAlert" element={
          <ProtectedRoute>
            <SafetyAlert />
          </ProtectedRoute>} 
        />
        <Route path="/mypage/setting/priceAlert" element={
          <ProtectedRoute>
            <PriceAlert />
          </ProtectedRoute>} 
        />
        <Route path="/mypage/ingredients/favorite" element={
          <ProtectedRoute>
            <FavoriteIngredients />
          </ProtectedRoute>} 
        />

        {/* 식재료 관련 */}
        <Route path="/ingredient/list" element={<IngredientSearch />} />

        {/* 식단 관련 */}
        <Route path="/meal/mealAI" element={<MealPlan />} />

        <Route path="/ingredient/detail/:id" element={<IngredientDetail />} />
      
        {/* 관리자 홈 (대시보드) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/memberInfo" element={<MemberInfo />} />
        <Route path="/admin/noticeInfo" element={<NoticeInfo/>} />
        {/* 관리자 안전정보 관리 */}
        <Route path="/admin/safetyInfo" element={<AdminSafetyList />} />
        <Route path="/admin/safetyInfo/register" element={<AdminSafetyForm />} />
        <Route path="/admin/safetyInfo/update/:alertId" element={<AdminSafetyForm />} />
        <Route path="/admin/safetyInfo/detail/:alertId" element={<AdminSafetyForm />} />

        {/* 공지사항 게시판 관련 */}
        <Route path="/board/notice/list" element={<NoticeList /> }/>
        <Route path="/board/notice/detail/:noticeNo" element={<NoticeDetail />} />

        {/* 안전정보 게시판 관련 */}
        <Route path="/board/safety/list" element={<SafetyAlertList />} />
        <Route path="/board/safety/detail/:alertId" element={<SafetyAlertDetail />} />

        <Route path="/admin/ingredientInfo" element={<IngredientInfo/>} />
      </Routes>
    </>
  );
}

export default App