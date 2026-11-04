export type DocumentRow = {
  id: string;
  tenant_id: string;
  data: string;
  created_at: Date | null;
};

export interface DocumentRepository {
  readDocument(id: string): Promise<DocumentRow | null>;
  createDocument(data: string): Promise<string>;
}
