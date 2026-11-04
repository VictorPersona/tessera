export type JobRow = {
  id: string;
  tenant_id: string;
  document_id: string;
  data: string;
};

export interface JobsRepository {
  createJob(documentId: string, data: string): Promise<string>;
}
