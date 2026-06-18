import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
// import storage from 'redux-persist/lib/storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserAuthReducer from "./slices/auth/userAuthSlice";
import cartReducer from "./slices/cart/cartSlice";
import EventReducer from "./slices/events/eventSlice";
import ExhibitionExpenseReducer from "./slices/exhibition/exhibitionExpenseSlice";
import ExhibitionInventoryRecordReducer from "./slices/exhibition/exhibitionInventoryRecordSlice";
import ExhibitionReducer from "./slices/exhibition/exhibitionSlice";
import ExhibitionStoreInventoryReducer from "./slices/exhibition/exhibitionStoreInventory";
import ExhibitionStoreReducer from "./slices/exhibition/exhibitionStoreSlice";
import BranchExpenseReducer from "./slices/expenses/branchExpenseSlice";
import seedlingBatchReducer from "./slices/farm/batchSlice";
import seedlingDeathReducer from "./slices/farm/deathSlice";
import seedlingGrowthReducer from "./slices/farm/growthSlice";
import seedlingStageReducer from "./slices/farm/stageSlice";
import AttendanceReducer from "./slices/humanResource/attendanceSlice";
import DepartmentReducer from "./slices/humanResource/departmentSlice";
import EmployeeReducer from "./slices/humanResource/employeeSlice";
import PayrollReducer from "./slices/humanResource/payrollSlice";
import pbpdReducer from "./slices/humanResource/prescriptionDBSlice";
import DeliveryNoteReducer from "./slices/inventory/deliveryNoteSlice";
import ItemCategoryReducer from "./slices/inventory/itemCategorySlice";
import ItemReducer from "./slices/inventory/itemSlice";
import ServiceReducer from "./slices/inventory/serviceSlice";
import StockMovementReducer from "./slices/inventory/stockMovementSlice";
import StoreInventoryReducer from "./slices/inventory/storeInventorySlice";
import StoreReducer from "./slices/inventory/storeSlice";
import SupplierReducer from "./slices/inventory/supplierSlice";
import UnitReducer from "./slices/inventory/unitSlice";
import ManufacturingReducer from "./slices/manufacturing/manufacturingSlice";
import ProjectSaleReducer from "./slices/projects/projectSaleSlice";
import ProjectReducer from "./slices/projects/projectSlice";
import ClientReducer from "./slices/sales/clientSlice";
import CreditSaleReducer from "./slices/sales/creditSaleSlice";
import branchReducer from "./slices/settings/branchSlice";
import permissionReducer from "./slices/settings/permissionSlice";
import roleReducer from "./slices/settings/roleSlice";

// Persist config for userAuth
const userAuthPersistConfig = {
  key: "userAuth",
  storage: AsyncStorage,
  whitelist: ["data"],
};

const persistedUserAuthReducer = persistReducer(
  userAuthPersistConfig,
  UserAuthReducer,
);

export const store = configureStore({
  reducer: {
    seedlingStage: seedlingStageReducer,
    seedlingBatch: seedlingBatchReducer,
    seedlingDeath: seedlingDeathReducer,
    seedlingGrowth: seedlingGrowthReducer,
    pbpd: pbpdReducer,
    branch: branchReducer,
    permission: permissionReducer,
    role: roleReducer,
    event: EventReducer,
    department: DepartmentReducer,
    employee: EmployeeReducer,
    userAuth: persistedUserAuthReducer,
    itemCategory: ItemCategoryReducer,
    item: ItemReducer,
    service: ServiceReducer,
    store: StoreReducer,
    stockMvt: StockMovementReducer,
    units: UnitReducer,
    client: ClientReducer,
    project: ProjectReducer,
    projectSale: ProjectSaleReducer,
    exhibition: ExhibitionReducer,
    exhibitionExpense: ExhibitionExpenseReducer,
    exhibitionStore: ExhibitionStoreReducer,
    exhibitionInventoryRecord: ExhibitionInventoryRecordReducer,
    branchExpense: BranchExpenseReducer,
    storeInventory: StoreInventoryReducer,
    exhibitionStoreInventory: ExhibitionStoreInventoryReducer,
    creditSale: CreditSaleReducer,
    attendance: AttendanceReducer,
    payroll: PayrollReducer,
    deliveryNotes: DeliveryNoteReducer,
    supplier: SupplierReducer,
    manufacturing: ManufacturingReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
