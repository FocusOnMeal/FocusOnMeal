import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './pages/member/Login'
import IngredientLayout from './components/IngredientLayout';
import IngredientSearch from './pages/ingredient/list';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/member/login" element={<Login />} />
        <Route path="/" element={<div>홈페이지</div>} />
        <Route path="/ingredient" element={<IngredientLayout/>} />
        <Route path="list" element={<IngredientSearch/>}/>
        <Route index element={<IngredientSearch/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
