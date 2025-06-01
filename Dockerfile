FROM alpine:latest

WORKDIR /app

# Install required packages
RUN apk add --no-cache docker docker-compose

# Copy your application files
COPY . .

# Expose the necessary ports
EXPOSE 80 5000 5001 5002 5003

# Start all services
CMD ["docker-compose", "up"]