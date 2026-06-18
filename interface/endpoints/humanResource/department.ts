export const DepartmentEndpoints = {
  getdepartments: '/api/departments/fetch-all',
  getDepartmentById: (branchId: string) => `/api/departments/${branchId}`,
  createDepartment: '/api/departments/create',
  updateDepartment: (branchId: string) => `/api/departments/modify/${branchId}`,
  deleteDepartment: (branchId: string) => `/api/departments/delete/${branchId}`,
};