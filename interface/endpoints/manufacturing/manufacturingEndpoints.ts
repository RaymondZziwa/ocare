export const ManufacturingEndpoints = {
  create: '/api/manufacturing/create',
  fetch_all: '/api/manufacturing/fetch-all',
  fetch_one: (id: string) => `/api/manufacturing/fetch/${id}`,
  update: (id: string) => `/api/manufacturing/modify/${id}`,
  complete: (id: string) => `/api/manufacturing/complete/${id}`,
  delete: (id: string) => `/api/manufacturing/delete/${id}`,
};

