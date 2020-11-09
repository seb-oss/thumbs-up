#!/bin/bash
#
# Extension of Bitnami PostgreSQL libraries

# Load original libraries
. /opt/bitnami/scripts/liblog.sh
. /opt/bitnami/scripts/libpostgresql.sh

# Load PostgreSQL environment variables
. /opt/bitnami/scripts/postgresql-env.sh

# Executes the given *.pgsql file if it has not been executed before
postgresql_custom_update_script() {
    local script_name=$(basename -s .pgsql "$1")
    local sentry_file="$POSTGRESQL_VOLUME_DIR/.${script_name//-/_}"
    if [[ ! -f "$sentry_file" ]] ; then
        if ! is_postgresql_running; then
            postgresql_start_bg
        fi
        info "Executing $1"
        postgresql_execute "$POSTGRESQL_DATABASE" "$POSTGRESQL_INITSCRIPTS_USERNAME" "$POSTGRESQL_INITSCRIPTS_PASSWORD" < "$1"
        touch "$sentry_file"
    fi
}

# Executes any new *.pgsql files in /docker-entrypoint-initdb.d
postgresql_custom_update_scripts() {
    info "Loading update scripts..."
    if [[ -n $(find "$POSTGRESQL_INITSCRIPTS_DIR/" -type f -name "*.pgsql") ]] && [[ -f "$POSTGRESQL_VOLUME_DIR/.user_scripts_initialized" ]] ; then
        debug "Loading user's update files from $POSTGRESQL_INITSCRIPTS_DIR ...";
        find "$POSTGRESQL_INITSCRIPTS_DIR/" -type f -name "*.pgsql" | sort | while read -r f; do
            postgresql_custom_update_script "$f"
        done
    fi
}
