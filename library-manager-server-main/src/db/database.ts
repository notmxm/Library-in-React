import { Database } from 'bun:sqlite';
import { mkdirSync } from 'fs';
import { join } from 'path';

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || 'data';
const dbPath = join(dataDir, 'library.db');

// Create data directory if it doesn't exist
try {
    mkdirSync(dataDir, { recursive: true });
} catch (error) {
    // Directory might already exist, which is fine
}

const db = new Database(dbPath);

// Initialize database schema
export function initDatabase() {
    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');

    // Create authors table
    db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Remove bio column if it exists (migration)
    try {
        const tableInfo = db.prepare('PRAGMA table_info(authors)').all() as Array<{ name: string }>;
        const columnNames = tableInfo.map(col => col.name);
        if (columnNames.includes('bio')) {
            // SQLite doesn't support DROP COLUMN directly, so we'll recreate the table
            db.exec(`
                CREATE TABLE IF NOT EXISTS authors_new (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                INSERT INTO authors_new (id, name, created_at, updated_at)
                SELECT id, name, created_at, updated_at FROM authors;
                DROP TABLE authors;
                ALTER TABLE authors_new RENAME TO authors;
            `);
        }
    } catch (error) {
        // Migration might fail if table doesn't exist yet, which is fine
        console.log('Migration check completed');
    }

    // Create books table with all CSV columns
    db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      isbn TEXT,
      isbn13 TEXT,
      author_id INTEGER NOT NULL,
      average_rating REAL,
      language_code TEXT,
      num_pages INTEGER,
      ratings_count INTEGER,
      text_reviews_count INTEGER,
      publication_date TEXT,
      publisher TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
    )
  `);

    // Migrate existing books table if needed (add new columns)
    try {
        const tableInfo = db.prepare('PRAGMA table_info(books)').all() as Array<{ name: string }>;
        const columnNames = tableInfo.map(col => col.name);

        if (!columnNames.includes('isbn13')) {
            db.exec('ALTER TABLE books ADD COLUMN isbn13 TEXT');
        }
        if (!columnNames.includes('average_rating')) {
            db.exec('ALTER TABLE books ADD COLUMN average_rating REAL');
        }
        if (!columnNames.includes('language_code')) {
            db.exec('ALTER TABLE books ADD COLUMN language_code TEXT');
        }
        if (!columnNames.includes('num_pages')) {
            db.exec('ALTER TABLE books ADD COLUMN num_pages INTEGER');
        }
        if (!columnNames.includes('ratings_count')) {
            db.exec('ALTER TABLE books ADD COLUMN ratings_count INTEGER');
        }
        if (!columnNames.includes('text_reviews_count')) {
            db.exec('ALTER TABLE books ADD COLUMN text_reviews_count INTEGER');
        }
        if (!columnNames.includes('publication_date')) {
            db.exec('ALTER TABLE books ADD COLUMN publication_date TEXT');
        }
        if (!columnNames.includes('publisher')) {
            db.exec('ALTER TABLE books ADD COLUMN publisher TEXT');
        }
    } catch (error) {
        // Table might not exist yet, which is fine
        console.log('Migration check completed');
    }

    // Create indexes for better performance
    db.exec(`
    CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON books(isbn13);
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
  `);

    console.log('✅ Database initialized successfully');
}

// Check if database is empty
export function isDatabaseEmpty(): boolean {
    const booksCount = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
    return booksCount.count === 0;
}

export default db;
