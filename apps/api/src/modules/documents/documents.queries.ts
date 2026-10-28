export const INSERT_INTO_DOCUMENTS = 'INSERT into documents(id,tenant_id,data) values($1,$2,$3)'

export const SELECT_FROM_DOCUMENTS = 'SELECT id,tenant_id,data,created_at from documents where id=$1 AND tenant_id=$2 '