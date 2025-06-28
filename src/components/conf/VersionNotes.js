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
                    <li className='li-text'></li>
                </ul>
            </main>
        </div>
    );

};

export default VersionNotes;