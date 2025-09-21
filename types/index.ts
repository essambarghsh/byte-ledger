export interface Employee {
  id: string
  name: string
  avatar: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  transactionType: string
  customerName: string | null
  amount: number
  status: 'paid' | 'pending' | 'canceled'
  employeeId: string
  employeeName: string
  employeeAvatar: string
  createdAt: string
  updatedAt: string
  isArchived?: boolean
}

export interface Archive {
  id: string
  date: string
  totalSales: number
  suppliedAmount: number
  openingAmountForNextDay: number
  employeeIdWhoArchived: string
  createdAt: string
  filename: string
}

export interface ArchiveData extends Archive {
  invoices: Invoice[]
}

export interface TransactionType {
  id: string
  name: string
  isActive: boolean
}

export interface AppSettings {
  transactionTypes: TransactionType[]
  timezone: string
  archiveOptions: {
    storeSnapshots: boolean
  }
}

export interface SessionData {
  employeeId: string
  employeeName: string
  employeeAvatar: string
}
