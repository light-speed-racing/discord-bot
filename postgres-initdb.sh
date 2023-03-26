#!/bin/sh -e

psql --variable=ON_ERROR_STOP=0 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE "$POSTGRES_DB";
EOSQL

psql --variable=ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname="$POSTGRES_DB" <<-EOSQL
  CREATE EXTENSION "uuid-ossp";
  CREATE EXTENSION "hstore";
EOSQL