
CREATE TABLE page_ids (
    id SERIAL PRIMARY KEY,
    page_id TEXT UNIQUE
);

CREATE TABLE github_users (
    id SERIAL PRIMARY KEY,
    github_user TEXT UNIQUE
);

CREATE TABLE thumbs (
    id SERIAL PRIMARY KEY,
    page_id INT REFERENCES page_ids(id),
    user_id INT REFERENCES github_users(id),
    thumb_up BOOLEAN,
    UNIQUE(page_id, user_id)
);

CREATE VIEW thumbs_up AS
    SELECT
        p.page_id,
        g.github_user,
        t.thumb_up
    FROM thumbs t
    JOIN github_users g ON g.id = t.user_id
    JOIN page_ids p ON p.id = t.page_id;

CREATE FUNCTION upsert_thumb()
    RETURNS trigger AS
$$
BEGIN
    WITH inserted_url AS (
        INSERT INTO page_ids(page_id)
        SELECT NEW.page_id
        ON CONFLICT(page_id) DO NOTHING
        RETURNING id, page_id
    ), inserted_user AS (
        INSERT INTO github_users(github_user)
        SELECT NEW.github_user
        ON CONFLICT(github_user) DO NOTHING
        RETURNING id, github_user
    ), upserted_url AS (
        SELECT id, page_id
        FROM page_ids
        UNION ALL
        SELECT id, page_id
        FROM inserted_url
    ), upserted_user AS (
        SELECT id, github_user
        FROM github_users
        UNION ALL
        SELECT id, github_user
        FROM inserted_user
    )
    INSERT INTO thumbs(page_id, user_id, thumb_up)
    SELECT upserted_url.id, upserted_user.id, new_row.thumb_up
    FROM (SELECT NEW.*) new_row
    JOIN upserted_url USING (page_id)
    JOIN upserted_user USING (github_user)
    ON CONFLICT(page_id, user_id)
        DO UPDATE SET thumb_up = NEW.thumb_up;
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER upsert_thumb_trigger
INSTEAD OF INSERT OR UPDATE ON thumbs_up
FOR EACH ROW EXECUTE FUNCTION upsert_thumb();

CREATE FUNCTION delete_thumb()
    RETURNS trigger AS
$$
BEGIN
    DELETE FROM thumbs t
    USING github_users g, page_ids p
    WHERE g.id = t.user_id
    AND p.id = t.page_id
    AND p.page_id = OLD.page_id
    AND g.github_user = OLD.github_user;
    RETURN OLD;
END;
$$ language plpgsql;

CREATE TRIGGER delete_thumb_trigger
INSTEAD OF DELETE ON thumbs_up
FOR EACH ROW EXECUTE FUNCTION delete_thumb();

CREATE FUNCTION total_thumbs(given_url TEXT, given_user TEXT)
    RETURNS TABLE (thumbs_up BIGINT, thumbs_down BIGINT, user_thumb_up BOOLEAN)
AS
$$
    SELECT
        count(*) FILTER (WHERE thumb_up = TRUE) AS thumbs_up,
        count(*) FILTER (WHERE thumb_up = FALSE) AS thumbs_down,
        bool_or(thumb_up) FILTER (WHERE github_user = given_user) AS user_thumb_up
    FROM thumbs_up
    WHERE page_id = given_url;
$$
LANGUAGE sql;
