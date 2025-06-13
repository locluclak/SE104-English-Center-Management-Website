#!/bin/bash

# Change directory to directory of this script
cd "$(dirname "$0")"

PATH_TO_MYSQL="mysql"
USER="root"
DB="ENGLISH_CENTER_DATABASE"

read -s -p "Enter MySQL password: " PASSWORD
echo

for file in *.sql; do
    $PATH_TO_MYSQL -u "$USER" -p"$PASSWORD" "$DB" < "$file"
done

echo "All files have been successfully executed."



# Make it executable:
#     chmod +x execute_all.sh

# How to run:
#     ./execute_all.sh