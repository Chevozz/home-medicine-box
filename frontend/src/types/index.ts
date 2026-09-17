export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  type: string;
  dosage_instructions: string;
  stock_quantity: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  medicine_id: string;
  time_to_take: string;
  frequency: string;
  created_at: string;
  updated_at: string;
  medicine?: { id: string; name: string };
}

export interface ConsumptionLog {
  id: string;
  user_id: string;
  medicine_id: string;
  consumed_at: string;
  status: "Taken" | "Missed";
  created_at: string;
  medicine?: { id: string; name: string; dosage_instructions: string };
}

export interface AuthTokens {
  token: string;
  user: User;
}
