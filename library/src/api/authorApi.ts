import axios from "axios";
import { apiClient, ApiError } from "./config";

import type {
  Author,
  Book,
  CreateAuthorDto,
  UpdateAuthorDto,
  PaginatedResponse,
  AuthorQueryParams,
  AuthorBookResponse,
  MessageResponse,
} from "../types";

export const authorsApi = {
  async getAll(
    params: AuthorQueryParams = {},
  ): Promise<PaginatedResponse<Author>> {
    try {
      /* 
        https://axios-http.com/docs/req_config 
        base url (definito nell'istanza) viene preposto a /authors a meno che nella richiesta get non 
        cominci con http://

        { params: params } è un oggetto di configurazione che axios usa per costruire la query string,
         di conseguenza uso le graffe per creare un oggetto
         di conseguenza uso i : per specificare che la chiave è params e il valore è params (quello passato alla funzione)
      */
      const response = await apiClient.get("/authors", { params: params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getById(id: number): Promise<Author> {
    try {
      const response = await apiClient.get(`/authors/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getBooks(id: number): Promise<AuthorBookResponse[]> {
    try {
      const response = await apiClient.get(`/authors/${id}/books`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async create(dto: CreateAuthorDto): Promise<Author> {
    try {
      const response = await apiClient.post("/authors", dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async update(id: number, dto: UpdateAuthorDto): Promise<Author> {
    try {
      const response = await apiClient.put(`/authors/${id}`, dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async delete(id: number): Promise<MessageResponse> {
    try {
      const response = await apiClient.delete(`/authors/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },


  /*
    uso || per avere anche i falsy come la stringa vuota
  */
  handleError(error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || "Errore sconosciuto";
      return new ApiError(error.response.status, message);
    }
    return error;
  },
};
