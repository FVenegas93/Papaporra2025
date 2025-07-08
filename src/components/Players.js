import React, { useEffect, useState } from "react";
import { getPlayers } from "../services/airtableServicePlayer";
import { getTeams } from "../services/airtableServiceTeam";
import Navigation from "./utils/Navigation";
import LoadingScreen from "./utils/LoadingScreen";

const Players = () => {
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [viewMode, setViewMode] = useState("goals");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [playersData, teamsData] = await Promise.all([
                getPlayers(),
                getTeams(),
            ]);

            setPlayers(playersData);
            setTeams(teamsData);

        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === "goals" ? "assists" : "goals"));
    };

    if (loading) return <LoadingScreen />;
    return (
        <>
            <Navigation setUser={setUser} />

            <main className="main">

                <div className="content-container">
                    <div className="d-flex justify-content-center pt-5">
                        <button
                            type="button"
                            className="btn btn-secondary mb-3"
                            onClick={toggleViewMode}
                        >
                            Ir a {viewMode === "goals" ? "asistentes" : "goleadores"}
                        </button>
                    </div>
                    {viewMode === "goals" && (
                        <>
                            <div>
                                {
                                    players
                                        .slice()
                                        .sort((a, b) => {
                                            const playerIdA = a.id;
                                            const playerIdB = b.id;

                                            const playerA = players.find((p) => p.id === playerIdA);
                                            const playerB = players.find((p) => p.id === playerIdB);

                                            const goalsA = playerA?.Goals ? Number(playerA.Goals) : 0;
                                            const goalsB = playerB?.Goals ? Number(playerB.Goals) : 0;

                                            return goalsB - goalsA;
                                        })
                                        .slice(0, 7)
                                        .map((pla) => {
                                            const playerId = pla.id;
                                            const player = players.find((p) => p.id === playerId);

                                            if (!player) {
                                                console.warn(`Player not found for player id: ${playerId}`);
                                                return null;
                                            }

                                            return (
                                                <div key={pla.id} className="album py-3 bg-custom-dark">
                                                    <div className="container">
                                                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                                            <div className="col">
                                                                <div className="card shadow-sm">
                                                                    <div className="card-body">
                                                                        <div className="row text-center align-items-center">
                                                                            <div className="col-4 d-flex flex-column align-items-left">
                                                                                <div className="d-flex align-items-left mb-2">
                                                                                    <img
                                                                                        src={pla.Photo?.[0]?.url || 'https://via.placeholder.com/48'}
                                                                                        alt={pla.Player_Name || 'Jugador'}
                                                                                        className="me-2"
                                                                                        style={{
                                                                                            width: "40px", // Ajusta el tamaño al que quieres que sea el círculo
                                                                                            height: "40px",
                                                                                            borderRadius: "50%",
                                                                                            objectFit: "cover", // Para mantener la proporción de la imagen
                                                                                        }}
                                                                                    />


                                                                                </div>
                                                                            </div>
                                                                            <div class="col-4 d-flex flex-column align-items-center">
                                                                                <span className="text-center">{pla.Player_Name}</span>
                                                                            </div>
                                                                            <div className="col-4 d-flex flex-column align-items-end">
                                                                                <span className="text-nowrap">{pla.Goals}</span>
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
                                }
                            </div>
                        </>
                    )}

                    {viewMode === 'assists' && (
                        <>
                            <div>
                                {
                                    players
                                        .slice()
                                        .sort((a, b) => {
                                            const playerIdA = a.id;
                                            const playerIdB = b.id;

                                            const playerA = players.find((p) => p.id === playerIdA);
                                            const playerB = players.find((p) => p.id === playerIdB);

                                            const assistsA = playerA?.Assists ? Number(playerA.Assists) : 0;
                                            const assistsB = playerB?.Assists ? Number(playerB.Assists) : 0;

                                            return assistsB - assistsA;
                                        })
                                        .slice(0, 7)
                                        .map((pla) => {
                                            const playerId = pla.id;
                                            const player = players.find((p) => p.id === playerId);

                                            if (!player) {
                                                console.warn(`Player not found for player id: ${playerId}`);
                                                return null;
                                            }

                                            return (
                                                <div key={pla.id} className="album py-3 bg-custom-dark">
                                                    <div className="container">
                                                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                                                            <div className="col">
                                                                <div className="card shadow-sm">
                                                                    <div className="card-body">
                                                                        <div className="row text-center align-items-center">
                                                                            <div className="col-4 d-flex flex-column align-items-left">
                                                                                <div className="d-flex align-items-left mb-2">
                                                                                    <img
                                                                                        src={pla.Photo?.[0]?.url || 'https://via.placeholder.com/48'}
                                                                                        alt={pla.Player_Name || 'Jugador'}
                                                                                        className="me-2"
                                                                                        style={{
                                                                                            width: "40px", // Ajusta el tamaño al que quieres que sea el círculo
                                                                                            height: "40px",
                                                                                            borderRadius: "50%",
                                                                                            objectFit: "cover", // Para mantener la proporción de la imagen
                                                                                        }}
                                                                                    />


                                                                                </div>
                                                                            </div>
                                                                            <div class="col-4 d-flex flex-column align-items-center">
                                                                                <span className="text-center">{pla.Player_Name}</span>
                                                                            </div>
                                                                            <div className="col-4 d-flex flex-column align-items-end">
                                                                                <span className="text-nowrap">{pla.Assists}</span>
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
                                }
                            </div>
                        </>
                    )}
                    
                </div>
            </main>
        </>
    );
}

export default Players;