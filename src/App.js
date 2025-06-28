import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';
import Login from './components/Login';
import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import Matches from './components/Matches';
import Bets from './components/Bets';
import Rules from './components/Rules';
import Ranking from './components/Ranking';
import Players from './components/Players';
import Navigation from './components/utils/Navigation';
import VersionNotes from './components/conf/VersionNotes';
import './styles/Navigation.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [user, setUser] = useState(null);
  
  return (
    <Router>
        {/* Configuración de rutas */}
        {user ? <Navigation setUser={setUser} /> : null}
        <Routes>
        <Route path="/" element={<Login setUser={setUser}  />} />
          <Route path="/userlist" element={<UserList />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/matches" element={<Matches/>} />
          <Route path="/bets" element={<Bets />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/stats" element={<Players />}/>
          <Route path="/version" element={< VersionNotes/>} />
        </Routes>
    </Router>
  );
}

export default App;
