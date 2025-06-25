import React, { useState, useEffect } from 'react';
import { getUsers } from "../services/airtableServiceUser";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SHA256 from "crypto-js/sha256";
import fifa_logo from './assets/2025_FIFA_Club_World_Cup.svg.png'
import '../styles/Login.css'
import './assets/furbo.jpg';
import '../styles/MainStyle.css';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Cargar usuarios al montar componente
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersFromAirtable = await getUsers();
                setUsers(usersFromAirtable);
            } catch (err) {
                console.error("Error cargando usuarios:", err);
                setError("No se pudo cargar la lista de usuarios");
            }
        };
        fetchUsers();
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!users || users.length === 0) {
            setError("Lista de usuarios vacía, inténtalo más tarde");
            return;
        }

        const user = users.find(u => u.Email === email);

        if (user) {
            // Hashear la contraseña ingresada
            const hashedPassword = SHA256(password).toString();

            if (hashedPassword === user.Password) {
                // Guardar sesión con timestamp
                const session = {
                    id: user.ID_User,
                    email: user.Email,
                    name: user.Name,
                    loginTime: Date.now()
                };
                localStorage.setItem('userSession', JSON.stringify(session));
                setUser(session);
                navigate('/home');
            } else {
                setError('Correo y/o contraseña incorrectos');
            }
        } else {
            setError('Correo y/o contraseña incorrectos');
        }
    };
    return (
        <main
            className="d-flex justify-content-center py-4 bg-home"
        >

            <form onSubmit={handleLogin} style={{ maxWidth: '400px', width: '75%' }}>
                <div className='centered-text padding-img'>
                    <img src={fifa_logo} alt="2025_FIFA_Club_World_Cup_logo.png" width="100" height="100" />
                </div>

                <h1 className="h3 mb-3 fw-normal centered-text gradient-text">PAPAPORRA 2025</h1>
                <p className='p-white centered-text'>Inicia sesión, payaso</p>

                {error && <div className="alert alert-danger text-center">{error}</div>}

                <div className="form-floating">
                    <input
                        type="email"
                        className="form-control bg-input"
                        id="floatingInput"
                        placeholder="name@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="floatingInput">email</label>
                </div>
                <div className="form-floating">
                    <input
                        type="password"
                        className="form-control bg-input"
                        id="floatingPassword"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="floatingPassword">contraseña</label>
                </div>

                <div className="form-check text-start my-3">
                    <p className='p-white centered-text'>
                        ¿No tienes cuenta?<span> </span>
                        <Link className="anchor" to="/register">
                            Regístrate
                        </Link>
                    </p>
                </div>
                <button className="btn gradient-btn w-100 py-2" type="submit">
                    Iniciar sesión
                </button>

            </form>
        </main>

    );
}


