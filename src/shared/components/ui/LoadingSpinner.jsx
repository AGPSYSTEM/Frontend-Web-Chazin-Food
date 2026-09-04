import React from 'react';
import './LoadingSpinner.css';
import logo from '../../assets/chazin_logo_small.png';

const LoadingSpinner = ({ text = "Cargando...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <img src={logo} alt="Chazin Food" className="logo-spinner" />
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loading-container-inline">
      <img src={logo} alt="Chazin Food" className="logo-spinner-inline" />
      {text && <p className="loading-text-inline">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
