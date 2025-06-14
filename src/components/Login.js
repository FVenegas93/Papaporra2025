import React, { useState } from 'react';
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
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos

        try {
            const users = await getUsers(); // Llama al servicio para obtener usuarios

            // Validar usuario y contraseña
            const user = users.find(user => user.Email === email);
           
            if (user) {
                const hashedPassword = SHA256(password).toString();

                if (hashedPassword === user.Password) {
                    sessionStorage.setItem('userSession', JSON.stringify({ id: user.ID_User, email: user.Email, name: user.Name, loginTime: Date.now(),}));
                    console.log(sessionStorage);
                    navigate('/home'); // Redirigir si las credenciales son correctas
                    return;
                } else {
                    setError('Correo y/o contraseña incorrectos');
                }
                
            } else {
                setError('Correo y/o contraseña incorrectos');
            }
        } catch (e) {
            console.error(e);
            setError('Ocurrió un error al intentar iniciar sesión');
        }
    };
   
    return (
        <main 
            className="d-flex justify-content-center py-4 bg-home"
        >
      
            <form onSubmit={handleLogin} style={{ maxWidth: '400px', width: '75%' }}>
                <div className='centered-text padding-img'>
                    <img  src={fifa_logo} alt="2025_FIFA_Club_World_Cup_logo.png" width="100" height="100" />
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
    

