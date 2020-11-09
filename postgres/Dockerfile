FROM bitnami/postgresql:11

USER root
COPY libupdate.sh /opt/bitnami/scripts/

# patch the entrypoint of the image to execute any new scripts in /docker-entrypoint-initdb.d
RUN chmod -x /opt/bitnami/scripts/libupdate.sh && \
    perl -pi \
        -e 's|. (/opt/bitnami/scripts)/(libpostgresql\.sh)|. $1/$2\n. $1/libupdate.sh|;' \
        -e 's|(postgresql_custom_init_scripts)|$1\npostgresql_custom_update_scripts|;' \
        /opt/bitnami/scripts/postgresql/setup.sh

USER 1001
WORKDIR /app

COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d
