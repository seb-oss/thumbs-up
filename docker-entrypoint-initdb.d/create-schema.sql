CREATE table github_users (
    id SERIAL PRIMARY KEY,
    github_id INT UNIQUE
);

CREATE table page_urls (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE
);

CREATE table thumbs_up (
    id SERIAL PRIMARY KEY,
    url_id INT REFERENCES page_urls(id),
    github_user_id INT REFERENCES github_users(id),
    sentiment BOOLEAN
    CONSTRAINT UNIQUE(url_id, github_user_id)
);



CREATE view thumbs AS
    SELECT
        u.url,
        g.github_id,
        t.sentiment
    FROM github_users g
    JOIN thumbs_up t ON g.id = t.github_user_id
    JOIN page_urls u ON u.id = t.url_id


INSERT INTO github_users(github_id) VALUES (1000);
INSERT INTO page_urls(url) VALUES ('hej');
INSERT INTO thumbs_up(url_id, github_user_id, sentiment) VALUES(1, 1, true);

CREATE FUNCTION insert_thumb()
    RETURNS trigger AS
$$
DECLARE page_url_id INT;
DECLARE github_user_id INT;
BEGIN
    INSERT INTO github_users (github_id) SELECT NEW.github_id RETURNING id into github_user_id;
    INSERT INTO page_urls(url) SELECT NEW.url RETURNING id into page_url_id;
    INSERT INTO thumbs_up(sentiment, url_id, github_user_id) VALUES(NEW.sentiment, page_url_id, github_user_id);
    RETURN NEW;
END;
$$ language plpgsql;


create trigger insert_thumb_trigger
instead of insert on thumbs
for each row execute function insert_thumb();