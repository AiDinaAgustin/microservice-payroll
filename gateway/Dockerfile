FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the required port
EXPOSE 5000

# Use npm run dev instead of npm start
CMD ["npm", "run", "dev"]