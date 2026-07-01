# Build stage
FROM node:lts as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production stage
FROM node:lts-alpine

WORKDIR /app

# Copy build output from the previous stage
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules

# Install `serve` globally
RUN npm install -g serve

# Expose port and run the server
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3001"]
