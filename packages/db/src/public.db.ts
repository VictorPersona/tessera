import {  withSystem, withTenant } from "./executor.js";


export type { TenantExecutor, SystemExecutor } from "./executor.js";
export { closePool } from "./executor.js";

export default {
  withTenant,
  withSystem,
};
