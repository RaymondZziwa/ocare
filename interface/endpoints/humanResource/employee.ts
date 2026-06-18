export const EmployeeEndpoints = {
  getEmployees: '/api/employees/fetch-all',
  getEmployeeById: (branchId: string) => `/api/employees/${branchId}`,
  createEmployee: '/api/employees/create',
  updateEmployee: (branchId: string) => `/api/employees/modify/${branchId}`,
  deleteEmployee: (branchId: string) => `/api/employees/delete/${branchId}`,

  EMPLOYEE_PROFILE: {
    UPDATE_PROFILE: (id: string) => `/api/employees/update-profile/${id}`,
    UPLOAD_PROFILE_PICTURE: (id: string) => `/api/employees/upload-profile-picture/${id}`,
    DISABLE: (id: string) => `/api/employees/disable/${id}`,
  }
};

