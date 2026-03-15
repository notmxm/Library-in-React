import { Elysia, t } from 'elysia';
import { authorModel } from '../models/author.model';
import { bookModel } from '../models/book.model';

const authorSchema = {
    type: 'object' as const,
    properties: {
        id: { type: 'integer' as const, description: 'Unique identifier for the author' },
        name: { type: 'string' as const, description: 'Full name of the author' },
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
    required: ['id', 'name', 'createdAt', 'updatedAt']
};

const paginatedAuthorSchema = {
    type: 'object' as const,
    properties: {
        data: {
            type: 'array' as const,
            items: authorSchema
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

export const authorsRoutes = new Elysia({ prefix: '/authors' })
    .get(
        '/',
        ({ query, set }) => {
            const page = query.page ? parseInt(query.page, 10) : undefined;
            const limit = query.limit ? parseInt(query.limit, 10) : undefined;
            const search = query.search;

            if (page !== undefined && (isNaN(page) || page < 1)) {
                set.status = 400;
                return { message: 'Page must be a positive integer' };
            }

            if (limit !== undefined && (isNaN(limit) || limit < 1)) {
                set.status = 400;
                return { message: 'Limit must be a positive integer' };
            }

            const filters: any = { page, limit, search };
            return authorModel.findAll(filters);
        },
        {
            query: t.Object({
                page: t.Optional(
                    t.String({ description: 'Page number (starts at 1, defaults to 1)' })
                ),
                limit: t.Optional(
                    t.String({ description: 'Number of items per page (defaults to 100)' })
                ),
                search: t.Optional(t.String({ description: 'Search authors by name' }))
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Get all authors',
                description:
                    'Retrieve a paginated list of authors with optional search. Defaults to page 1, limit 100.',
                responses: {
                    200: {
                        description: 'List of authors retrieved successfully',
                        content: {
                            'application/json': {
                                schema: paginatedAuthorSchema
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
            const author = authorModel.findById(params.id);
            if (!author) {
                set.status = 404;
                return { message: 'Author not found' };
            }
            return author;
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Author ID' })
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Get author by ID',
                description: 'Retrieve detailed information about a specific author by their ID',
                responses: {
                    200: {
                        description: 'Author retrieved successfully',
                        content: {
                            'application/json': {
                                schema: authorSchema
                            }
                        }
                    },
                    404: {
                        description: 'Author not found',
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
    .get(
        '/:id/books',
        ({ params, set }) => {
            const author = authorModel.findById(params.id);
            if (!author) {
                set.status = 404;
                return { message: 'Author not found' };
            }
            return bookModel.findByAuthorId(params.id);
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Author ID' })
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Get books by author',
                description: 'Retrieve all books written by a specific author',
                responses: {
                    200: {
                        description: 'List of books retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer' },
                                            title: { type: 'string' },
                                            isbn: { type: 'string', nullable: true },
                                            authorId: { type: 'integer' },
                                            year: { type: 'integer', nullable: true },
                                            description: { type: 'string', nullable: true },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            updatedAt: { type: 'string', format: 'date-time' }
                                        }
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
    .post(
        '/',
        ({ body, set }) => {
            if (!body.name || body.name.trim().length === 0) {
                set.status = 400;
                return { message: 'Name is required' };
            }
            set.status = 201;
            return authorModel.create(body);
        },
        {
            body: t.Object({
                name: t.String({ description: 'Full name of the author', minLength: 1 })
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Create a new author',
                description: 'Add a new author to the library. The name field is required.',
                responses: {
                    201: {
                        description: 'Author created successfully',
                        content: {
                            'application/json': {
                                schema: authorSchema
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
                    }
                }
            }
        }
    )
    .put(
        '/:id',
        ({ params, body, set }) => {
            const author = authorModel.findById(params.id);
            if (!author) {
                set.status = 404;
                return { message: 'Author not found' };
            }
            const updated = authorModel.update(params.id, body);
            if (!updated) {
                set.status = 500;
                return { message: 'Failed to update author' };
            }
            return updated;
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Author ID' })
            }),
            body: t.Object({
                name: t.Optional(t.String({ description: 'Full name of the author', minLength: 1 }))
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Update an author',
                description:
                    'Update information about an existing author. All fields are optional.',
                responses: {
                    200: {
                        description: 'Author updated successfully',
                        content: {
                            'application/json': {
                                schema: authorSchema
                            }
                        }
                    },
                    404: {
                        description: 'Author not found'
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
            const author = authorModel.findById(params.id);
            if (!author) {
                set.status = 404;
                return { message: 'Author not found' };
            }
            if (authorModel.hasBooks(params.id)) {
                set.status = 400;
                return { message: 'Cannot delete author with existing books' };
            }
            const deleted = authorModel.delete(params.id);
            if (!deleted) {
                set.status = 500;
                return { message: 'Failed to delete author' };
            }
            return { message: 'Author deleted successfully' };
        },
        {
            params: t.Object({
                id: t.Number({ description: 'Author ID' })
            }),
            detail: {
                tags: ['Authors'],
                summary: 'Delete an author',
                description:
                    'Delete an author from the library. Authors with existing books cannot be deleted.',
                responses: {
                    200: {
                        description: 'Author deleted successfully',
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
                    400: {
                        description: 'Cannot delete author with existing books'
                    },
                    404: {
                        description: 'Author not found'
                    }
                }
            }
        }
    );
