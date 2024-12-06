# Use the official Node.js image as the base image.
FROM node:20 AS build

# Set args
ARG NODE_ENV=production
ARG INVENTORY_HOST
ARG RESERVATION_HOST
ARG KEYCLOAK_HOST
ARG SPIFF_HOST

# Env variables
ENV NODE_ENV=$NODE_ENV
ENV VITE_II_SERVICE_HOST=$INVENTORY_HOST
ENV VITE_II_RESERVATION_HOST=$RESERVATION_HOST
ENV VITE_KEYCLOAK=$KEYCLOAK_HOST
ENV VITE_SPIFF=$SPIFF_HOST

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
CMD ["serve", "-sn", "dist"]