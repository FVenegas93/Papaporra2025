import React, { useState, useEffect } from 'react';
import Navigation from './utils/Navigation'
import { getUsers } from '../services/airtableServiceUser';
import '../styles/Ranking.css';

const Ranking = () => {
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await getUsers();
                const sortedUsers = usersData.sort((a, b) => b.Total_Points - a.Total_Points);
                console.log('Users retrieved successfully: ', usersData);
                setUsers(sortedUsers);
            } catch (error) {
                console.log('Error retrieving Users data: ', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className='ranking-bg'>
            <Navigation setUser={setUser} />
            <section>
                <h2 className='title gradient-text'>Clasificación</h2>
                <table class="table">
                    <thead className='thead-bg'>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col" className='center-td'>Usuario</th>
                            <th scope="col" className='center-td'>Puntos</th>
                            <th scope="col" className='center-td'>Exactos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                        <tr key={user.ID_User}>
                            <td>{index + 1}</td>
                            <td className='center-td'>{user.Name}</td>
                            <td className='center-td'>{user.Total_Points}</td>     
                            <td className='center-td'>{user.Total_Exacts}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Ranking;