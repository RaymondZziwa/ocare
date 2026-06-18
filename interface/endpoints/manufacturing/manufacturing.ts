export const ManufacturingEndpoints = {
  save: "api/manufacturing/save",
  all: "api/manufacturing/all",
  find: (id: string) => `api/manufacturing/find/${id}`,
  modify: (id: string) => `api/manufacturing/modify/${id}`,
  delete: (id: string) => `api/manufacturing/delete/${id}`,
};
