#!/bin/sh
set -e

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan migrate --force

exec "$@"
