export interface ISupplier {
  id: string;
  firstName: string;
  lastName: string;
  contact: string;
  address: string;
  Supply: ISupply[];
  updatedAt: string;
  createdAt: string;
}

export interface IUserAuth {
  id: string;
  name: string;
  email: string;
}

export interface ISupply {
  id: string;
  itemId: string;
  supplierId: string;
  supplier: ISupplier;
  qty: number;
  value: number;
  balance: number;
  receivedBy: string;
  employee: IUserAuth;
    paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
    SupplyPayments: ISupplyPayments[]
  updatedAt: string;
  createdAt: string;
}

export interface ISupplyPayments {
  id: string;
  supplyId: string;
  supply: ISupply;
  paymentType: 'CASH' | 'CHEQUE' | 'MOBILE_MONEY' | 'BARTER_PAYMENT';
  barterItemName?: string | null;
  amount: number;
  paidBy: string;
  employee: IUserAuth;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID'; 
  proofImage?: string | null;
  updatedAt: string;
  createdAt: string;
}
