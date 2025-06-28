import axios from 'axios';

const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Matches'; // Cambia según tu tabla

const airtableBaseURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

export const getMatches = async () => {
  try {
    const response = await axios.get(airtableBaseURL, { headers });
    return response.data.records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching matches from Airtable:', error);
    throw error;
  }
};

export const updateMatchGoals = async (matchId, goalsTeam1, goalsTeam2, goalsTeam1ot = null, goalsTeam2ot = null) => {
    try {
        const response = await axios.patch(
            `${airtableBaseURL}/${matchId}`,
            {
                fields: {
                    Goals_Team1: goalsTeam1,
                    Goals_Team2: goalsTeam2,
                    Goals_Team1_Overtime: goalsTeam1ot,
                    Goals_Team2_Overtime: goalsTeam2ot,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Airtable response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating match goals:", error);
        throw error;
    }
};

