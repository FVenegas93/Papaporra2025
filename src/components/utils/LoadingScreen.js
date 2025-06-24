import React from 'react';
import '../../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <img
        src="https://codemyui.com/wp-content/uploads/2019/11/Soccer-Ball-Hexagon-Pattern-Loader.gif" // reemplaza con la URL real de tu gif
        alt="Cargando..."
        className='loading-spinner'
      />
    </div>
  );
};

export default LoadingScreen;
