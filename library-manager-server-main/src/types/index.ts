export interface Author {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: number;
  title: string;
  isbn?: string;
  isbn13?: string;
  authorId: number;
  averageRating?: number;
  languageCode?: string;
  numPages?: number;
  ratingsCount?: number;
  textReviewsCount?: number;
  publicationDate?: string;
  publisher?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuthorDto {
  name: string;
}

export interface UpdateAuthorDto {
  name?: string;
}

export interface CreateBookDto {
  title: string;
  isbn?: string;
  isbn13?: string;
  authorId: number;
  averageRating?: number;
  languageCode?: string;
  numPages?: number;
  ratingsCount?: number;
  textReviewsCount?: number;
  publicationDate?: string;
  publisher?: string;
}

export interface UpdateBookDto {
  title?: string;
  isbn?: string;
  isbn13?: string;
  authorId?: number;
  averageRating?: number;
  languageCode?: string;
  numPages?: number;
  ratingsCount?: number;
  textReviewsCount?: number;
  publicationDate?: string;
  publisher?: string;
}

export interface BookWithAuthor extends Book {
  authorName: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
}

export interface AuthorFilters extends PaginationParams, SearchParams {}

export interface BookFilters extends PaginationParams, SearchParams {
  authorId?: number;
  languageCode?: string;
  minRating?: number;
  maxRating?: number;
  publisher?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
