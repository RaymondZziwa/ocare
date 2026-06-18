import type { IItem } from "./inventory";

// Item as it appears in a sale (with quantity, discount, total)
export interface ISaleItem extends Omit<IItem, 'category'> {
  quantity: number;
  discount: number;
  total: number;
  unitId: number;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}

export interface PaymentMethodDto {
  method: 'CASH' | 'MTN_MOMO' | 'AIRTEL_MOMO' | 'CARD' | 'PROF_MOMO';
  amount: number;
}

export interface ISale {
  id: string;
  clientId?: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  items: ISaleItem[];
  servedBy: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  storeId: string;
  store: {
    id: string;
    name: string;
    location?: string;
  };
  status: 'FULLY_PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  total: number;
  deliverNoteImage?: string;
  balance: number; 
  paymentMethods: PaymentMethodDto[];
  notes?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface IClient {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    updatedAt: Date;
    createdAt: Date;
}

export interface ICartItem {
  id: string;
  name: string;
  price: number;
  barcode: number;
  category: {
    id: string;
    name: string;
  };
  quantity: number;
  discount: number;
  total: number;
  unitId: number;
}

export interface IPaymentMethod {
  type: 'CASH' | 'MTN_MOMO' | 'AIRTEL_MOMO' | 'CARD' | 'PROF_MOMO';
  amount: number;
  transactionId?: string;
}

export interface ICheckoutData {
  customerId?: number;
  status: 'FULLY_PAID' | 'UNPAID' | 'PARTIALLY_PAID';
  paymentMethods: IPaymentMethod[];
  notes?: string;
  total: number;
  balance: number;
  items: ICartItem[];
  storeId: number;
  servedBy: number;
}

export interface POSStore {
  storeId: string;
  storeName: string;
  timestamp: number;
}

export interface IProjectSale {
  id: string;
  clientId: string;
  projectId: string;
  status: 'FULLY_PAID' | 'PARTIALLY_PAID' | 'UNPAID';
  saleTotal: number;
  downPayment: number;
  numberOfInstallments: number;
  installmentAmount: number;
  cashierId: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryNoteImage?: string;
  // Computed fields (from API)
  totalPaid?: number;
  remainingBalance?: number;
  paymentProgress?: number;
  paymentsMade?: number;
  nextInstallmentDue?: Date;
  
  // Relations
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
  };
  project?: {
    id: string;
    name: string;
    price: number;
    barcode?: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ProjectPayments?: IProjectPayment[];
}

export interface IProjectPayment {
  id: string;
  saleId: string;
  amount: number;
  exhibitionId?: string;
  paymentMethod?: string;
  referenceId?: string;
  bankDepositSlipImage: string;
  receiptImage: string;
  cashierId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  employee?: {
    firstName: string;
    lastName: string;
  };
  projectSale?: IProjectSale;
}

export interface CreateProjectSaleDto {
  clientId: string;
  projectId: string;
  saleTotal: number;
  downPayment: number;
  numberOfInstallments: number;
  installmentAmount: number;
  cashierId: string;
  initialPayments?: ProjectPaymentDto[];
}

export interface ProjectPaymentDto {
  amount: number;
  exhibitionId?: string;
  cashierId: string;
}

export interface AddPaymentDto {
  amount: number;
  exhibitionId?: string;
  cashierId: string;
}

export interface ProjectSalesState {
  sales: IProjectSale[];
  currentSale: IProjectSale | null;
  payments: IProjectPayment[];
  loading: boolean;
  error: string | null;
}