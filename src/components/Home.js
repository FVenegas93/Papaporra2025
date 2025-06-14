import React, { useState, useEffect } from 'react';
import Navigation from './utils/Navigation';
import { getBetsByUser } from '../services/airtableServiceBet';
import { Link } from "react-router-dom";
import '../styles/Home.css';
import '../styles/MainStyle.css';

const Home = () => {
    const [user, setUser] = useState(null);
    const [hasBets, setHasBets] = useState(false);

    useEffect(() => {
        const checkBets = async () => {
            if (user && user.id) {
                try {
                    const bets = await getBetsByUser(user.id);
                    setHasBets(bets.length > 0);
                } catch (error) {
                    console.error('Error obtaining bets for logged user:', error);
                }
            }
        };

        checkBets();
    }, [user]);


    return (
        <div className='page'>
            <Navigation setUser={setUser} />

            <main className='main-home'>

                <div className="py-5 text-center container">
                    <div className="row py-lg-5">
                        <div className="col-lg-6 col-md-8 mx-auto">
                            <h1 className="fw-light">Bienvenido, {user?.name}</h1>
                            
                            {!hasBets ? (
                                <>

                                    <p className='py-5'><small>Aún no has realizado ninguna apuesta, ¿qué tal si empezamos? ¿O es que acaso quieres ser igual de malo que wGonzo?</small></p>
                                    <p>
                                        <Link to='/bets'>
                                            <button className="btn btn-primary py-2">Hacer mis apuestas</button>
                                        </Link>
                                    </p>
                                </>
                            ) : (
                                <p className="py-5">
                                    <small>
                                        Ya tienes apuestas realizadas. No obstante, revisa la página de apuestas, vaya a ser que seas un poco tonto
                                        y se te haya olvidado alguna :D
                                    </small>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-2">
                <div className="container">
                    <div className="album py-3">
                    <div className="container">
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                             <button className="btn-primary mb-1">
                                <Link to='/rules' className="footer-link">REGLAS SAGRADAS</Link>
                            </button>
                        </div>
                    </div>
                    <p className="py-2"><small> {process.env.REACT_APP_VERSION}</small></p>
                </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
