import type { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId | string
  name: string
  email: string
  password: string
  role: "admin" | "staff" | "user"
  created_at: Date
}

export interface Dormitory {
  _id: ObjectId | string
  name: string
  description?: string
  capacity?: number
}

export interface Bed {
  _id: ObjectId | string
  bed_number: string
  dormitory_id: ObjectId | string
  dormitory_name?: string
  bed_type: "Single" | "Double" | "Bunk" | "Dormitory"
  status: "available" | "occupied" | "needs_cleaning" | "maintenance"
  price: number
  notes?: string
}

export interface Guest {
  _id: ObjectId | string
  name: string
  email?: string
  phone?: string
  nationality?: string
  id_type?: string
  id_number?: string
  notes?: string
  created_at: Date
}

export interface Assignment {
  _id: ObjectId | string
  guest_id: ObjectId | string
  bed_id: ObjectId | string
  check_in: Date
  check_out: Date
  price: number
  payment_status: "paid" | "partially_paid" | "not_paid"
  payment_date?: Date
  notes?: string
}

export interface BarTransaction {
  _id: ObjectId | string
  guest_id: ObjectId | string
  transaction_date: Date
  item_name: string
  quantity: number
  price: number
  amount: number
  payment_status: "paid" | "not_paid"
  notes?: string
}

export interface ExtraService {
  _id: ObjectId | string
  guest_id: ObjectId | string
  service_date: Date
  service_name: string
  price: number
  payment_status: "paid" | "not_paid"
  notes?: string
}

export interface Expense {
  _id: ObjectId | string
  date: Date
  category: string
  description: string
  amount: number
  receipt_url?: string
  notes?: string
}

export interface Transaction {
  _id: ObjectId | string
  date: Date
  type: string
  guest_name: string
  description?: string
  amount: number
  payment_status: "paid" | "not_paid"
}

export interface CheckIn {
  _id: ObjectId | string
  name: string
  bed_number: string
  check_in: Date
  check_out: Date
  bed_charges: number
  bar_charges: number
  extra_charges: number
  total_charges: number
  payment_status: "paid" | "partially_paid" | "not_paid"
}

export interface FinancialData {
  income: number
  bedIncome: number
  barIncome: number
  extraIncome: number
  expenses: number
  profit: number
  unpaid: number
  profitMargin: number
  incomeFormatted: string
  bedIncomeFormatted: string
  barIncomeFormatted: string
  extraIncomeFormatted: string
  expensesFormatted: string
  profitFormatted: string
  unpaidFormatted: string
}

export interface BedStats {
  total: number
  available: number
  occupied: number
  needsCleaning: number
}
