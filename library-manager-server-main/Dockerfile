FROM oven/bun:1.3.7-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code and CSV file
COPY src ./src
COPY books.csv ./
COPY tsconfig.json ./

# Expose port
EXPOSE 3000

# Run the application
CMD ["bun", "run", "src/index.ts"]
