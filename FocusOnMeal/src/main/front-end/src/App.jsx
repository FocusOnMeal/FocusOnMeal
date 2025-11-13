import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientLayout from './components/IngredientLayout';
import IngredientSearch from './pages/ingredient/list';
import Header from "./components/common/Header";
import Join from './pages/member/Join';


function App() {

  return (
    <>
      <Header />
      <Routes>
        <Route path="/member/join" element={<Join />} />
        <Route path="/member/login" element={<Login />} />
        <Route path="/" element={<div>홈페이지</div>} />
        <Route path="/ingredient" element={<IngredientLayout/>}>
          <Route path="list" element={<IngredientSearch/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
