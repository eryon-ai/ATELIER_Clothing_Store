# Use Node 22 alpine image for lightweight build
FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start Vite with --host to allow external access (essential inside Docker)
CMD ["npm", "run", "dev", "--", "--host"]
