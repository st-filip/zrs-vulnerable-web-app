# Use Node.js image
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Install iputils-ping (ping command) && netcat (nc command)
RUN apt-get update && apt-get install -y iputils-ping netcat-traditional

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]