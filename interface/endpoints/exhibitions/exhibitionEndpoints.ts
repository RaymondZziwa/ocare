export const ExhibitionEndpoints = {
    EXHIBITION: {
        create: '/api/exhibitions/create',
        modify: (id: string) => `/api/exhibitions/modify/${id}`,
        fetch_all: '/api/exhibitions/fetch-all',
        delete: (id: string) => `/api/exhibitions/delete/${id}`
    },
    EXHIBITION_INVENTORY: {
        create: '/api/expo-stock-movement/create',
        fetch_all: '/api/expo-stock-movement/fetch-all',
        fetch_all_stores: '/api/expo-stock-movement/fetch-all-stores'
    },
    EXHIBITION_POS: {
        create: '/api/exhibition-sales/create',
        modify: (id: string) => `/api/exhibition-sales/modify/${id}`,
        fetch_all: '/api/exhibition-sales/fetch-all',
        delete: (id: string) => `/api/exhibition-sales/delete/${id}`,
        fetchExhibitionStoreInventory: (id: string) => `/api/expo-stock-movement/fetch-exhibitionstore-inventory/${id}`,
    },
    EXHIBITION_EXPENSES: {
        create: '/api/exhibition-expenses/create',
        modify: (id: string) => `/api/exhibition-expenses/modify/${id}`,
        fetch_all: '/api/exhibition-expenses/fetch-all',
        delete: (id: string) => `/api/exhibition-expenses/delete/${id}`
    }
}