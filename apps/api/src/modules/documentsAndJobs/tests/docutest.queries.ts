export const ADD_JOBS_TEST_CONSTRAINT =
  "ALTER TABLE jobs ADD CONSTRAINT check_data CHECK(data!='vitest_test_data')";

export const DROP_JOBS_TEST_CONSTRAINT =
  "ALTER TABLE jobs DROP CONSTRAINT IF EXISTS check_data";

export const CHECK_DOCUMENTS_TEST =
  "SELECT 1 FROM documents WHERE data='vitest_test_data'";
