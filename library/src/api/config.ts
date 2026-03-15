import axios from 'axios';


//https://vite.dev/guide/env-and-mode
const BASE_URL = import.meta.env.BASE_URL ?? "http://localhost:3000"


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


