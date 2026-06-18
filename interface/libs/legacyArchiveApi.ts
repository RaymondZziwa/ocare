import { legacyApiRequest } from "./apiConfig";

export type LegacyBranch = "equatorial" | "masanafu";
export type LegacySalesType = "shop" | "massage";

export interface LegacyApiListResponse<T> {
  message: string;
  data?: T[];
  status?: number | string;
  error?: unknown;
}

export interface LegacyApiReportResponse<T> {
  message: string;
  report?: T[];
  status?: number | string;
  error?: unknown;
}

export interface LegacySaleRecord {
  id?: number | string;
  receiptNumber?: number | string;
  saleDate?: string;
  customerNames?: string;
  customerContact?: string;
  itemsSold?: string;
  totalAmount?: number | string;
  balance?: number | string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentstatus?: string;
  paymentmethod?: string;
  additionalinfo?: string;
  transactionID?: string;
  createdAt?: string;
  createdat?: string;
  [key: string]: unknown;
}

export interface LegacyExpenseRecord {
  id?: number | string;
  expenditureid?: number | string;
  date?: string;
  expenditurecategory?: string;
  expenditurename?: string;
  expendituredescription?: string;
  expenditurecost?: number | string;
  amountspent?: number | string;
  balance?: number | string;
  paymentMethod?: string;
  paymentmethod?: string;
  paymentStatus?: string;
  paymentstatus?: string;
  createdat?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface LegacyDateRange {
  startDate?: string;
  endDate?: string;
}

const normalizeArrayResponse = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const buildDateRangeQuery = ({ startDate, endDate }: LegacyDateRange) => {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchLegacyExpenses = async (
  branch: LegacyBranch,
  range: LegacyDateRange = {}
): Promise<LegacyApiListResponse<LegacyExpenseRecord>> => {
  const endpoint =
    branch === "equatorial" ? "/api/legacy-data/equatorial-expenses" : "/api/legacy-data/masanafu-expenses";

  const response = await legacyApiRequest<LegacyApiListResponse<LegacyExpenseRecord>>(
    `${endpoint}${buildDateRangeQuery(range)}`
  );

  return {
    message: response?.message ?? "",
    data: normalizeArrayResponse<LegacyExpenseRecord>((response as unknown as { data?: unknown })?.data),
  };
};

export const fetchLegacySales = async (
  branch: LegacyBranch,
  type: LegacySalesType,
  range: LegacyDateRange = {}
): Promise<LegacyApiReportResponse<LegacySaleRecord>> => {
  if (branch === "masanafu") {
    const response = await legacyApiRequest<LegacyApiReportResponse<LegacySaleRecord>>(
      `/api/legacy-data/masanafu-shop-sales${buildDateRangeQuery(range)}`
    );

    return {
      message: response?.message ?? "",
      report: normalizeArrayResponse<LegacySaleRecord>((response as unknown as { report?: unknown })?.report),
    };
  }

  const endpoint = type === "massage" ? "/api/legacy-data/equatorial-massage-sales" : "/api/legacy-data/equatorial-shop-sales";

  const response = await legacyApiRequest<LegacyApiReportResponse<LegacySaleRecord>>(
    `${endpoint}${buildDateRangeQuery(range)}`
  );

  return {
    message: response?.message ?? "",
    report: normalizeArrayResponse<LegacySaleRecord>((response as unknown as { report?: unknown })?.report),
  };
};
