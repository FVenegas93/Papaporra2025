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
                    <li className='li-text'>Arreglada la persistencia de sesión.</li>
                    <li className='li-text'>Modificaciones ligeras de diseño en varias páginas: Clasificación, Partidos, Notas de Versión e Inicio.</li>
                    <li className='li-text'>Cambio de color de la navegación en segundo plano y del icono que muestra al cargar la App. Ambas correciones para dispositivos móviles.</li>
                </ul>
            </main>
        </div>
    );

};

export default VersionNotes;