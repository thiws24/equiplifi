# Use the official Node.js image as the base image.
FROM node:20 AS build

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm ci

# Copy the rest of the application code.
COPY . .

# Build the React application.
RUN npm run build

# Install the static file serving "serve"
RUN npm install -g serve

# Expose port 3000 to the outside world.
EXPOSE 3000

# Command to run the web server.
CMD ["serve", "-sn", "build"]