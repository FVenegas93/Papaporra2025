import React, { useState, useEffect } from 'react';
import packageJson from '../../package.json';  // ruta relativa a tu archivo React
import Navigation from './utils/Navigation';
import { getBetsByUser } from '../services/airtableServiceBet';
import { Link } from "react-router-dom";
import '../styles/Home.css';
import '../styles/MainStyle.css';

const Home = () => {
    const [user, setUser] = useState(null);

    return (
        <div className='page'>
            <Navigation setUser={setUser} />

            <main className='main-home'>

                <div className="py-5 text-center container">
                    <div className="row py-lg-5">
                        <div className="col-lg-6 col-md-8 mx-auto">
                            <h1 className="fw-light">Bienvenido, {user?.name}</h1>

                            <p className="py-5">
                                La emoción de un Carranza pero made in USA.<br></br><br></br> Mirá pa las reglas, bobo.
                            </p>
                            <button className="btn-primary mb-1">
                                <Link to='/rules' className="footer-link">REGLAS SAGRADAS</Link>
                            </button>

                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-2">
                <div className="container">
                    <div className="album py-3">
                        <div className="container d-flex justify-content-center align-items-center">
                            <div className="row text-center">
                                <button className="btn btn-primary mb-1 w-100">
                                    <Link to="/version" className="footer-link">Notas de la versión</Link>
                                </button>
                            </div>
                        </div>
                        <p className="py-2"><small>v{packageJson.version}</small></p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
