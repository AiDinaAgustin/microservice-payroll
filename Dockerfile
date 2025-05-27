FROM alpine:latest

WORKDIR /app

# This is a documentation Dockerfile only
# To run all services, use: docker-compose up

COPY compose.yaml .

CMD ["echo", "Please use 'docker-compose up' to start all services"]