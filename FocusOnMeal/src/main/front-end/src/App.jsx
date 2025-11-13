import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientSearch from './pages/ingredient/list';
import IngredientDetail from './pages/ingredient/detail';
import Header from "./components/common/Header";


function App() {

  return (
    <>
      <Header />
        <Routes>
          <Route path="/member/login" element={<Login />} />
          <Route path="/" element={<div>홈페이지</div>} />
          <Route path="/ingredient/list" element={<IngredientSearch />} />
          <Route path="/ingredient/:id" element={<IngredientDetail />} />
        </Routes>
    </>
  )
}

export default App
