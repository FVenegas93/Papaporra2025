import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches, updateMatchGoals } from "../services/airtableServiceMatch.js";
import { getTeams } from "../services/airtableServiceTeam.js";
import { getUsers, fetchUsers } from "../services/airtableServiceUser.js";
import { getBets } from "../services/airtableServiceBet.js";
import Navigation from './utils/Navigation.js';
import MatchFilter from "./utils/MatchFilter.js";
import LoadingScreen from "./utils/LoadingScreen.js";
import '../styles/Navigation.css';
import '../styles/DisplayMatches.css';
import '../styles/MainStyle.css';

const Matches = () => {
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        Matchday: "",
        Tournament_Phase: "",
        Match_Date: "",
    });
    const [expandedMatch, setExpandedMatch] = useState(null); // ID del partido ampliado
    const [matches, setMatches] = useState([]);
    const [bets, setBets] = useState({});
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedMatchday, setSelectedMatchday] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [loading, setLoading] = useState(true);
    const statusPriority = { L: 1, O: 2, U: 3, F: 4 }; // Prioridad de los estados

    useEffect(() => {
        const fetchData = async () => {
            try {

                // Carga datos iniciales
                const [usersData, matchesData, teamsData, betsData] = await Promise.all([
                    getUsers(),
                    getMatches(),
                    getTeams(),
                    getBets(),
                ]);

                const betsGroupedByMatch = betsData.reduce((acc, bet) => {
                    const matchId = bet.Matches?.[0]; // Validar si el campo Matches contiene un ID válido
                    if (!matchId) {
                        console.warn('Apuesta sin partido asociado:', bet);
                        return acc;
                    }
                    if (!acc[matchId]) {
                        acc[matchId] = [];
                    }
                    acc[matchId].push(bet);
                    return acc;
                }, {});

                setMatches(matchesData);
                setTeams(teamsData);
                setUsers(usersData);
                setBets(betsGroupedByMatch);

            } catch (error) {
                console.error('Error loading data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const getTeamNames = (teamIds, match) => {
        if (!teamIds || !Array.isArray(teamIds) || teamIds.length < 2) {
            return {
                team1: { name: "Team not found", shield: null, goals: null },
                team2: { name: "Team not found", shield: null, goals: null },
            };
        }

        const team1 = teams.find((team) => team.id === teamIds[0]) || {};
        const team2 = teams.find((team) => team.id === teamIds[1]) || {};

        return {
            team1: {
                name: team1.Team_Name || `Team with ID ${teamIds[0]} not found`,
                shield: team1.Team_Shield?.[0]?.url || null,
                goals: (match.Goals_Team1 || 0) + (match.Goals_Team1_Overtime || 0),
            },
            team2: {
                name: team2.Team_Name || `Team with ID ${teamIds[1]} not found`,
                shield: team2.Team_Shield?.[0]?.url || null,
                goals: (match.Goals_Team2 || 0) + (match.Goals_Team2_Overtime || 0),
            },
        };
    };

    const toggleExpand = (matchId) => {
        setExpandedMatch(expandedMatch === matchId ? null : matchId);
    };

    const handleGoalChange = async (matchId, team, isOvertime, increment) => {
        if (!matches) return;

        const updatedMatches = matches.map((match) => {
            if (match.id === matchId) {
                // Copiamos los goles actuales para no perderlos
                const goalsTeam1 = match.Goals_Team1 || 0;
                const goalsTeam2 = match.Goals_Team2 || 0;
                const goalsTeam1OT = match.Goals_Team1_Overtime || 0;
                const goalsTeam2OT = match.Goals_Team2_Overtime || 0;

                let newGoalsTeam1 = goalsTeam1;
                let newGoalsTeam2 = goalsTeam2;
                let newGoalsTeam1OT = goalsTeam1OT;
                let newGoalsTeam2OT = goalsTeam2OT;

                if (team === 1) {
                    if (isOvertime) {
                        newGoalsTeam1OT = Math.max(0, goalsTeam1OT + increment);
                    } else {
                        newGoalsTeam1 = Math.max(0, goalsTeam1 + increment);
                    }
                } else if (team === 2) {
                    if (isOvertime) {
                        newGoalsTeam2OT = Math.max(0, goalsTeam2OT + increment);
                    } else {
                        newGoalsTeam2 = Math.max(0, goalsTeam2 + increment);
                    }
                }

                return {
                    ...match,
                    Goals_Team1: newGoalsTeam1,
                    Goals_Team2: newGoalsTeam2,
                    Goals_Team1_Overtime: newGoalsTeam1OT,
                    Goals_Team2_Overtime: newGoalsTeam2OT,
                };
            }
            return match;
        });

        setMatches(updatedMatches);

        const updatedMatch = updatedMatches.find((match) => match.id === matchId);

        try {
            await updateMatchGoals(
                matchId,
                updatedMatch.Goals_Team1,
                updatedMatch.Goals_Team2,
                updatedMatch.Goals_Team1_Overtime,
                updatedMatch.Goals_Team2_Overtime,
            );
        } catch (error) {
            console.error("Error updating goals in Airtable:", error);
            setMatches(matches); // Restaura el estado previo si hay error
        }
    };


    // Simulación de obtener datos desde el servidor o Airtable
    const reloadUsers = async () => {
        try {
            const data = await fetchUsers(); // ya es el array de usuarios, no Response
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Cargar datos al cargar el componente
    useEffect(() => {
        reloadUsers();

        // Opcional: Si quieres refrescar automáticamente, usa un intervalo
        const interval = setInterval(() => {
            reloadUsers();
        }, 2000); // Actualiza cada seg

        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, []);

    const handleMatchdaySelect = (matchday) => {
        setSelectedMatchday(matchday); // Actualiza la jornada seleccionada
    };

    const handleStageSelect = (stage) => {
        setSelectedStage(stage);
    }

    const resetFilters = () => {
        setSelectedMatchday(null);
        setSelectedStage(null);
    };

    const filteredMatches = matches.filter((match) => {
        // Filtrar por jornada o fase
        if (selectedMatchday) {
            return match.Matchday === selectedMatchday; // Filtrar por jornada
        }
        if (selectedStage) {
            return match.Tournament_Phase === selectedStage; // Filtrar por fase
        }
        return true; // Si no hay filtros, mostrar todos
    });

    if (loading) return <LoadingScreen />;

    return (
        <>
            <Navigation setUser={setUser} />

            <main className="main">
                <div className="d-flex justify-content-center py-2">
                    <MatchFilter
                        filters={filters}
                        setFilters={setFilters}
                        onMatchdaySelect={handleMatchdaySelect}
                        onStageSelect={handleStageSelect}
                        onResetFilters={resetFilters} />
                </div>
                <h2 className="gradient-text title ">Partidos</h2>
                {
                    filteredMatches.length === 0 ? (
                        <p className="text-center secondary-text">No hay partidos disponibles para el filtro seleccionado.</p>
                    ) : (
                        filteredMatches
                            .slice() // Para no mutar el estado original
                            .sort((a, b) => {
                                // Obtener los estados de los partidos
                                const statusA = a.Match_Status || "Z"; // Asignar un valor por defecto si el estado no está definido
                                const statusB = b.Match_Status || "Z";

                                // Comparar por prioridad de estado
                                const priorityA = statusPriority[statusA] || 4; // Prioridad más baja si el estado no está en el mapa
                                const priorityB = statusPriority[statusB] || 4;

                                if (priorityA !== priorityB) {
                                    return priorityA - priorityB; // Ordenar por prioridad
                                }

                                // Si las prioridades son iguales, comparar por fecha
                                const dateA = a.Match_Date ? new Date(a.Match_Date) : new Date(0); // Fecha predeterminada si no existe
                                const dateB = b.Match_Date ? new Date(b.Match_Date) : new Date(0);

                                return dateA - dateB; // Ordenar por fecha
                            })
                            .map((match) => {
                                const { team1, team2 } = getTeamNames(match.Teams, match);
                                return (

                                    <div class="album py-5 bg-custom-dark">
                                        <div class="container">

                                            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">

                                                <div key={match.id} class="col">
                                                    <div className={`card shadow-sm ${match.Match_Status === 'L' || match.Match_Status === 'O' ? 'border-custom' : ''}`}>
                                                        <div class="card-body">
                                                            <div class="d-flex justify-content-between">
                                                                <p className="text-start">
                                                                    {new Date(match.Match_Date).toLocaleString("es-ES", {
                                                                        year: "numeric",
                                                                        month: "numeric",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: false,
                                                                    })}
                                                                </p>
                                                                <span
                                                                    className="text-end ms-2" style={{
                                                                        color: match.Match_Status === "L" ? "#4CAF50" : match.Match_Status === "O" ? "#4CAF50" : "inherit"
                                                                    }}>
                                                                    {match.Match_Status === "L"
                                                                        ? "En directo"
                                                                        : match.Match_Status === "F"
                                                                            ? "Finalizado"
                                                                            : match.Match_Status === "O"
                                                                                ? "Prórroga"
                                                                                : ""}
                                                                </span>
                                                            </div>
                                                            <div class="row text-center align-items-center">
                                                                {/* Columna 1: Escudos y nombres */}
                                                                <div class="col-4 d-flex flex-column align-items-left">
                                                                    <div class="d-flex align-items-left mb-2">
                                                                        {team1.shield && (
                                                                            <img
                                                                                src={team1.shield}
                                                                                alt={team1.name}
                                                                                className="me-2"
                                                                                style={{ width: "25px", height: "25px" }}
                                                                            />
                                                                        )}
                                                                        <span className="text-nowrap">{team1.name}</span>
                                                                    </div>
                                                                    <div class="d-flex align-items-left">
                                                                        {team2.shield && (
                                                                            <img
                                                                                src={team2.shield}
                                                                                alt={team2.name}
                                                                                className="me-2"
                                                                                style={{ width: "25px", height: "25px" }}
                                                                            />
                                                                        )}
                                                                        <span className="text-nowrap">{team2.name}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Columna 2: Goles */}
                                                                <div class="col-4 d-flex flex-column align-items-end">
                                                                    <div class="btn-group mb-2">
                                                                        <span>{team1.goals}</span>
                                                                    </div>
                                                                    <div class="btn-group">
                                                                        <span>{team2.goals}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Columna 3: Botones */}
                                                                <div class="col-4 d-flex flex-column align-items-end">
                                                                    {/* Botones Equipo 1 */}
                                                                    <div className="btn-group mb-2">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary remove-goal"
                                                                            onClick={() =>
                                                                                handleGoalChange(
                                                                                    match.id,
                                                                                    1,
                                                                                    match.Match_Status === "O", // true si es prórroga, false si no
                                                                                    -1
                                                                                )
                                                                            }
                                                                            disabled={match.Match_Status !== "L" && match.Match_Status !== "O"}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary add-goal"
                                                                            onClick={() =>
                                                                                handleGoalChange(
                                                                                    match.id,
                                                                                    1,
                                                                                    match.Match_Status === "O",
                                                                                    1
                                                                                )
                                                                            }
                                                                            disabled={match.Match_Status !== "L" && match.Match_Status !== "O"}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                    {/* Botones Equipo 2 */}
                                                                    <div className="btn-group">                                                                        
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary remove-goal"
                                                                            onClick={() =>
                                                                                handleGoalChange(
                                                                                    match.id,
                                                                                    2,
                                                                                    match.Match_Status === "O",
                                                                                    -1
                                                                                )
                                                                            }
                                                                            disabled={match.Match_Status !== "L" && match.Match_Status !== "O"}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary add-goal"
                                                                            onClick={() =>
                                                                                handleGoalChange(
                                                                                    match.id,
                                                                                    2,
                                                                                    match.Match_Status === "O",
                                                                                    1
                                                                                )
                                                                            }
                                                                            disabled={match.Match_Status !== "L" && match.Match_Status !== "O"}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleExpand(match.id)}
                                                                className="btn btn-primary mt-3"
                                                            >
                                                                {expandedMatch === match.id
                                                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                                                        <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
                                                                    </svg>
                                                                    : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                                                        <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z" />
                                                                    </svg>}
                                                            </button>
                                                        </div>
                                                        {expandedMatch === match.id && (

                                                            <div className="match-details">
                                                                <table className="table table-striped table-sm">
                                                                    <tbody>
                                                                        {users.map((user) => {
                                                                            const userBet = bets[match.id]?.find((bet) =>
                                                                                bet.Users?.includes(user.id)
                                                                            );

                                                                            return (
                                                                                <tr key={user.id}>
                                                                                    <td className="pl-2">{user.Name}</td>
                                                                                    <td>{userBet ? userBet.Bet_Goals_Team1 : 'N/A'}<span> - </span>{userBet ? userBet.Bet_Goals_Team2 : 'N/A'}</td>
                                                                                    <td>{user.Total_Points || 0}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
            </main>

        </>
    );
};

export default Matches;