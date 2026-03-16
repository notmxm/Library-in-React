import { isAxiosError } from "axios";
import type {
  Book,
  BookQueryParams,
  CreateBookDto,
  MessageResponse,
  PaginatedResponse,
  UpdateBookDto,
} from "../types";
import { apiClient, ApiError } from "./config";

export const bookApi = {
  async getAll(params: BookQueryParams = {}): Promise<PaginatedResponse<Book>> {
    try {
      const response = await apiClient.get("/books", { params: params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getById(id: number): Promise<Book> {
    try {
      const response = await apiClient.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async create(dto: CreateBookDto): Promise<Book> {
    try {
      const response = await apiClient.post(`/books`, dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    try {
      const response = await apiClient.put(`/books/${id}`, dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async delete(id: number): Promise<MessageResponse> {
    try {
      const response = await apiClient.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: unknown) {
    if (isAxiosError(error) && error.response) {
      const message = error.response.data?.message || "Errore sconosciuto";
      return new ApiError(error.response.status, message);
    }
    return error;
  },
};
