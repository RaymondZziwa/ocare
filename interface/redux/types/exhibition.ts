import type { IEmployee } from "./hr";
import type { IItem, IUnit } from "./inventory";

export interface IExhibition {
    id: string;
    name: string;
    location: string;
    description?: string;
    exhibitionStore: IExhibitionStore;
    startDate: Date;
    endDate: Date;
    updatedAt: Date;
    createdAt: Date;
}

export interface IExhibitionStore {
    id: string;
    name: string;
    exhibition: IExhibition;
    updatedAt: Date;
    createdAt: Date;
}

export interface IExhibitionExpense {
  id: string;
    category: string;
  exhibitionId: string;
  exhibition: IExhibition;
  title: string;
  description?: string;
  amount: number;
  dateIncurred: string;
  updatedAt: string;
  createdAt: string;
}

export interface IExhibitionInventoryRecord {
  id: string;
  storeId: string;
  store: IExhibitionStore;
  category: InventoryRecordCategory;
  itemId: string;
  item: IItem;
  qty: number;
  unitId: string;
  unit: IUnit;
  source: string;
  description?: string;
  recordedBy: string;
  employee: IEmployee;
  updatedAt: string; 
  createdAt: string;
}

export type InventoryRecordCategory = 'INCOMING' | 'OUTGOING' | 'TRANSFER' | 'ADJUSTMENT';