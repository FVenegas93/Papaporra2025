import axios from 'axios';

const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Bets'; // Cambia según tu tabla

const airtableBaseURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

export const getBetsByUser = async (user_id) => {
    try {
        const response = await axios.get(airtableBaseURL, {headers});
        return response.data.records.map((record) => ({
            id: record.id,
            ...record.fields,
        }));
    } catch (error) {
        console.error('Error fetching bets from Airtable', error.response?.data || error.message);
        throw error;
    }
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
                Bet_Match_Result: newBet.Bet_Match_Result,
                Bet_Match_Result_Extra_Time: newBet.Bet_Match_Result_Extra_Time,
                Users: newBet.Users, // Debe ser un array con IDs válidos de Airtable
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
