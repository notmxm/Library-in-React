import db from './database';
import { isDatabaseEmpty } from './database';

interface CSVRow {
    bookID: string;
    title: string;
    authors: string;
    average_rating: string;
    isbn: string;
    isbn13: string;
    language_code: string;
    num_pages: string;
    ratings_count: string;
    text_reviews_count: string;
    publication_date: string;
    publisher: string;
}

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function parsePublicationDate(dateStr: string): number | null {
    if (!dateStr || dateStr.trim() === '') return null;
    
    // Try to parse dates like "9/16/2006" or "2006-09-16"
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const year = parseInt(parts[2], 10);
        if (!isNaN(year) && year > 1000 && year < 3000) {
            return year;
        }
    }
    
    // Try ISO format
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.getFullYear();
    }
    
    return null;
}

function getOrCreateAuthor(authorName: string): number {
    const trimmedName = authorName.trim();
    if (!trimmedName) {
        throw new Error('Author name cannot be empty');
    }

    // Check if author exists
    const existing = db.prepare('SELECT id FROM authors WHERE name = ?').get(trimmedName) as
        | { id: number }
        | undefined;

    if (existing) {
        return existing.id;
    }

    // Create new author
    const result = db.prepare('INSERT INTO authors (name) VALUES (?) RETURNING id').get(trimmedName) as {
        id: number;
    };
    return result.id;
}

export async function seedDatabase() {
    if (!isDatabaseEmpty()) {
        console.log('📚 Database already contains data, skipping seed');
        return;
    }

    console.log('🌱 Starting database seed...');

    try {
        const csvPath = process.env.CSV_PATH || 'books.csv';
        console.log(`📄 Looking for CSV file at: ${csvPath}`);
        
        const file = Bun.file(csvPath);
        
        // Check if file exists
        if (!(await file.exists())) {
            console.error(`❌ CSV file not found at: ${csvPath}`);
            console.error('   Make sure books.csv is in the project root directory');
            throw new Error(`CSV file not found: ${csvPath}`);
        }

        console.log('✅ CSV file found, reading...');
        const text = await file.text();
        const lines = text.split('\n').filter((line) => line.trim() !== '');

        if (lines.length < 2) {
            console.log('⚠️  CSV file is empty or has no data rows');
            return;
        }

        // Parse header
        const header = parseCSVLine(lines[0]);
        const headerMap: Record<string, number> = {};
        header.forEach((col, index) => {
            headerMap[col.trim()] = index;
        });

        // Process rows
        let inserted = 0;
        let skipped = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            try {
                const values = parseCSVLine(line);

                // Extract values
                const title = values[headerMap['title']]?.trim() || '';
                const authors = values[headerMap['authors']]?.trim() || '';
                const isbn = values[headerMap['isbn']]?.trim() || null;
                const isbn13 = values[headerMap['isbn13']]?.trim() || null;
                const averageRating = values[headerMap['average_rating']]?.trim() || null;
                const languageCode = values[headerMap['language_code']]?.trim() || null;
                const numPages = values[headerMap['num_pages']]?.trim() || null;
                const ratingsCount = values[headerMap['ratings_count']]?.trim() || null;
                const textReviewsCount = values[headerMap['text_reviews_count']]?.trim() || null;
                const publicationDate = values[headerMap['publication_date']]?.trim() || null;
                const publisher = values[headerMap['publisher']]?.trim() || null;

                if (!title || !authors) {
                    skipped++;
                    continue;
                }

                // Handle multiple authors (comma-separated)
                const authorNames = authors.split('/').map((a) => a.trim()).filter((a) => a);
                if (authorNames.length === 0) {
                    skipped++;
                    continue;
                }

                // Use first author as primary
                const primaryAuthorId = getOrCreateAuthor(authorNames[0]);

                // Parse numeric values
                const avgRating = averageRating ? parseFloat(averageRating) : null;
                const pages = numPages ? parseInt(numPages, 10) : null;
                const ratings = ratingsCount ? parseInt(ratingsCount, 10) : null;
                const textReviews = textReviewsCount ? parseInt(textReviewsCount, 10) : null;
                const year = publicationDate ? parsePublicationDate(publicationDate) : null;

                // Insert book
                db.prepare(
                    `INSERT INTO books (
            title, isbn, isbn13, author_id, average_rating, language_code,
            num_pages, ratings_count, text_reviews_count, publication_date, publisher
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                ).run(
                    title,
                    isbn,
                    isbn13,
                    primaryAuthorId,
                    avgRating,
                    languageCode,
                    pages,
                    ratings,
                    textReviews,
                    publicationDate,
                    publisher
                );

                inserted++;

                // Create additional authors if multiple
                for (let j = 1; j < authorNames.length; j++) {
                    getOrCreateAuthor(authorNames[j]);
                }

                if (inserted % 1000 === 0) {
                    console.log(`  Processed ${inserted} books...`);
                }
            } catch (error) {
                skipped++;
                if (skipped < 10) {
                    console.warn(`  Skipping row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }

        console.log(`✅ Seed completed: ${inserted} books inserted, ${skipped} rows skipped`);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}
