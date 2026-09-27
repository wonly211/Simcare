CREATE TABLE password_credentials (
 user_id TEXT PRIMARY KEY REFERENCES users(id),
 encoded TEXT NOT NULL, version TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE password_links (
 user_id TEXT PRIMARY KEY REFERENCES users(id), issuer_id TEXT NOT NULL REFERENCES users(id),
 token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL
);
ALTER TABLE login_requests ADD COLUMN password_encoded TEXT;
ALTER TABLE login_requests ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member','admin'));
UPDATE login_requests SET status='rejected' WHERE status IN ('pending','approved');
