import axios from 'axios';

const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Users'; // Cambia según tu tabla

const airtableBaseURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

// GET USERS
export const getUsers = async () => {
  try {
    const response = await axios.get(airtableBaseURL, { headers });
    return response.data.records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching users from Airtable:', error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const header = {
      Authorization: `Bearer ${TOKEN}`, // Reemplaza con tu clave
      "Content-Type": "application/json",
    };
    const response = await axios.get(airtableBaseURL, { headers: header });
    console.log("Raw Response:", response); // Para ver qué devuelve la API

    return response.data.records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching users from Airtable:', error);
    throw error;
  }
};

// SET USER
export const addUser = async (newUser) => {

  try {
    const data = {
      fields: {
        Name: newUser.Name,
        Surname1: newUser.Surname1,
        Surname2: newUser.Surname2,
        Email: newUser.Email,
        Password: newUser.Password,
        Money_Bet: newUser.Money_Bet ? Number(newUser.Money_Bet) : null,
        Sex_Orientation: newUser.Sex_Orientation,
        Religion: newUser.Religion,
        Fav_Player: newUser.Fav_Player,
        Fav_Manager: newUser.Fav_Manager,
        Fav_Football_Sentence: newUser.Fav_Football_Sentence,
        Top_Scorer: newUser.Top_Scorer,
        Top_Assist: newUser.Top_Assist,
        Winner: newUser.Winner,
        Runner_Up: newUser.Runner_Up,
        Semifinalist1: newUser.Semifinalist1,
        Semifinalist2: newUser.Semifinalist2,
      },
    };

    console.log("Data que se envía a Airtable:", JSON.stringify(data, null, 2));

    const response = await axios.post(airtableBaseURL, data, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;

  } catch (error) {
    if (error.response) {
      // Error que responde Airtable
      console.error("Error response data:", error.response.data);
    }
    console.error("Error creating user: ", error);
    throw error;
  }
}

export const getUserByIdUser = async (idUser) => {
  try {
    // La fórmula de filtro debe ser un string válido para Airtable
    const filter = `ID_User = ${idUser}`;
    const response = await axios.get(`${airtableBaseURL}?filterByFormula=${encodeURIComponent(filter)}`, {
      headers,
    });
    if (response.data.records.length === 0) {
      console.warn(`No se encontró un usuario con ID_User ${idUser}`);
      return null;
    }

    // Devolver el primer registro encontrado
    return response.data.records[0];
  } catch (error) {
    console.error(`Error fetching user with ID_User ${idUser}:`, error.response?.data || error.message);
    throw error;
  }
};

