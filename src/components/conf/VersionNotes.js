import React, { useState } from 'react';
import Navigation from '../utils/Navigation.js';
import packageJson from '../../../package.json';
import '../../styles/MainStyle.css';
import '../../styles/Rules.css';

const VersionNotes = () => {
    const [user, setUser] = useState(null);

    return(
        <div className='page'>
            <Navigation setUser={setUser} />
            <main className='bg-ver'>
                <h2 className='title gradient-text'>Notas de versión {packageJson.version}</h2>
    
                <ul className='my-3'>
                    <li className='li-text'>Modificación del Ranking para alternar las vistas entre la clasificación y la puntuación adquirida en el cuadro final.</li>
                    <li className='li-text'>Optimización de filtrado de partidos.</li>
                    <li className='li-text'>Ajustes menores en el diseño del header.</li>
                </ul>
            </main>
        </div>
    );

};

export default VersionNotes;