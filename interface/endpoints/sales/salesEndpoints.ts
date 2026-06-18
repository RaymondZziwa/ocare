export const SALESENDPOINTS = {
    CLIENT: {
        create: '/api/clients/create',
        modify:(id: string) => `/api/clients/modify/${id}`,
        delete:(id: string) => `/api/clients/delete/${id}`,
        fetch_all: '/api/clients/fetch-all',
        fetch_purchases: (id: string) => `/api/clients/fetch-purchases/${id}`,
        prescriptions: '/api/clients/fetch-all-prescriptions',
        review_prescription: (id: string) => `/api/clients/review-prescription/${id}`,
    },
    POS: {
        complete_sale: '/api/sales/create',
        modify:(id: string) => `/api/sales/modify/${id}`,
        delete:(id: string) => `/api/sales/delete/${id}`,
        fetch_all: '/api/sales/fetch-all',
        get_credit_sales: (id: string) => `/api/sales/credit-sales/${id}`,
        collect_payment: `/api/sales/credit-payment`,
    },
    SERVICEPOS: {
        complete_sale: '/api/service-sales/create',
        modify:(id: string) => `/api/service-sales/modify/${id}`,
        delete:(id: string) => `/api/service-sales/delete/${id}`,
        fetch_all: '/api/service-sales/fetch-all',
        get_credit_sales: (id: string) => `/api/service-sales/credit-sales/${id}`,
        collect_payment: `/api/service-sales/credit-payment`,
    },
}