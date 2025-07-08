import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import checkSession from "./CheckSession";
import '../../styles/Navigation.css'

const Navigation = ({ setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = checkSession();

    if (!session) {
      navigate("/");
      return;
    }

    setUser(session);

    const sessionDuration = 1000 * 60 * 60 * 24 * 7;
    const timeElapsed = Date.now() - session.loginTime;
    const timeLeft = sessionDuration - timeElapsed;

    // Configura un temporizador para destruir la sesión
    const timeoutId = setTimeout(() => {
      localStorage.removeItem("userSession");
      navigate("/");
    }, timeLeft);

    console.log("USER_LOGGED:", session.id);

    return () => clearTimeout(timeoutId);
  }, [navigate, setUser]);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setUser(null);
    navigate("/");
  };

  return (
    <div className='home-page'>
      <header>
        <div className={`collapse bg-dark ${isOpen ? "show bg-show" : ""}`} id="navbarHeader">

          <div className="container">

            <div className="row">
              <Link to="/userlist" className="col-12 nav-anchor d-block">
                Participantes
              </Link>
              <Link to="/matches" className="col-12 nav-anchor d-block">
                Partidos
              </Link>
              <Link to="/bets" className="col-12 nav-anchor d-block">
                Apuestas
              </Link>
              <Link to="/ranking" className="col-12 nav-anchor d-block">
                Clasificación
              </Link>
              <Link to="/stats" className="col-12 nav-anchor d-block">
                Estadísticas
              </Link>
              <hr></hr>
              <a
                href="#"
                className=" col-12 nav-anchor d-block text-danger"
                onClick={(e) => {
                  e.preventDefault(); // evita navegación predeterminada
                  handleLogout();
                }}>
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
        <div className="navbar navbar-dark bg-lightened-dark shadow-sm">
          <div className="container">
            <Link to="/home" className="navbar-brand d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" stroke="#33312f" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" aria-hidden="true" className="me-2 home-logo" viewBox="0 0 19 19"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" /></svg>
              <span className="brand-text nav-text">PAPAPORRA 2025</span>
            </Link>
            <button className="navbar-toggler" type="button" onClick={toggleNavbar} aria-controls="navbarHeader" aria-expanded={isOpen} aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navigation;
