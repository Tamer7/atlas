#!/bin/sh
set -e

# Only starting the server needs the full boot sequence. Without this guard a
# one-off `docker compose run ... php artisan <cmd>` blocks forever on the
# Postgres wait below and never reaches the command it was asked to run.
case "$*" in
    *octane:start*) ;;
    *) exec "$@" ;;
esac

# Wait for Postgres before touching the database. Compose health checks cover
# the first boot, but a database restart can outlive the API container.
until php -r "new PDO('pgsql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
    echo "waiting for postgres..."
    sleep 2
done

# Cache before migrating so both use identical resolved config.
# NOTE: this is the inverse of the dev entrypoint, which *clears* these. With
# opcache.validate_timestamps=0 and long-lived Octane workers, uncached config
# means every worker re-parses config on boot for no benefit.
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

php artisan migrate --force

exec "$@"
