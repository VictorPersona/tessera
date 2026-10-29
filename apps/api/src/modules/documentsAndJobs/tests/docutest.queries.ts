export const ADD_JOBS_TEST_CONSTRAINT =
  "ALTER TABLE jobs ADD CONSTRAINT check_data CHECK(data!='vitest_test_data')";

export const DROP_JOBS_TEST_CONSTRAINT =
  "ALTER TABLE jobs DROP CONSTRAINT IF EXISTS check_data";

export const CHECK_DOCUMENTS_TEST =
  "SELECT 1 FROM documents WHERE data='vitest_test_data'";

export const REMOVE_JOBS_TEST = "DELETE FROM jobs WHERE tenant_id = $1";

export const REMOVE_DOCUMENTS_TEST =
  "DELETE FROM documents WHERE tenant_id = $1";

export const ADD_JOBS_TEST_DUPLICATE_CONSTRAINT =
  "ALTER TABLE jobs ADD CONSTRAINT unique_data UNIQUE (data)";

export const DROP_JOBS_TEST_DUPLICATE_CONSTRAINT =
  "ALTER TABLE jobs DROP CONSTRAINT IF EXISTS unique_data";

export const DELETE_REPTATIVE_DATA_ROWS = "DELETE FROM jobs where data=$1";
