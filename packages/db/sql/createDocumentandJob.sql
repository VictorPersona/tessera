BEGIN;

CREATE TABLE documents(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID  NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()

);

CREATE TABLE jobs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID  NOT NULL,
    document_id uuid NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (document_id) REFERENCES documents(id)
);

COMMIT;