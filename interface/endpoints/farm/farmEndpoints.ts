export const farmEndpoints = {
  seedlingStage: {
    create: '/api/farm/seedling-stage/create',
    fetchAll: '/api/farm/seedling-stage/fetch-all',
    fetchOne: (id: string) => `/api/farm/seedling-stage/fetch/${id}`,
    update: (id: string) => `/api/farm/seedling-stage/modify/${id}`,
    remove: (id: string) => `/api/farm/seedling-stage/delete/${id}`,
  },
  seedlingBatch: {
    create: '/api/farm/seedling-batch/create',
    fetchAll: '/api/farm/seedling-batch/fetch-all',
    fetchOne: (id: string) => `/api/farm/seedling-batch/fetch/${id}`,
    update: (id: string) => `/api/farm/seedling-batch/modify/${id}`,
    updateStatus: (id: string) => `/api/farm/seedling-batch/update-status/${id}`,
    remove: (id: string) => `/api/farm/seedling-batch/delete/${id}`,
  },
  seedlingDeath: {
    create: '/api/seedling-death/save',
    fetchAll: '/api/seedling-death/all',
    fetchOne: (id: string) => `/api/seedling-death/find/${id}`,
    update: (id: string) => `/api/seedling-death/modify/${id}`,
    remove: (id: string) => `/api/seedling-death/delete/${id}`,
  },
};
