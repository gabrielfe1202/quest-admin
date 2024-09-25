import axios from "axios";

export const httpInstance = axios.create({
    baseURL: 'https://quest-api-te2p.onrender.com/',
    timeout: 60000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
  });

  