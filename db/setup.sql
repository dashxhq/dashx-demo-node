-- Sets up a trigger for the given table to automatically set a column called
-- `updated_at` whenever the row is modified (unless `updated_at` was included
-- in the modified columns).
--
-- # Example Usage
-- ```sql
-- SELECT manage_updated_at('users');
-- ```
CREATE OR REPLACE FUNCTION manage_updated_at(_tbl regclass) RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
                    FOR EACH ROW EXECUTE PROCEDURE set_updated_at()', _tbl);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    IF (
        NEW IS DISTINCT FROM OLD AND
        NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at
    ) THEN
        NEW.updated_at := current_timestamp;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    encrypted_password VARCHAR(255),
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);

SELECT manage_updated_at('users');

CREATE TABLE IF NOT EXISTS posts(
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES users NOT NULL,
    text VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    video VARCHAR(255),
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

SELECT manage_updated_at('posts');

CREATE TABLE IF NOT EXISTS bookmarks(
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES users NOT NULL,
    post_id integer REFERENCES posts NOT NULL,
    bookmarked_at timestamp DEFAULT NOW(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_id_post_id_key ON bookmarks (user_id, post_id);

SELECT manage_updated_at('bookmarks');
