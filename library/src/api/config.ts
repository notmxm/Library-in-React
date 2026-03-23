/*
    usando fetch se il server risponde viene sempre considerato successo, anche se il codice di stato è 400 o 500,
    con axios invece viene considerato errore se il codice di stato è fuori dall intervallo 200-299, 
    quindi posso gestire gli errori direttamente nel catch del try-catch
*/

import axios from 'axios';


//https://vite.dev/guide/env-and-mode
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"


export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string){
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }

}

// https://axios-http.com/docs/instance
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
})


// interceptor?


