#!/bin/sh
# Add additional commands here
bun add -g prisma tsx
bunx prisma migrate deploy
exec "$@"
