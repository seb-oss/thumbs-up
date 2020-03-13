
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

CREATE FUNCTION insert_thumb()
    RETURNS trigger AS
$$
DECLARE url_id INT;
DECLARE user_id INT;
BEGIN
    INSERT INTO page_urls(page_url) SELECT NEW.page_url RETURNING id into url_id;
    INSERT INTO github_users(github_user) SELECT NEW.github_user RETURNING id into user_id;
    INSERT INTO thumbs(url_id, user_id, thumb_up) VALUES(url_id, user_id, NEW.thumb_up);
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER insert_thumb_trigger
INSTEAD OF INSERT ON thumbs_up
FOR EACH ROW EXECUTE FUNCTION insert_thumb();

INSERT INTO thumbs_up(page_url, github_user, thumb_up)
VALUES('hej', 1000, true);
