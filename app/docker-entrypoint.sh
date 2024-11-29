#!/bin/sh
# Add additional commands here
prisma migrate deploy
exec "$@"
