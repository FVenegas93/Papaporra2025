import React, { useState, useRef, useEffect } from "react";
import "../../styles/MatchFilter.css";


const MatchFilter = ({ onMatchdaySelect, onStageSelect, onResetFilters }) => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const dropdownRef = useRef(null);

    const toggleFilterVisibility = () => {
        setIsFilterVisible((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsFilterVisible(false);
        }
    };

    useEffect(() => {
        if (isFilterVisible) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        // Cleanup
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isFilterVisible]);

    const handleMatchdaySelect = (matchday) => {
        onMatchdaySelect(matchday);
        setIsFilterVisible(false);
    };

    const handleStageSelect = (stage) => {
        onStageSelect(stage);
        setIsFilterVisible(false);
    };

    return (
        <div className="dropdown-center"  ref={dropdownRef}>
            <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                onClick={toggleFilterVisibility}
                aria-expanded={isFilterVisible} // Importante para accesibilidad
            >
                Filtrar por:
            </button>
            {isFilterVisible && ( // Controla la visibilidad del menú
                <ul className="dropdown-menu show filter-opt">
                    <li>
                        <p className="dropdown-item-p gradient-text">Fase de grupos:</p>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleMatchdaySelect("1")}>
                            Jornada 1
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleMatchdaySelect("2")}>
                            Jornada 2
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleMatchdaySelect("3")}>
                            Jornada 3
                        </button>
                    </li>
                    {/*<hr></hr>
                    <li>
                        <p className="dropdown-item-p gradient-text">Eliminatorias:</p>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleStageSelect("Round of 16")}>
                            Octavos
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleStageSelect("Round of 8")}>
                            Cuartos
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleStageSelect("Semifinals")}>
                            Semifinales
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" onClick={() => handleStageSelect("Final")}>
                            Final
                        </button>
                    </li>*/}
                    <hr />
                    <li>
                        <button
                            className="dropdown-item text-danger"
                            onClick={onResetFilters}
                        >
                            Mostrar todo
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default MatchFilter;

