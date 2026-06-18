export const RoleEndpoints = {
    create: '/api/roles/create',
    modify: (id: string) => `/api/roles/modify/${id}`,
    delete: (id: string) => `/api/roles/delete/${id}`,
    getAllRoles: '/api/roles/fetch-all',
    getAllPermissions: '/api/roles/permissions'
};

