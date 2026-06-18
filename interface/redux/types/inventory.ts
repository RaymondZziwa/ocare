import type { IDepartment, IEmployee } from "./hr";
import type { IBranch } from "./systemSettings";

export interface IItemCategory {
    id: string
    name: string
    updatedAt: Date;
    createdAt: Date;
}

export interface IItem {
    id: string
    name: string
    price: number
    barcode: number
    category: IItemCategory
    showInPos: boolean;
    updatedAt: Date
    createdAt: Date
}

export interface IStore {
    id: number;
    name: string;
    branch: IBranch;
    dept: IDepartment;
    authorizedPersonnel: string[]
    updatedAt: Date
    createdAt: Date
}

export interface IService {
    id: string;
    name: string;
    price: number;
    updatedAt: Date
    createdAt: Date
}

export interface IUnit {
    id: string;
    name: string;
    abr?: string;
    value?: number; // Value in base unit (e.g., ml for volume units, g for weight units)
    updatedAt: Date
    createdAt: Date
}

export interface IStockMovement {
    id: string;
    itemId: string;
    item: IItem;
    category: string;
    storeId: string;
    toStoreId: string;
    store: IStore;
    qty: number;
    unitId: string;
    deliveryNoteId: string;
    deliveryNote: IDeliveryNote;
    initiatedQty: number;
    remainingQuantity: number;
    transferStatus: string;
    unit: IUnit;
    source: string;
    images: string[];
    isResolved?: boolean;
    resolveNotes?: string;
    extraNote?: string;
    exidence?: string;
    description?: string;
    recordedBy : string;
    employee: IEmployee;
    createdAt: string;
}

export interface IStockStore {
  id: string;
  itemId: string;
  storeId: string;
  qty: number;
  unitId: string;
  createdAt: string;
  updatedAt: string;
  item: IItem;
  store: IStore;
  unit: IUnit;
}

export interface IDeliveryNote {
    id: string;
    name: string;
    deliveryNoteNumber: string;
    images: string[];
    registeredBy: string;
    employee: IEmployee;
    notes: string;
    updatedAt: Date;
    createdAt: Date;
}