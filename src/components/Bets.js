import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches } from "../services/airtableServiceMatch.js";
import { setBet, checkExistingBetByUser, getBetsByUser } from "../services/airtableServiceBet.js"
import { getUserByIdUser } from "../services/airtableServiceUser.js";
import { getTeams } from "../services/airtableServiceTeam.js";
import Navigation from './utils/Navigation.js';
import '../styles/Navigation.css';
import '../styles/DisplayMatches.css';
import '../styles/Bets.css';
import '../styles/MainStyle.css';

const Bets = ({ }) => {
    const [user, setUser] = useState(null);
    const [userBets, setUserBets] = useState({});
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState({});
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);
    const userSession = JSON.parse(localStorage.getItem("userSession"));
    const loggedUserId = userSession?.id;
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesData, teamsData] = await Promise.all([
                    getMatches(),
                    getTeams(),
                ]);

                setMatches(matchesData);
                setTeams(teamsData);
            } catch (error) {
                console.error('Error loading data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchUserBets = async () => {
            try {
                if (!loggedUserId) return;

                const user = await getUserByIdUser(loggedUserId);
                if (!user) {
                    console.error("Usuario no encontrado.");
                    return;
                }

                const userBetsData = await getBetsByUser(user.id); // Devuelve un array con las apuestas del usuario
                const betsMap = {};
                userBetsData.forEach((bet) => {
                    betsMap[bet.Matches[0]] = bet; // Indexar por ID de partido
                });
                setUserBets(betsMap);
            } catch (error) {
                console.error("Error cargando apuestas del usuario:", error.message);
            }
        };

        fetchUserBets();
    }, [loggedUserId]);

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
                goals: match.Goals_Team1 || 0,
            },
            team2: {
                name: team2.Team_Name || `Team with ID ${teamIds[1]} not found`,
                shield: team2.Team_Shield?.[0]?.url || null,
                goals: match.Goals_Team1 || 0,
            },
        };
    };

    const handleInputChange = (matchId, team, value) => {
        setBets((prevBets) => ({
            ...prevBets,
            [matchId]: {
                ...prevBets[matchId],
                [team]: value,
            },
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Mostrar indicador de carga

        if (!loggedUserId) {
            console.error("ID de usuario no definido.");
            return;
        }

        try {
            const user = await getUserByIdUser(loggedUserId);

            if (!user) {
                throw new Error(`Usuario con ID_User ${loggedUserId} no encontrado`);
            }

            const formattedBets = [];
            for (const [idMatch, bet] of Object.entries(bets)) {
                const match = matches.find((m) => m.id === idMatch);
                if (!match) {
                    console.warn(`Match con ID ${idMatch} no encontrado.`);
                    continue; // Ignorar si no se encuentra el partido
                }

                // Verificar si ya existe una apuesta para este usuario y partido
                const alreadyExists = await checkExistingBetByUser(user.id, idMatch);
                if (alreadyExists) {
                    console.warn(`El usuario ya ha apostado para el partido con ID ${idMatch}.`);
                    continue; // Ignorar esta apuesta
                }

                // Preparar los datos de la apuesta
                const betGoalsTeam1 = parseInt(bet.team1, 10) || 0;
                const betGoalsTeam2 = parseInt(bet.team2, 10) || 0;

                formattedBets.push({
                    Bet_Goals_Team1: betGoalsTeam1,
                    Bet_Goals_Team2: betGoalsTeam2,
                    Matches: [match.id],
                    Users: [user.id],
                });
            }

            if (formattedBets.length === 0) {
                console.warn("No hay apuestas nuevas para enviar.");
                return;
            }

            // Crear las apuestas en Airtable
            await Promise.all(formattedBets.map((bet) => setBet(bet, bet.Matches[0])));
            console.log('Apuestas enviadas:', formattedBets);
            setShowModal(true); // Mostrar mensaje de éxito
        } catch (error) {
            console.error('Error enviando apuestas:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        navigate("/home");
    };

    //if (loading) return <div>Loading...</div>;

    return (
        <>
            <Navigation setUser={setUser} />

            <main className="main">
                <h2 className="gradient-text title ">Apuestas</h2>
                <p className="help"><small>Piensa bien tu apuesta. Podrás acceder a las apuestas tantas veces como quieras pero, si envías un resultado, ya no puedes modificarlo.</small></p>
                <p className="help"><small>El administrador intentó que pudieras actualizar el resultado de la apuesta pero le golpeó la vida adulta.</small></p>
                {matches
                    .slice() // Para no mutar el estado original
                    .sort((a, b) => a.ID_Match - b.ID_Match) // Ordenar por ID_Match
                    .map((match) => {
                        const { team1, team2 } = getTeamNames(match.Teams, match);

                        return (
                            <div class="album py-3 bg-custom-dark">
                                <div class="container">
                                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                        <div key={match.id} class="col">
                                            <div class="card shadow-sm">
                                                <div class="card-body">

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

                                                        </div>

                                                        {/* Columna 3: Botones */}
                                                        <div class="col-4 d-flex flex-column align-items-end">
                                                            <div class="btn-group mb-2">
                                                                <input
                                                                    type="number"
                                                                    className="form-control mb-2"
                                                                    value={bets[match.id]?.team1 || ""}
                                                                    //readOnly={userBets[match.id]?.Bet_Goals_Team1} // Hace el campo solo lectura si hay un placeholder
                                                                    onChange={(e) =>
                                                                        handleInputChange(match.id, "team1", e.target.value)
                                                                    }
                                                                    onWheel={(e) => e.target.blur()}
                                                                />
                                                            </div>
                                                            <div class="btn-group">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={bets[match.id]?.team2 || ""}
                                                                    //readOnly={userBets[match.id]?.Bet_Goals_Team2} // Hace el campo solo lectura si hay un placeholder
                                                                    onChange={(e) =>
                                                                        handleInputChange(match.id, "team2", e.target.value)
                                                                    }
                                                                    onWheel={(e) => e.target.blur()}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                <div class="d-flex justify-content-center py-2">
                    <button
                        type="button"
                        disabled={loading}
                        className="btn btn-primary mb-4"
                        onClick={handleSubmit}
                    >
                        {loading ? 'Procesando...' : 'Enviar Apuestas'}
                    </button>
                </div>
            </main>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Bien apostado</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
                            </div>
                            <div className="modal-body">
                                <p>Apuestas registradas con éxito</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleModalClose}>
                                    Ir a la página principal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Bets;