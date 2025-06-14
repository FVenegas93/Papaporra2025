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

