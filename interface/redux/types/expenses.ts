import type { ExpenseCategory } from "../../pages/exhibition/exhibitionExpenses/AddorModify";
import type { IEmployee } from "./hr";
import type { IBranch } from "./systemSettings";

export interface IBranchExpense {
  id: string;
  branchId: string;
  branch: IBranch;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  dateIncurred: Date;
  recordedBy: string;
  employee: IEmployee;
  updatedAt: Date;
  createdAt: Date;
}