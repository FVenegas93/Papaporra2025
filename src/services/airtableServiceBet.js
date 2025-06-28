import axios from 'axios';

const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Bets'; // Cambia según tu tabla

const airtableBaseURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
    Authorization: `Bearer ${TOKEN}`,
};

export const setBet = async (newBet, id_match) => {
    try {

        // Validar campos obligatorios
        if (!newBet.Users || !newBet.Users.length || !newBet.Users[0]) {
            throw new Error("El campo 'Users' no tiene un valor válido.");
        }
        if (!newBet.Matches || !newBet.Matches.length || !newBet.Matches[0]) {
            throw new Error("El campo 'Match' es obligatorio.");
        }
        const data = {
            fields: {
                Bet_Goals_Team1: newBet.Bet_Goals_Team1,
                Bet_Goals_Team2: newBet.Bet_Goals_Team2,
                Bet_Match_Result_Overtime: newBet.Bet_Match_Result_Overtime,
                Users: Array.isArray(newBet.Users) ? newBet.Users : [newBet.Users],
                Matches: [id_match], // Debe ser un array con el ID del partido
            },
        };

        console.log("Data sent to Airtable (Bet):", JSON.stringify(data, null, 2));

        const response = await axios.post(airtableBaseURL, data, { headers });
        console.log('Airtable response: ', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Error response data: ", error.response.data);
        }
        console.error("Error creating bet: ", error);
        throw error;
    }
};

export const checkExistingBetByUser = async (user_id, match_id) => {
    try {
        const response = await axios.get(airtableBaseURL, { headers });
        const existingBets = response.data.records.filter(
            (record) =>
                record.fields.Users.includes(user_id) &&
                record.fields.Matches.includes(match_id)
        );

        return existingBets.length > 0;
    } catch (error) {
        console.error('Error checking existing bets per match and per user', error.response?.data || error.message);
        throw error;
    }
};

export const getBets = async () => {
    let allRecords = [];
    let offset = null;

    try {
        do {
            const response = await axios.get(airtableBaseURL, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
                params: {
                    offset, // Añadimos el offset si existe
                    pageSize: 100, // Límite de 100 registros por página
                },
            });

            const { records, offset: newOffset } = response.data;
            allRecords = [...allRecords, ...records]; // Añadir los registros obtenidos
            offset = newOffset; // Actualizar el offset para la siguiente página

        } while (offset); // Continuar mientras haya un offset

        return allRecords.map(record => ({ id: record.id, ...record.fields }));
    } catch (error) {
        console.error("Error fetching bets:", error);
        throw error;
    }
};

export const getBetsByUser = async (airtableId) => {
    try {
        let allBets = [];
        let offset = null;

        do {
            // Construir la URL con `pageSize` y `offset`
            const url = `${airtableBaseURL}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
            console.log("Fetching URL:", url);

            const response = await axios.get(url, { headers });

            // Agregar los registros obtenidos a la lista
            allBets = allBets.concat(response.data.records);

            // Actualizar `offset` para la próxima página
            offset = response.data.offset || null;
        } while (offset); // Continuar mientras haya más páginas

        console.log("All bets fetched:", allBets);

        // Filtrar las apuestas por `airtableId` en el campo `Users`
        const userBets = allBets.filter(
            (bet) => bet.fields.Users && bet.fields.Users[0] === airtableId
        );
        console.log("Filtered bets for user:", userBets);

        return userBets;
    } catch (error) {
        console.error(`Error fetching bets for user ${airtableId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const getIncompleteBetsByUser = async (airtableId) => {
    try {
        let allBets = [];
        let allMatches = [];
        let offset = null;

        // Fetch all bets
        do {
            const url = `${airtableBaseURL}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
            console.log("Fetching bets URL:", url);

            const response = await axios.get(url, { headers });
            allBets = allBets.concat(response.data.records);
            offset = response.data.offset || null;
        } while (offset);

        console.log("All bets fetched:", allBets);

        // Reset offset for fetching matches
        offset = null;

        // Fetch all matches
        do {
            const url = `https://api.airtable.com/v0/${BASE_ID}/matches?pageSize=100${offset ? `&offset=${offset}` : ""}`;
            console.log("Fetching matches URL:", url);

            const response = await axios.get(url, { headers });
            allMatches = allMatches.concat(response.data.records);
            offset = response.data.offset || null;
        } while (offset);

        console.log("All matches fetched:", allMatches);

        // Get match IDs that already have bets
        const matchesWithBets = allBets
            .map((bet) => bet.fields.Matches?.[0])
            .filter(Boolean);

        // Find matches without bets
        const matchesWithoutBets = allMatches.filter(
            (match) => !matchesWithBets.includes(match.id)
        );

        // Filter user's incomplete bets
        const userIncompleteBets = allBets.filter(
            (bet) =>
                bet.fields.Users &&
                bet.fields.Users[0] === airtableId &&
                (bet.fields.Bet_Goals_Team1 == null || bet.fields.Bet_Goals_Team2 == null)
        );

        // Combine user incomplete bets and matches without bets
        const userBets = [
            ...userIncompleteBets,
            ...matchesWithoutBets.map((match) => ({
                id: `temp-${match.id}`, // Temporary ID to differentiate
                fields: {
                    Matches: [match.id],
                    Bet_Goals_Team1: null,
                    Bet_Goals_Team2: null,
                    Users: [airtableId], // Optional: Assign current user
                },
            })),
        ];

        console.log("Filtered bets (including matches without bets):", userBets);
        return userBets;
    } catch (error) {
        console.error(`Error fetching bets or matches for user ${airtableId}:`, error.response?.data || error.message);
        throw error;
    }
};
