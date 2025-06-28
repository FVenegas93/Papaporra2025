import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches } from "../services/airtableServiceMatch.js";
import { setBet, checkExistingBetByUser, getBetsByUser, getIncompleteBetsByUser } from "../services/airtableServiceBet.js"
import { getUserByIdUser, getUsers } from "../services/airtableServiceUser.js";
import { getTeams } from "../services/airtableServiceTeam.js";
import Navigation from './utils/Navigation.js';
import MatchFilter from "./utils/MatchFilter.js";
import { useAlert } from "./utils/Alerts.js";
import LoadingScreen from "./utils/LoadingScreen.js";
import '../styles/Navigation.css';
import "../styles/MatchFilter.css";
import '../styles/DisplayMatches.css';
import '../styles/Bets.css';
import '../styles/MainStyle.css';

const Bets = ({ }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState({});
    const [filters, setFilters] = useState({
        Matchday: "",
        Tournament_Phase: "",
        Match_Date: "",
    });
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState({});
    const [pendingBets, setPendingBets] = useState([]);
    const [completedBets, setCompletedBets] = useState([]);
    const [selectedMatchday, setSelectedMatchday] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [betResultOvertime, setBetResultOvertime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("pending");
    const userSession = JSON.parse(localStorage.getItem("userSession"));
    const loggedUserId = userSession?.id;
    const { showAlert } = useAlert();

    useEffect(() => {
        console.log("Pending Bets Updated: ", pendingBets);
        console.log("Completed Bets Updated: ", completedBets);
    }, [pendingBets, completedBets]);

    const fetchData = async () => {
        try {
            const [matchesData, teamsData, usersData] = await Promise.all([
                getMatches(),
                getTeams(),
                getUsers(),
            ]);

            setMatches(matchesData);
            setTeams(teamsData);
            setUsers(usersData);

            if (loggedUserId) {
                const user = await getUserByIdUser(loggedUserId);
                setUser(user);

                const [pending, allBets] = await Promise.all([
                    getIncompleteBetsByUser(user.airtableId),
                    getBetsByUser(user.airtableId),
                ]);

                const completed = allBets.filter(
                    (bet) =>
                        !pending.some((pendingBet) => pendingBet.id === bet.id) &&
                        bet.fields.Bet_Goals_Team1 != null &&
                        bet.fields.Bet_Goals_Team2 != null
                );

                setPendingBets(pending);
                setCompletedBets(completed);
            }
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loggedUserId) {
            console.error("ID de usuario no definido.");
            showAlert("Debes estar logueado para realizar una apuesta.", "danger");
            return;
        }

        try {
            // Obtener el usuario actual
            const user = await getUserByIdUser(loggedUserId);

            if (!user) {
                throw new Error(`Usuario con ID_User ${loggedUserId} no encontrado.`);
            }

            // Obtener los valores de los inputs
            const goalsTeam1 = e.target.elements["goalsTeam1"]?.value;
            const goalsTeam2 = e.target.elements["goalsTeam2"]?.value;

            // Validar que los valores no estén vacíos y sean números
            if (!goalsTeam1 || isNaN(goalsTeam1)) {
                showAlert("Por favor, ingresa un número válido para los goles del equipo local.", "warning");
                return;
            }

            if (!goalsTeam2 || isNaN(goalsTeam2)) {
                showAlert("Por favor, ingresa un número válido para los goles del equipo visitante.", "warning");
                return;
            }

            // Encontrar el partido correspondiente
            const matchId = e.target.dataset.matchId;
            const match = matches.find((m) => m.id === matchId);

            if (!match) {
                console.warn(`Partido con ID ${matchId} no encontrado.`);
                showAlert("El partido seleccionado no es válido.", "warning");
                return;
            }

            const alreadyExists = await checkExistingBetByUser(user.airtableId);

            if (alreadyExists) {
                console.warn(`El usuario ya ha apostado para el partido con ID ${matchId}.`);
                showAlert("Ya has realizado una apuesta para este partido.", "warning");
                return;
            }

            // Obtener el valor del select desde el formulario
            const selectedValue = e.target.elements["betResultOvertime"]?.value;

            if (!selectedValue) {
                showAlert("Por favor, selecciona el equipo que pasará a la siguiente ronda.", "warning");
                return;
            }

            // Preparar los datos de la apuesta
            const newBet = {
                Bet_Goals_Team1: parseInt(goalsTeam1, 10),
                Bet_Goals_Team2: parseInt(goalsTeam2, 10),
                Bet_Match_Result_Overtime: selectedValue,
                Users: [user.airtableId],
                Matches: [match.id],
            };

            // Enviar la apuesta al backend
            if (!alreadyExists) {
                const response = await setBet(newBet, match.id);
            }

            // Notificar éxito al usuario
            showAlert("Apuesta creada con éxito.", "success");

            // Actualizar estado
            setPendingBets((prev) => prev.filter((bet) => bet.fields.Matches?.[0] !== matchId));
            setCompletedBets((prev) => [...prev, newBet]);

        } catch (error) {
            console.error("Error handling bet submission:", error.message);
            showAlert("Error al procesar la apuesta. Por favor, inténtalo de nuevo", "danger");
        }
    };

    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === "pending" ? "completed" : "pending"));
    };

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
                        onResetFilters={resetFilters}
                    />
                    <button
                        type="button"
                        className="btn btn-secondary mb-3"
                        onClick={toggleViewMode}
                    >
                        Ver apuestas {viewMode === "pending" ? "Completadas" : "Pendientes"}
                    </button>

                </div>
                <div className="content-container py-3"> {/* Contenedor adicional */}
                    {viewMode === "pending" && (
                        <>
                            <h2 className="gradient-text title">Apuestas Pendientes</h2>
                            <div>
                                {pendingBets.length > 0 ? (
                                    [...pendingBets]
                                        .filter((bet) => {
                                            const matchId = bet.fields.Matches?.[0];
                                            const match = matches.find((m) => m.id === matchId);

                                            if (!match) return false; // Si no se encuentra el partido, omitir esta apuesta.

                                            // Aplicar filtro solo si uno está activo
                                            if (selectedMatchday) {
                                                return match.Matchday === selectedMatchday; // Aplicar filtro de jornada.
                                            }

                                            if (selectedStage) {
                                                return match.Tournament_Phase === selectedStage; // Aplicar filtro de fase.
                                            }

                                            return true;
                                        })
                                        .sort((a, b) => {
                                            const matchIdA = a.fields.Matches?.[0];
                                            const matchIdB = b.fields.Matches?.[0];

                                            // Obtener los partidos
                                            const matchA = matches.find((m) => m.id === matchIdA);
                                            const matchB = matches.find((m) => m.id === matchIdB);

                                            // Obtener las fechas de los partidos
                                            const dateA = matchA?.Match_Date ? new Date(matchA.Match_Date) : new Date(0); // Fecha predeterminada si no existe
                                            const dateB = matchB?.Match_Date ? new Date(matchB.Match_Date) : new Date(0);

                                            return dateA - dateB;
                                        })
                                        .map((bet) => {
                                            // Obtener datos del partido
                                            const matchId = bet.fields.Matches?.[0];
                                            const match = matches.find((m) => m.id === matchId);

                                            if (!match) {
                                                console.warn(`Match not found for match id: ${matchId}`);
                                                return null;
                                            }

                                            const teamIds = match.Teams || [];
                                            const team1 = teams.find((team) => team.id === teamIds[0]) || {};
                                            const team2 = teams.find((team) => team.id === teamIds[1]) || {};

                                            // Obtener las imágenes y nombres
                                            const team1Image = team1.Team_Shield?.[0]?.url || 'https://via.placeholder.com/48';
                                            const team1Name = team1.Team_Name || 'Equipo 1';
                                            const team2Image = team2.Team_Shield?.[0]?.url || 'https://via.placeholder.com/48';
                                            const team2Name = team2.Team_Name || 'Equipo 2';

                                            return (
                                                <div key={bet.id} className="album py-3 bg-custom-dark">
                                                    <div className="container">
                                                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                                            <div className="col">
                                                                <div className="card shadow-sm">
                                                                    <div className="card-body">
                                                                        <form onSubmit={handleSubmit} data-match-id={match.id}>
                                                                            <div className="row text-center align-items-center">
                                                                                <div className="col-4 d-flex flex-column align-items-left">
                                                                                    <div className="d-flex align-items-left mb-2">
                                                                                        {team1Image && (
                                                                                            <img
                                                                                                src={team1Image}
                                                                                                alt={team1Name}
                                                                                                className="me-2"
                                                                                                style={{ width: "25px", height: "25px" }}
                                                                                            />
                                                                                        )}
                                                                                        <span className="text-nowrap">{team1Name}</span>
                                                                                    </div>
                                                                                    <div className="d-flex align-items-left">
                                                                                        {team2Image && (
                                                                                            <img
                                                                                                src={team2Image}
                                                                                                alt={team2Name}
                                                                                                className="me-2"
                                                                                                style={{ width: "25px", height: "25px" }}
                                                                                            />
                                                                                        )}
                                                                                        <span className="text-nowrap">{team2Name}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="col-4 d-flex flex-column align-items-end">
                                                                                    <input
                                                                                        type="number"
                                                                                        name="goalsTeam1"
                                                                                        placeholder="-"
                                                                                        className="form-control mb-2 w-50"
                                                                                    />
                                                                                    <input
                                                                                        type="number"
                                                                                        name="goalsTeam2"
                                                                                        placeholder="-"
                                                                                        className="form-control w-50"
                                                                                    />
                                                                                </div>
                                                                                <div className="col-4 d-flex flex-column align-items-end">
                                                                                    <button
                                                                                        type="submit"
                                                                                        className="btn btn-primary mt-2"
                                                                                    >
                                                                                        Apostar
                                                                                    </button>
                                                                                </div>
                                                                                <div className="col-4 d-flex flex-column align-items-end">
                                                                                    <select
                                                                                        class="form-select mt-2"
                                                                                        name="betResultOvertime"
                                                                                        aria-label=""
                                                                                        value={betResultOvertime || ""}
                                                                                        onChange={async (e) => {
                                                                                            const selectedValue = e.target.value;
                                                                                            setBetResultOvertime(selectedValue);
                                                                                        }}
                                                                                    >
                                                                                        <option className="opt" value="" disabled>Pasa a la siguiente ronda</option>
                                                                                        <option className="opt" value="1">{team1Name}</option>
                                                                                        <option className="opt" value="2">{team2Name}</option>
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </form>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="secondary-text">No tienes apuestas pendientes.</p>
                                )}
                            </div>
                        </>

                    )}

                    {viewMode === "completed" && (
                        <>
                            <h2 className="gradient-text title">Apuestas Completadas</h2>
                            <div>
                                {completedBets.length > 0 ? (
                                    [...completedBets]
                                        .filter((bet) => {
                                            const matchId = bet.fields.Matches?.[0];
                                            const match = matches.find((m) => m.id === matchId);

                                            if (!match) return false; // Si no se encuentra el partido, omitir esta apuesta.

                                            // Aplicar filtro solo si uno está activo
                                            if (selectedMatchday) {
                                                return match.Matchday === selectedMatchday; // Aplicar filtro de jornada.
                                            }

                                            if (selectedStage) {
                                                return match.Tournament_Phase === selectedStage; // Aplicar filtro de fase.
                                            }

                                            return true;
                                        })
                                        .sort((a, b) => {
                                            const matchIdA = a.fields.Matches?.[0];
                                            const matchIdB = b.fields.Matches?.[0];

                                            // Obtener los partidos
                                            const matchA = matches.find((m) => m.id === matchIdA);
                                            const matchB = matches.find((m) => m.id === matchIdB);

                                            // Obtener las fechas de los partidos
                                            const dateA = matchA?.Match_Date ? new Date(matchA.Match_Date) : new Date(0); // Fecha predeterminada si no existe
                                            const dateB = matchB?.Match_Date ? new Date(matchB.Match_Date) : new Date(0);

                                            return dateA - dateB;
                                        })
                                        .map((bet) => {

                                            // Obtener datos del partido
                                            const matchId = bet.fields.Matches?.[0];
                                            const match = matches.find((m) => m.id === matchId);

                                            if (!match) {
                                                console.warn(`Match not found for match id: ${matchId}`);
                                                return null;
                                            }

                                            const teamIds = match.Teams || [];
                                            const team1 = teams.find((team) => team.id === teamIds[0]) || {};
                                            const team2 = teams.find((team) => team.id === teamIds[1]) || {};

                                            // Obtener las imágenes y nombres.
                                            const team1Image = team1.Team_Shield?.[0]?.url || 'https://via.placeholder.com/48';
                                            const team1Name = team1.Team_Name || 'Equipo 1';
                                            const team2Image = team2.Team_Shield?.[0]?.url || 'https://via.placeholder.com/48';
                                            const team2Name = team2.Team_Name || 'Equipo 2';

                                            return (
                                                <div key={bet.id} className="album py-3 bg-custom-dark">
                                                    <div className="container">
                                                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                                            <div className="col">
                                                                <div className="card shadow-sm">
                                                                    <div className="card-body">
                                                                        <div className="row text-center align-items-center">
                                                                            <div className="col-4 d-flex flex-column align-items-left">
                                                                                <div className="d-flex align-items-left mb-2">
                                                                                    {team1Image && (
                                                                                        <img
                                                                                            src={team1Image}
                                                                                            alt={team1Name}
                                                                                            className="me-2"
                                                                                            style={{ width: "25px", height: "25px" }}
                                                                                        />
                                                                                    )}
                                                                                    <span className="text-nowrap">{team1Name}</span>
                                                                                </div>
                                                                                <div className="d-flex align-items-left">
                                                                                    {team2Image && (
                                                                                        <img
                                                                                            src={team2Image}
                                                                                            alt={team2Name}
                                                                                            className="me-2"
                                                                                            style={{ width: "25px", height: "25px" }}
                                                                                        />
                                                                                    )}
                                                                                    <span className="text-nowrap">{team2Name}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-4 d-flex flex-column align-items-end"></div>
                                                                            <div className="col-4 d-flex flex-column align-items-end">
                                                                                <div className="btn-group mb-2">
                                                                                    <span>{bet.fields.Bet_Goals_Team1 ?? "Pendiente"}</span>
                                                                                </div>
                                                                                <div className="btn-group">
                                                                                    <span>{bet.fields.Bet_Goals_Team2 ?? "Pendiente"}</span>
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
                                        })
                                ) : (
                                    <p className="secondary-text">No tienes apuestas realizadas.</p>
                                )}
                            </div>
                        </>
                    )}
                </div >
            </main >
        </>
    );
};

export default Bets;