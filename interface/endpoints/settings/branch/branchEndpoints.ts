export const branchEndpoints = {
  getBranches: '/api/branches/fetch-all',
  getBranchById: (branchId: string) => `/api/branches/${branchId}`,
  createBranch: '/api/branches/create',
  updateBranch: (branchId: string) => `/api/branches/modify/${branchId}`,
  deleteBranch: (branchId: string) => `/api/branches/delete/${branchId}`,
};