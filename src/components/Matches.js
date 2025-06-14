import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches } from "../services/airtableServiceMatch.js";
import { getTeams } from "../services/airtableServiceTeam.js";
import Navigation from './utils/Navigation.js';
import '../styles/Navigation.css';
import '../styles/DisplayMatches.css';
import '../styles/MainStyle.css';

const Matches = () => {
    const [user, setUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

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
                goals: match.Goals_Team2 || 0,
            },
        };
    };

    if (loading) return <div class="spinner-border text-dark" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>;

    return (
        <>
            <Navigation setUser={setUser} />

            <main className="main">
                <h2 className="gradient-text title ">Partidos</h2>
                {matches
                    .slice() // Para no mutar el estado original
                    .sort((a, b) => a.ID_Match - b.ID_Match) // Ordenar por ID_Match
                    .map((match) => {
                        const { team1, team2 } = getTeamNames(match.Teams, match);

                        return (

                            <div class="album py-5 bg-custom-dark">
                                <div class="container">

                                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">

                                        <div key={match.id} class="col">
                                            <div class="card shadow-sm">
                                                <div class="card-body">
                                                    <p className="text-center">
                                                        {new Date(match.Match_Date).toLocaleString("es-ES", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })}
                                                    </p>
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
                                                            <div class="btn-group mb-2">
                                                                <button type="button" class="btn btn-sm btn-outline-secondary">Gol</button>
                                                            </div>
                                                            <div class="btn-group">
                                                                <button type="button" class="btn btn-sm btn-outline-secondary">Gol</button>
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
            </main>

        </>
    );
};

export default Matches;