#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE atlas_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'atlas_test')\gexec
    GRANT ALL PRIVILEGES ON DATABASE atlas_test TO ${POSTGRES_USER};
EOSQL
