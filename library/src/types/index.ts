
export type Author = {
    id : number,
    name: string,
    createdAt: string,
    updatedAt: string
}

/* Le richieste POST, PUT PATCH hanno un body, quindi
per esempio mi serve CreateAuthroDto per specificare
la forma del messaggio che mando */

/* Invece le richieste GET, DELETE non hanno un body
quindi per il get author by id non mi serve un DTO 
che specifica la forma del messaggio */


/* min lenght sarebbe 1, ma non si può fare con typescript direttamente 
nella definizione del dto. Ci sono altre librerie esterne come zod che lo permettono */

export type CreateAuthorDto = {
    name: string
}

export type UpdateAuthorDto = CreateAuthorDto

export type MessageResponse = {
    message: string
}

export type ApiErrorResponse = MessageResponse

export type AuthorBookResponse = {
    id: number,
    title: string,
    isbn: string | null,
    authorId: number,
    year: number | null,
    description: string | null,
    createdAt: string,
    updatedAt: string
}


/* Differenza semantica tra path params e query params:
    path indica il "chi", es authors/1

    Query indica il come (filtro o opzione)
    es. /authors?page=1&search=esempio

    i parametri sono opzionali perchè se non vengono
    indicati usa i valori di default 
    es. page = 1
        limit = 100

*/

export type AuthorQueryParams = {
    page?: number,
    limit?: number,
    search?: string
}

export type Pagination = {
    page: number,
    limit: number,
    total: number,
    totalPages: number
}

/*

in questo modo non posso accede al tipo specifico di data,
 se voglio accedere a data come array di Author o Book, 
 devo fare un type assertion


export interface PaginatedResponse {
    data: Author[] | Book[],
    pagination: Pagination
}
*/

export type PaginatedResponse<T> = {
    data: T[],
    pagination: Pagination
}

export type CreateBookDto = {
    authorId: number;
    authorName: string;  
    title: string;
    averageRating?: number;
    isbn?: string;
    isbn13?: string;
    languageCode?: string;
    numPages?: number;
    publicationDate?: string;
    publisher?: string;
    ratingsCount?: number;
    textReviewsCount?: number;
}

export type Book = CreateBookDto & {
    id: number;
    createdAt: string;
    updatedAt: string;
}

export type BookQueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    authorId?: number;
    languageCode?: string;
    minRating?: number;
    maxRating?: number;
    publisher?: string;
}

export type UpdateBookDto = Partial<CreateBookDto>;