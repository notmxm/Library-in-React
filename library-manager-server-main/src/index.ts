import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { initDatabase } from './db/database';
import { seedDatabase } from './db/seed';
import { authorsRoutes } from './routes/authors.routes';
import { booksRoutes } from './routes/books.routes';

async function startServer() {
    // Initialize database
    console.log('🔧 Initializing database...');
    initDatabase();

    // Seed database if empty (wait for it to complete)
    console.log('🌱 Checking if database needs seeding...');
    try {
        await seedDatabase();
        console.log('✅ Database ready!');
    } catch (error) {
        console.error('❌ Failed to seed database:', error);
        process.exit(1);
    }

    const app = new Elysia()
        .use(
            cors({
            origin: true, // Allow all origins
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            })
        )
        .use(
            swagger({
            documentation: {
                info: {
                    title: 'Library Manager API',
                    version: '1.0.0',
                    description: `
            A comprehensive REST API for managing a library system with books and authors.
            
            ## Features
            - **Authors Management**: Create, read, update, and delete authors
            - **Books Management**: Create, read, update, and delete books
            - **Relationships**: Books are linked to authors, and you can retrieve all books by a specific author
            
            ## Database
            This API uses SQLite as the database backend. The database is automatically initialized when the server starts.
            
            ## Endpoints Overview
            
            ### Authors
            - \`GET /authors\` - Get all authors
            - \`GET /authors/:id\` - Get author by ID
            - \`GET /authors/:id/books\` - Get all books by an author
            - \`POST /authors\` - Create a new author
            - \`PUT /authors/:id\` - Update an author
            - \`DELETE /authors/:id\` - Delete an author (only if no books exist)
            
            ### Books
            - \`GET /books\` - Get all books with author information
            - \`GET /books/:id\` - Get book by ID with author information
            - \`POST /books\` - Create a new book
            - \`PUT /books/:id\` - Update a book
            - \`DELETE /books/:id\` - Delete a book
          `
                },
                tags: [
                    {
                        name: 'Authors',
                        description: 'Operations related to author management'
                    },
                    {
                        name: 'Books',
                        description: 'Operations related to book management'
                    }
                ]
            }
        })
        )
        .get(
        '/',
        () => ({
            message: 'Library Manager API',
            version: '1.0.0',
            endpoints: {
                docs: '/swagger',
                authors: '/authors',
                books: '/books'
            }
        }),
        {
            detail: {
                tags: ['General'],
                summary: 'API Information',
                description: 'Get basic information about the API and available endpoints'
            }
        }
        )
        .use(authorsRoutes)
        .use(booksRoutes)
        .onError(({ code, error, set }) => {
            if (code === 'NOT_FOUND') {
                set.status = 404;
                return {
                    message: 'Not Found'
                };
            }
            const message = error instanceof Error ? error.message : 'Internal Server Error';
            return {
                message,
                code
            };
        })
        .listen(process.env.PORT || 3000);

    console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
    console.log(`📚 Library Manager API`);
    console.log(`📖 Swagger docs: http://${app.server?.hostname}:${app.server?.port}/swagger`);
}

startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
