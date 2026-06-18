export interface IWebhookCallback {
  event_type: 'collection.completed' | 'collection.failed';
  transaction: Transaction;
  collection?: Collection; // Present for collection events
  disbursement?: Disbursement; // Present for disbursement events
}

// Transaction details interface
interface Transaction {
  uuid: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: Amount;
  provider: 'mtn' | 'airtel' | 'card payments';
  phone_number: string | null;
  description?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Collection details interface (for mobile money/card payments)
interface Collection {
  provider: 'mtn' | 'airtel' | 'card payments';
  phone_number: string | null;
  amount: Amount;
  mode: string; // e.g., "mtnuganda", "airteluganda", "card paymentsuganda"
  provider_transaction_id: string | null;
}

// Disbursement details interface (for payouts)
interface Disbursement {
  provider: 'mtn' | 'airtel';
  phone_number: string;
  amount: Amount;
  mode: string; // e.g., "mtnuganda", "airteluganda"
  provider_reference: string | null;
  recipient_name: string;
  provider_transaction_id: string | null;
}

// Amount details interface
interface Amount {
  formatted: string; // Formatted with commas: "540.00"
  raw: string | number; // Raw value as string or number
  currency: string; // e.g., "UGX", "USD"
}
