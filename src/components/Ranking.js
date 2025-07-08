import React, { useState, useEffect } from 'react';
import Navigation from './utils/Navigation'
import { getUsers } from '../services/airtableServiceUser';
import '../styles/Ranking.css';
import '../styles/MainStyle.css';

const Ranking = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState("points");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await getUsers();
                const sortedUsers = usersData.sort((a, b) => {
                    if (b.Total_Points === a.Total_Points) {
                        // Desempatar por número de partidos exactos
                        return b.Total_Exacts - a.Total_Exacts;
                    }
                    // Ordenar por puntos totales
                    return b.Total_Points - a.Total_Points;
                });
                console.log('Users retrieved successfully: ', usersData);
                setUsers(sortedUsers);
            } catch (error) {
                console.log('Error retrieving Users data: ', error);
            }
        };

        fetchUsers();
    }, []);

    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === "points" ? "final-chart" : "points"));
    };

    return (
        <div className='ranking-bg'>
            <Navigation setUser={setUser} />

            <section>

                {viewMode === "points" && (
                    <>
                        <h2 className='title gradient-text'>Clasificación</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col" className='center-td thead-bg'>#</th>
                                    <th scope="col" className='center-td thead-bg'>Usuario</th>
                                    <th scope="col" className='center-td thead-bg'>Puntos</th>
                                    <th scope="col" className='center-td thead-bg'>Exactos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => {
                                    return (
                                        <tr
                                            key={user.ID_User}
                                            className={index === 0 ? 'top-user-row' : index === users.length - 1 ? "bottom-user-row" : ""}
                                        >
                                            <td>{index + 1}</td>
                                            <td className='center-td'>{user.Name}</td>
                                            <td className='center-td'>{user.Total_Points}</td>
                                            <td className='center-td'>{user.Total_Exacts}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}

                {viewMode === "final-chart" && (
                    <>
                        <h2 className='title gradient-text'>Cuadro Final</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col" className='center-td thead-bg'>#</th>
                                    <th scope="col" className='center-td thead-bg'>Usuario</th>
                                    <th scope="col" className='center-td thead-bg'>GSW</th>
                                    <th scope="col" className='center-td thead-bg'>G</th>
                                    <th scope="col" className='center-td thead-bg'>A</th>
                                    <th scope="col" className='center-td thead-bg'>W</th>
                                    <th scope="col" className='center-td thead-bg'>F</th>
                                    <th scope="col" className='center-td thead-bg'>SF1</th>
                                    <th scope="col" className='center-td thead-bg'>SF2</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => {
                                    return (
                                        <tr
                                            key={user.ID_User}
                                            className={index === 0 ? 'top-user-row' : index === users.length - 1 ? "bottom-user-row" : ""}
                                        >
                                            <td>{index + 1}</td>
                                            <td className='center-td'>{user.Name}</td>
                                            <td className='center-td'>{user.GSW}</td>
                                            <td className='center-td'>{user.G}</td>
                                            <td className='center-td'>{user.A}</td>
                                            <td className='center-td'>{user.W}</td>
                                            <td className='center-td'>{user.F}</td>
                                            <td className='center-td'>{user.SF1}</td>
                                            <td className='center-td'>{user.SF2}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}
                <div className="container d-flex justify-content-center align-items-center">
                    <div className="row text-center">
                        <button
                            type="button"
                            className="btn btn-primary toggle mt-3"
                            onClick={toggleViewMode}
                        >
                            Ver {viewMode === "points" ? "Cuadro Final" : "Clasificación"}
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}

export default Ranking;