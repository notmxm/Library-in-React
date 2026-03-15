import db from '../db/database';
import type { Book, CreateBookDto, UpdateBookDto, BookWithAuthor, BookFilters, PaginatedResponse } from '../types';
import { toCamelCase } from '../utils/transform';

export const bookModel = {
    findAll(filters?: BookFilters): PaginatedResponse<BookWithAuthor> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 100;
        const search = filters?.search?.trim();

        let query = `
      SELECT 
        b.id,
        b.title,
        b.isbn,
        b.isbn13,
        b.author_id,
        b.average_rating,
        b.language_code,
        b.num_pages,
        b.ratings_count,
        b.text_reviews_count,
        b.publication_date,
        b.publisher,
        b.created_at,
        b.updated_at,
        a.name as author_name
      FROM books b
      INNER JOIN authors a ON b.author_id = a.id
    `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (search) {
            conditions.push('(b.title LIKE ? OR a.name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (filters?.authorId) {
            conditions.push('b.author_id = ?');
            params.push(filters.authorId);
        }

        if (filters?.languageCode) {
            conditions.push('b.language_code = ?');
            params.push(filters.languageCode);
        }

        if (filters?.minRating !== undefined) {
            conditions.push('b.average_rating >= ?');
            params.push(filters.minRating);
        }

        if (filters?.maxRating !== undefined) {
            conditions.push('b.average_rating <= ?');
            params.push(filters.maxRating);
        }

        if (filters?.publisher) {
            conditions.push('b.publisher LIKE ?');
            params.push(`%${filters.publisher}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY b.title';

        // Get total count
        const countQuery = query.replace(
            /SELECT[\s\S]*?FROM/,
            'SELECT COUNT(*) as total FROM'
        );
        const countStmt = db.prepare(countQuery);
        const totalResult = countStmt.get(...params) as { total: number };
        const total = totalResult.total;

        // Apply pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as any[];
        const data = results.map(toCamelCase) as BookWithAuthor[];

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    findById(id: number): BookWithAuthor | null {
        const stmt = db.prepare(`
      SELECT 
        b.id,
        b.title,
        b.isbn,
        b.isbn13,
        b.author_id,
        b.average_rating,
        b.language_code,
        b.num_pages,
        b.ratings_count,
        b.text_reviews_count,
        b.publication_date,
        b.publisher,
        b.created_at,
        b.updated_at,
        a.name as author_name
      FROM books b
      INNER JOIN authors a ON b.author_id = a.id
      WHERE b.id = ?
    `);
        const result = stmt.get(id) as any;
        return result ? (toCamelCase(result) as BookWithAuthor) : null;
    },

    findByAuthorId(authorId: number): Book[] {
        const stmt = db.prepare(
            'SELECT * FROM books WHERE author_id = ? ORDER BY title'
        );
        const results = stmt.all(authorId) as any[];
        return results.map(toCamelCase) as Book[];
    },

    create(data: CreateBookDto): Book {
        const stmt = db.prepare(
            `INSERT INTO books (
        title, isbn, isbn13, author_id, average_rating, language_code,
        num_pages, ratings_count, text_reviews_count, publication_date, publisher
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
        );
        const result = stmt.get(
            data.title,
            data.isbn || null,
            data.isbn13 || null,
            data.authorId,
            data.averageRating || null,
            data.languageCode || null,
            data.numPages || null,
            data.ratingsCount || null,
            data.textReviewsCount || null,
            data.publicationDate || null,
            data.publisher || null
        ) as any;
        return toCamelCase(result) as Book;
    },

    update(id: number, data: UpdateBookDto): Book | null {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title);
        }
        if (data.isbn !== undefined) {
            updates.push('isbn = ?');
            values.push(data.isbn);
        }
        if (data.isbn13 !== undefined) {
            updates.push('isbn13 = ?');
            values.push(data.isbn13);
        }
        if (data.authorId !== undefined) {
            updates.push('author_id = ?');
            values.push(data.authorId);
        }
        if (data.averageRating !== undefined) {
            updates.push('average_rating = ?');
            values.push(data.averageRating);
        }
        if (data.languageCode !== undefined) {
            updates.push('language_code = ?');
            values.push(data.languageCode);
        }
        if (data.numPages !== undefined) {
            updates.push('num_pages = ?');
            values.push(data.numPages);
        }
        if (data.ratingsCount !== undefined) {
            updates.push('ratings_count = ?');
            values.push(data.ratingsCount);
        }
        if (data.textReviewsCount !== undefined) {
            updates.push('text_reviews_count = ?');
            values.push(data.textReviewsCount);
        }
        if (data.publicationDate !== undefined) {
            updates.push('publication_date = ?');
            values.push(data.publicationDate);
        }
        if (data.publisher !== undefined) {
            updates.push('publisher = ?');
            values.push(data.publisher);
        }

        if (updates.length === 0) {
            const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
            const result = stmt.get(id) as any;
            return result ? (toCamelCase(result) as Book) : null;
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(
            `UPDATE books SET ${updates.join(', ')} WHERE id = ? RETURNING *`
        );
        const result = stmt.get(...values) as any;
        return result ? (toCamelCase(result) as Book) : null;
    },

    delete(id: number): boolean {
        const stmt = db.prepare('DELETE FROM books WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
};
