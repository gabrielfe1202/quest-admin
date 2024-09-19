import axios from "axios";

export const httpInstance = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 1000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
  });

  