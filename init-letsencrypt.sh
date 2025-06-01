#!/bin/bash

# Make sure proxy isn't running to avoid conflicts
echo "Stopping existing containers if any"
docker compose -f compose-nginx.yaml down

# Start only the nginx proxy first for ACME challenge
echo "Starting nginx proxy for certificate validation"
docker compose -f compose-nginx.yaml up -d proxy

# Wait for proxy to be ready
echo "Waiting for proxy to start..."
sleep 5

# Get SSL certificates for api.karsa.site
echo "Obtaining SSL certificates from Let's Encrypt..."
docker compose -f compose-nginx.yaml run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email aidinaagustin2@email.com --agree-tos --no-eff-email -d api.karsa.site

# Start all services including certbot for auto-renewal
echo "Starting all services"
docker compose -f compose-nginx.yaml up -d

# Reload nginx to apply certificates
echo "Reloading nginx with the new certificates"
docker compose -f compose-nginx.yaml exec proxy nginx -s reload

echo "SSL setup complete! Your API should be available at https://api.karsa.site"