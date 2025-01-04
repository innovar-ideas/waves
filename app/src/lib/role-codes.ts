import { userRoleNames } from "./constants";

export const ROLE_ACCESS = {
  CREATE_LOAN: [userRoleNames.admin, userRoleNames.employee],
  UPDATE_LOAN: [userRoleNames.admin, userRoleNames.finance],
};