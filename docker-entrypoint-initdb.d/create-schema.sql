
CREATE TABLE page_urls (
    id SERIAL PRIMARY KEY,
    page_url TEXT UNIQUE
);

CREATE TABLE github_users (
    id SERIAL PRIMARY KEY,
    github_user INT UNIQUE
);

CREATE TABLE thumbs (
    id SERIAL PRIMARY KEY,
    url_id INT REFERENCES page_urls(id),
    user_id INT REFERENCES github_users(id),
    thumb_up BOOLEAN,
    UNIQUE(url_id, user_id)
);

CREATE VIEW thumbs_up AS
    SELECT
        p.page_url,
        g.github_user,
        t.thumb_up
    FROM thumbs t
    JOIN github_users g ON g.id = t.user_id
    JOIN page_urls p ON p.id = t.url_id;

CREATE FUNCTION upsert_thumb()
    RETURNS trigger AS
$$
BEGIN
    WITH inserted_url AS (
        INSERT INTO page_urls(page_url)
        SELECT NEW.page_url
        ON CONFLICT(page_url) DO NOTHING
        RETURNING id, page_url
    ), inserted_user AS (
        INSERT INTO github_users(github_user)
        SELECT NEW.github_user
        ON CONFLICT(github_user) DO NOTHING
        RETURNING id, github_user
    ), upserted_url AS (
        SELECT id, page_url
        FROM page_urls
        UNION ALL
        SELECT id, page_url
        FROM inserted_url
    ), upserted_user AS (
        SELECT id, github_user
        FROM github_users
        UNION ALL
        SELECT id, github_user
        FROM inserted_user
    )
    INSERT INTO thumbs(url_id, user_id, thumb_up)
    SELECT upserted_url.id, upserted_user.id, new_row.thumb_up
    FROM (SELECT NEW.*) new_row
    JOIN upserted_url USING (page_url)
    JOIN upserted_user USING (github_user)
    ON CONFLICT(url_id, user_id)
        DO UPDATE SET thumb_up = NEW.thumb_up;
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER upsert_thumb_trigger
INSTEAD OF INSERT OR UPDATE ON thumbs_up
FOR EACH ROW EXECUTE FUNCTION upsert_thumb();

INSERT INTO thumbs_up(page_url, github_user, thumb_up)
VALUES('hej', 1000, true);
