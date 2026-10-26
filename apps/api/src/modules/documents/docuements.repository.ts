export const readDocument = (documentId: string) => {
  const sql = `SELECT * from documents where id=${documentId}`;
};
