export const BranchExpenseEndpoints = {
    createExpense: "/api/branch-expenses/create",
    modifyExpense: (id: string) => `/api/branch-expenses/modify/${id}`,
    deleteExpense: (id: string) => `/api/branch-expenses/delete/${id}`,
    fetchExpenses: (id: string) => `/api/branch-expenses/fetch-all/${id}`,
    expenseReport: (
  branchId?: string,
  category?: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();

  if (branchId) params.append("branchId", branchId);
  if (category) params.append("category", category);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const query = params.toString();
  return `/api/reports/expenses/expenses-report${query ? `?${query}` : ''}`;
},

}