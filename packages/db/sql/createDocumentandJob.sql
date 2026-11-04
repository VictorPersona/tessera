BEGIN;

CREATE TABLE documents(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID  NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
   UNIQUE (id, tenant_id)
);

CREATE TABLE jobs(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID  NOT NULL,
    document_id uuid NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    FOREIGN KEY (document_id,tenant_id) REFERENCES documents(id,tenant_id)
);

COMMIT;