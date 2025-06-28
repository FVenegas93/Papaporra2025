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
                    <li className='li-text'>Creación de la página Estadísticas, donde el usuario podrá ver quién es pichichi y líder de asistencias.</li>
                    <li className='li-text'>Cambio en la lógica de partidos para que separe los goles marcados en los 90 minutos y, en caso de empate, que los actualice en la prórroga.</li>
                    <li className='li-text'>Adición de los 4 puntos al ganador de la fase de grupos, que ha pasado de tener 48 puntos a 52.</li>
                </ul>
            </main>
        </div>
    );

};

export default VersionNotes;