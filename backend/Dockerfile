FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies inside the build context (./backend)
COPY package*.json ./

# Install all dependencies (dev dependencies kept for development convenience)
RUN npm install

# Copy app sources
COPY . .

EXPOSE 3333

# Default environment values
ENV PORT=3333
ENV NODE_ENV=development

# Start in dev mode by default; compose can override NODE_ENV and command if desired
CMD ["npm", "run", "dev"]
