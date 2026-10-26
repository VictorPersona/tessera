
import publicDb from "../../../../../packages/db/public.db.js";
import { documentRepository } from "./documents.repository.js";

const getDocument = async (id: string) => {
  const executor = await publicDb.withTenant("Tenant1");
  try {
    const documentRepo = documentRepository(executor);

    return await documentRepo.readDocument(id);
  } finally {
    publicDb.releaseTenant(executor);
  }
};

export default {
  getDocument,
};
