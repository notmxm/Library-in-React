# Library Manager API

A REST API for managing a library system with books and authors, built with Bun, Elysia, and SQLite.

## Features

- **Authors Management**: Full CRUD operations for authors
- **Books Management**: Full CRUD operations for books
- **Relationships**: Books are linked to authors with foreign key constraints
- **OpenAPI Documentation**: Comprehensive Swagger documentation
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Runtime**: Bun 1.3.7
- **Framework**: Elysia
- **Database**: SQLite (using bun:sqlite)
- **Documentation**: @elysiajs/swagger

## Prerequisites

- [Bun](https://bun.sh) installed (or use Docker)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### Local Development

1. Install dependencies:
```bash
mise x -- bun install
```

2. Run the development server:
```bash
mise x -- bun run dev
```

The server will start on `http://localhost:3000`

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

2. Or build and run manually:
```bash
docker build -t library-manager-api .
docker run -p 3000:3000 library-manager-api
```

## API Endpoints

### Authors

- `GET /authors` - Get all authors
- `GET /authors/:id` - Get author by ID
- `GET /authors/:id/books` - Get all books by an author
- `POST /authors` - Create a new author
- `PUT /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author (only if no books exist)

### Books

- `GET /books` - Get all books with author information
- `GET /books/:id` - Get book by ID with author information
- `POST /books` - Create a new book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/swagger
- **OpenAPI JSON**: http://localhost:3000/swagger/json

## Database

The SQLite database (`library.db`) is automatically created and initialized when the server starts. The database schema includes:

- **authors** table: id, name, bio, created_at, updated_at
- **books** table: id, title, isbn, author_id, year, description, created_at, updated_at

Foreign key constraints ensure data integrity between books and authors.

## Project Structure

```
src/
├── db/
│   └── database.ts       # Database initialization and connection
├── models/
│   ├── author.model.ts  # Author data access layer
│   └── book.model.ts    # Book data access layer
├── routes/
│   ├── authors.routes.ts # Author API routes
│   └── books.routes.ts   # Book API routes
├── types/
│   └── index.ts          # TypeScript type definitions
└── index.ts              # Main application entry point
```

## Example Requests

### Create an Author

```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J.K. Rowling",
    "bio": "British author, best known for the Harry Potter series"
  }'
```

### Create a Book

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Harry Potter and the Philosopher'\''s Stone",
    "isbn": "978-0747532699",
    "author_id": 1,
    "year": 1997,
    "description": "The first book in the Harry Potter series"
  }'
```

### Get All Books

```bash
curl http://localhost:3000/books
```

## License

This project is created for educational purposes.
