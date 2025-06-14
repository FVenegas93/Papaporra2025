import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import Login from './components/Login';
import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import Matches from './components/Matches';
import Bets from './components/Bets';
import Rules from './components/Rules';
import './styles/Navigation.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  
  return (
    <Router>
        {/* Configuración de rutas */}
        <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/userlist" element={<UserList />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/matches" element={<Matches/>} />
          <Route path="/bets" element={<Bets />} />
          <Route path="/rules" element={<Rules />} />
        </Routes>
    </Router>
  );
}

export default App;
