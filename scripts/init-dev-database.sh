#!/bin/sh
set -eu

# MySQL runs this file only while initializing an empty /var/lib/mysql volume.
export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"

for file in /seed/create/*.sql; do
  [ -f "$file" ] || { echo "No CREATE seed files found" >&2; exit 1; }
  echo "Applying ${file##*/} (CREATE)"
  mysql --protocol=socket --user=root "$MYSQL_DATABASE" < "$file"
done

for file in /seed/insert/*.sql; do
  [ -f "$file" ] || { echo "No INSERT seed files found" >&2; exit 1; }
  echo "Applying ${file##*/} (INSERT)"
  mysql --protocol=socket --user=root "$MYSQL_DATABASE" < "$file"
done

# Load development sign-in accounts without enabling the optional image fixtures.
users_fixture=/seed/dev/insert/01-users.sql
[ -f "$users_fixture" ] || { echo "No development users fixture found" >&2; exit 1; }
echo "Applying ${users_fixture##*/} (development users)"
mysql --protocol=socket --user=root "$MYSQL_DATABASE" < "$users_fixture"
