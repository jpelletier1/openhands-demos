FROM node:14-alpine

WORKDIR /app

# Vulnerable: Running as root
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Vulnerable: Expose sensitive port
EXPOSE 3000

# Vulnerable: No health check
# Vulnerable: Running as root user
USER root

COPY . .

CMD ["npm", "start"]
