import React, { useState, createContext, useContext } from "react";

const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const showAlert = (message, type = "primary", duration = 3000) => {
        const id = Date.now();
        setAlerts((prev) => [...prev, { id, message, type }]);

        // Remover alerta después de la duración especificada
        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, duration);
    };

    return (
        <AlertsContext.Provider value={{alert, showAlert}}>
            {children}
            <div className="alert-container position-fixed top-0 start-50 translate-middle-x mt-3 w-100"  style={{ zIndex: 1050 }}>
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`alert alert-${alert.type} d-flex align-items-center shadow`}
                        role="alert"
                    >
                        {alert.message}
                    </div>
                ))}
            </div>
        </AlertsContext.Provider>
    );
};

export const useAlert = () => useContext(AlertsContext);