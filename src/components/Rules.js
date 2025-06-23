import React, { useState } from 'react';
import Navigation from './utils/Navigation';
import '../styles/MainStyle.css';
import '../styles/Rules.css';

const Rules = () => {
    const [user, setUser] = useState(null);

    return(
        <div className='page'>
            <Navigation setUser={setUser} />
            <main className='bg-rules'>
                <h2 className='title gradient-text'>Reglamento</h2>
                <ul className='my-3'>
                    <li className='li-text'>3 o más goles contarán como exacto si se ha apostado esa cantidad de goles</li>
                    <hr></hr>
                    <li className='li-text'>Acertar el resultado: <span>1 punto</span></li>
                    <li className='li-text'>Acertar el resultado exacto:  <span>3 puntos</span></li>
                    <li className='li-text'>Ser primero en la fase de grupos:  <span>4 puntos</span></li>
                    <hr></hr>
                    <li className='li-text'>Semifinalista 1:  <span>5 puntos</span></li>
                    <li className='li-text'>Semifinalista 2:  <span>5 puntos</span></li>
                    <li className='li-text'>Máximo asistente:  <span>4 puntos</span></li>
                    <li className='li-text'>Máximo goleador:  <span>8 puntos</span></li>
                    <li className='li-text'>Equipo finalista: <span>8 puntos</span></li>
                    <li className='li-text'>Equipo ganador:  <span>12 puntos</span></li>
                </ul>
            </main>
        </div>
    );

};

export default Rules;