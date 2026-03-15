import { Elysia, t } from 'elysia';
import { bookModel } from '../models/book.model';
import { authorModel } from '../models/author.model';

const bookSchema = {
    type: 'object' as const,
    properties: {
        id: { type: 'integer' as const, description: 'Unique identifier for the book' },
        title: { type: 'string' as const, description: 'Title of the book' },
        isbn: {
            type: 'string' as const,
            nullable: true,
            description: 'International Standard Book Number (ISBN-10)'
        },
        isbn13: {
            type: 'string' as const,
            nullable: true,
            description: 'International Standard Book Number (ISBN-13)'
        },
        authorId: { type: 'integer' as const, description: "ID of the book's author" },
        authorName: { type: 'string' as const, description: "Name of the book's author" },
        averageRating: {
            type: 'number' as const,
            nullable: true,
            description: 'Average rating of the book'
        },
        languageCode: {
            type: 'string' as const,
            nullable: true,
            description: 'Language code (e.g., eng, en-US)'
        },
        numPages: { type: 'integer' as const, nullable: true, description: 'Number of pages' },
        ratingsCount: {
            type: 'integer' as const,
            nullable: true,
            description: 'Total number of ratings'
        },
        textReviewsCount: {
            type: 'integer' as const,
            nullable: true,
            description: 'Total number of text reviews'
        },
        publicationDate: {
            type: 'string' as const,
            nullable: true,
            description: 'Publication date'
        },
        publisher: { type: 'string' as const, nullable: true, description: 'Publisher name' },
        createdAt: {
            type: 'string' as const,
            format: 'date-time',
            description: 'Creation timestamp'
        },
        updatedAt: {
            type: 'string' as const,
            format: 'date-time',
            description: 'Last update timestamp'
        }
    },
    required: ['id', 'title', 'authorId', 'authorName', 'createdAt', 'updatedAt']
};

const paginatedBookSchema = {
    type: 'object' as const,
    properties: {
        data: {
            type: 'array' as const,
            items: bookSchema
        },
        pagination: {
            type: 'object' as const,
            properties: {
                page: { type: 'integer' as const },
                limit: { type: 'integer' as const },
                total: { type: 'integer' as const },
                totalPages: { type: 'integer' as const }
            }
        }
    }
};

export const booksRoutes = new Elysia({ prefix: '/books' })
    .get(
        '/',
        ({ query, set }) => {
            const page = query.page ? parseInt(query.page, 10) : undefined;
            const limit = query.limit ? parseInt(query.limit, 10) : undefined;
            const search = query.search;
            const authorId = query.authorId ? parseInt(query.authorId, 10) : undefined;
            const languageCode = query.languageCode;
            const minRating = query.minRating ? parseFloat(query.minRating) : undefined;
            const maxRating = query.maxRating ? parseFloat(query.maxRating) : undefined;
            const publisher = query.publisher;

            if (page !== undefined && (isNaN(page) || page < 1)) {
                set.status = 400;
                return { message: 'Page must be a positive integer' };
            }

            if (limit !== undefined && (isNaN(limit) || limit < 1)) {
                set.status = 400;
                return { message: 'Limit must be a positive integer' };
            }

            if (authorId !== undefined && isNaN(authorId)) {
                set.status = 400;
                return { message: 'Author ID must be a valid integer' };
            }

            if (minRating !== undefined && (isNaN(minRating) || minRating < 0 || minRating > 5)) {
                set.status = 400;
                return { message: 'Min rating must be a number between 0 and 5' };
            }

            if (maxRating !== undefined && (isNaN(maxRating) || maxRating < 0 || maxRating > 5)) {
                set.status = 400;
                return { message: 'Max rating must be a number between 0 and 5' };
            }

            const filters: any = {
                page,
                limit,
                search,
                authorId,
                languageCode,
                minRating,
                maxRating,
                publisher
            };
            return bookModel.findAll(filters);
        },
        {
            query: t.Object({
                page: t.Optional(
                    t.String({ description: 'Page number (starts at 1, defaults to 1)' })
                ),
                limit: t.Optional(
                    t.String({ description: 'Number of items per page (defaults to 100)' })
                ),
                search: t.Optional(
                    t.String({ description: 'Search books by title or author name' })
                ),
                authorId: t.Optional(t.String({ description: 'Filter by author ID' })),
                languageCode: t.Optional(
                    t.String({ description: 'Filter by language code (e.g., eng, en-US)' })
                ),
                minRating: t.Optional(t.String({ description: 'Minimum average rating (0-5)' })),
                maxRating: t.Optional(t.String({ description: 'Maximum average rating (0-5)' })),
                publisher: t.Optional(t.String({ description: 'Filter by publisher name' }))
            }),
            detail: {
                tags: ['Books'],
                summary: 'Get all books',
                description:
                    'Retrieve a paginated list of books with optional search and filters. Defaults to page 1, limit 100.',
                responses: {
                    200: {
                        description: 'List of books retrieved successfully',
                        content: {
                            'application/json': {
                                schema: paginatedBookSchema
                            }
                        }
                    },
                    400: {
                        description: 'Invalid query parameters'
                    }
                }
            }
        }
    )
    .get(
        '/:id',
        ({ params, set }) => {
            const book = bookModel.findById(params.id);
            if (!book) {
                set.status = 404;
                return { message: 'Book not found' };
            }
            return book;
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Book ID' })
            }),
            detail: {
                tags: ['Books'],
                summary: 'Get book by ID',
                description:
                    'Retrieve detailed information about a specific book by its ID, including author information',
                responses: {
                    200: {
                        description: 'Book retrieved successfully',
                        content: {
                            'application/json': {
                                schema: bookSchema
                            }
                        }
                    },
                    404: {
                        description: 'Book not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    )
    .post(
        '/',
        ({ body, set }) => {
            if (!body.title || body.title.trim().length === 0) {
                set.status = 400;
                return { message: 'Title is required' };
            }
            if (!body.authorId) {
                set.status = 400;
                return { message: 'Author ID is required' };
            }
            const author = authorModel.findById(body.authorId);
            if (!author) {
                set.status = 404;
                return { message: 'Author not found' };
            }
            set.status = 201;
            return bookModel.create(body);
        },
        {
            body: t.Object({
                title: t.String({ description: 'Title of the book', minLength: 1 }),
                isbn: t.Optional(
                    t.String({ description: 'International Standard Book Number (ISBN-10)' })
                ),
                isbn13: t.Optional(
                    t.String({ description: 'International Standard Book Number (ISBN-13)' })
                ),
                authorId: t.Number({ description: "ID of the book's author" }),
                averageRating: t.Optional(
                    t.Number({ description: 'Average rating of the book', minimum: 0, maximum: 5 })
                ),
                languageCode: t.Optional(
                    t.String({ description: 'Language code (e.g., eng, en-US)' })
                ),
                numPages: t.Optional(t.Number({ description: 'Number of pages', minimum: 1 })),
                ratingsCount: t.Optional(
                    t.Number({ description: 'Total number of ratings', minimum: 0 })
                ),
                textReviewsCount: t.Optional(
                    t.Number({ description: 'Total number of text reviews', minimum: 0 })
                ),
                publicationDate: t.Optional(t.String({ description: 'Publication date' })),
                publisher: t.Optional(t.String({ description: 'Publisher name' }))
            }),
            detail: {
                tags: ['Books'],
                summary: 'Create a new book',
                description:
                    'Add a new book to the library. Title and authorId are required fields.',
                responses: {
                    201: {
                        description: 'Book created successfully',
                        content: {
                            'application/json': {
                                schema: bookSchema
                            }
                        }
                    },
                    400: {
                        description: 'Invalid input data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Author not found'
                    }
                }
            }
        }
    )
    .put(
        '/:id',
        ({ params, body, set }) => {
            const book = bookModel.findById(params.id);
            if (!book) {
                set.status = 404;
                return { message: 'Book not found' };
            }
            if (body.authorId !== undefined) {
                const author = authorModel.findById(body.authorId);
                if (!author) {
                    set.status = 404;
                    return { message: 'Author not found' };
                }
            }
            const updated = bookModel.update(params.id, body);
            if (!updated) {
                set.status = 500;
                return { message: 'Failed to update book' };
            }
            return updated;
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Book ID' })
            }),
            body: t.Object({
                title: t.Optional(t.String({ description: 'Title of the book', minLength: 1 })),
                isbn: t.Optional(
                    t.String({ description: 'International Standard Book Number (ISBN-10)' })
                ),
                isbn13: t.Optional(
                    t.String({ description: 'International Standard Book Number (ISBN-13)' })
                ),
                authorId: t.Optional(t.Number({ description: "ID of the book's author" })),
                averageRating: t.Optional(
                    t.Number({ description: 'Average rating of the book', minimum: 0, maximum: 5 })
                ),
                languageCode: t.Optional(
                    t.String({ description: 'Language code (e.g., eng, en-US)' })
                ),
                numPages: t.Optional(t.Number({ description: 'Number of pages', minimum: 1 })),
                ratingsCount: t.Optional(
                    t.Number({ description: 'Total number of ratings', minimum: 0 })
                ),
                textReviewsCount: t.Optional(
                    t.Number({ description: 'Total number of text reviews', minimum: 0 })
                ),
                publicationDate: t.Optional(t.String({ description: 'Publication date' })),
                publisher: t.Optional(t.String({ description: 'Publisher name' }))
            }),
            detail: {
                tags: ['Books'],
                summary: 'Update a book',
                description: 'Update information about an existing book. All fields are optional.',
                responses: {
                    200: {
                        description: 'Book updated successfully',
                        content: {
                            'application/json': {
                                schema: bookSchema
                            }
                        }
                    },
                    404: {
                        description: 'Book or author not found'
                    },
                    500: {
                        description: 'Internal server error'
                    }
                }
            }
        }
    )
    .delete(
        '/:id',
        ({ params, set }) => {
            const book = bookModel.findById(params.id);
            if (!book) {
                set.status = 404;
                return { message: 'Book not found' };
            }
            const deleted = bookModel.delete(params.id);
            if (!deleted) {
                set.status = 500;
                return { message: 'Failed to delete book' };
            }
            return { message: 'Book deleted successfully' };
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Book ID' })
            }),
            detail: {
                tags: ['Books'],
                summary: 'Delete a book',
                description: 'Delete a book from the library',
                responses: {
                    200: {
                        description: 'Book deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Book not found'
                    },
                    500: {
                        description: 'Internal server error'
                    }
                }
            }
        }
    );
