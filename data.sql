CREATE table companies (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE table jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT NOT NULL CHECK (equity <= 1),
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted DATE DEFAULT NOW()
);
