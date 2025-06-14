import React, { useState, useEffect } from 'react';
import Navigation from './utils/Navigation'
import { getUsers } from '../services/airtableServiceUser';
import '../styles/UserList.css'
import '../styles/MainStyle.css';

const UserList = () => {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        console.log('Datos obtenidos de Airtable:', usersData); // Depuración
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleDropdown = (userId) => {
    setActiveUser(activeUser === userId ? null : userId);
  };

  if (loading) return <div class="spinner-border text-dark" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>;

  return (
    <div className="main-bg">
      <Navigation setUser={setUser} />
      <section className="text-center container-ul ">
        <div className="userlist-container users-bg">
          <h2 className="gradient-text title">Participantes</h2>
          {users.length === 0 ? (
            <p className="no-users">No users found.</p>
          ) : (
            <ul className="user-list list-unstyled">
              {users.map((user) => (
                <li key={user.ID_User} className="mb-3">
                  <button
                    className="btn btn-primary"
                    onClick={() => toggleDropdown(user.ID_User)}
                  >
                    {user.Name}
                  </button>
                  {activeUser === user.ID_User && (
                    <ul className="dropdown-menu dropdown-menu-dark d-block position-static mx-0 border-0 shadow w-220px mt-2">
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Dollars apostados:</span> <small>{user.Money_Bet} €</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Orientación Sexual:</span> <small>{user.Sex_Orientation}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Religion:</span> <small>{user.Religion}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Jugador favorito:</span> <small>{user.Fav_Player}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Míster favorito:</span> <small>{user.Fav_Manager}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Frase Top:</span> <small>{user.Fav_Football_Sentence}</small>
                        </span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Pichichi:</span> <small>{user.Top_Scorer}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Máximo asistente:</span> <small>{user.Top_Assist}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Ganador:</span> <small>{user.Winner}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Finalista:</span> <small>{user.Runner_Up}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Semifinalista 1:</span> <small>{user.Semifinalist1}</small>
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item">
                          <span className='gradient-text'>Semifinalista 2:</span> <small>{user.Semifinalist2}</small>
                        </span>
                      </li>
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
export default UserList;
