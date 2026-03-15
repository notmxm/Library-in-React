// Helper function to convert snake_case database fields to camelCase
export function toCamelCase(obj: Record<string, any>): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = typeof value === 'object' && value !== null ? toCamelCase(value) : value;
    }
    return result;
}

// Helper function to convert camelCase to snake_case for database operations
export function toSnakeCase(obj: Record<string, any>): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        result[snakeKey] = typeof value === 'object' && value !== null ? toSnakeCase(value) : value;
    }
    return result;
}
