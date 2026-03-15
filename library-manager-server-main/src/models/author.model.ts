import db from '../db/database';
import type { Author, CreateAuthorDto, UpdateAuthorDto, AuthorFilters, PaginatedResponse } from '../types';
import { toCamelCase } from '../utils/transform';

export const authorModel = {
    findAll(filters?: AuthorFilters): PaginatedResponse<Author> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 100;
        const search = filters?.search?.trim();

        let query = 'SELECT * FROM authors';
        const conditions: string[] = [];
        const params: any[] = [];

        if (search) {
            conditions.push('name LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY name';

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const countStmt = db.prepare(countQuery);
        const totalResult = countStmt.get(...params) as { total: number };
        const total = totalResult.total;

        // Apply pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as any[];
        const data = results.map(toCamelCase) as Author[];

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

    findById(id: number): Author | null {
        const stmt = db.prepare('SELECT * FROM authors WHERE id = ?');
        const result = stmt.get(id) as any;
        return result ? (toCamelCase(result) as Author) : null;
    },

    create(data: CreateAuthorDto): Author {
        const stmt = db.prepare('INSERT INTO authors (name) VALUES (?) RETURNING *');
        const result = stmt.get(data.name) as any;
        return toCamelCase(result) as Author;
    },

    update(id: number, data: UpdateAuthorDto): Author | null {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(`UPDATE authors SET ${updates.join(', ')} WHERE id = ? RETURNING *`);
        const result = stmt.get(...values) as any;
        return result ? (toCamelCase(result) as Author) : null;
    },

    delete(id: number): boolean {
        const stmt = db.prepare('DELETE FROM authors WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    },

    hasBooks(id: number): boolean {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM books WHERE author_id = ?');
        const result = stmt.get(id) as { count: number };
        return result.count > 0;
    }
};
