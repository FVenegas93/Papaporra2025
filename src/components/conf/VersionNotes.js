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
                    <li className='li-text'>Ahora permite filtrar partidos por la jornada en la que se han celebrado, tanto en Apuestas como Partidos.</li>
                    <li className='li-text'>Los partidos tienen una prioridad de aparición por defecto, según su estado: en directo, pendientes de disputarse y finalizados.</li>
                    <li className='li-text'>Se han implementado botones para consultar apuestas finalizadas y apuestas pendientes de realizar.</li>
                    <li className='li-text'>Remodelación de la página de inicio para tener las reglas más a mano y tener las notas de versión.</li>
                    <li className='li-text'>Reacondicionamiento de fondos en las páginas Inicio, Reglas, Participantes y Versión para hacer el diseño algo más homogéneo.</li>
                </ul>
            </main>
        </div>
    );

};

export default VersionNotes;