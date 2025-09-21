import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Employee, Invoice, Archive, ArchiveData, AppSettings } from '@/types'
import { getCurrentDateTimeCairo, getDateStringCairo } from './date-utils'

const DATA_DIR = path.join(process.cwd(), 'data')
const ARCHIVES_DIR = path.join(DATA_DIR, 'archives')

// Ensure data directories exist
async function ensureDataDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.mkdir(ARCHIVES_DIR, { recursive: true })
}

// Generic file read/write functions
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDirs()
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    // If file doesn't exist, return default and create it
    await writeJsonFile(filePath, defaultValue)
    return defaultValue
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDirs()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// Employee functions
export async function getEmployees(): Promise<Employee[]> {
  const filePath = path.join(DATA_DIR, 'employees.json')
  return readJsonFile(filePath, [])
}

export async function saveEmployees(employees: Employee[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'employees.json')
  await writeJsonFile(filePath, employees)
}

export async function addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
  const employees = await getEmployees()
  const now = getCurrentDateTimeCairo()
  const newEmployee: Employee = {
    ...employee,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  }
  employees.push(newEmployee)
  await saveEmployees(employees)
  return newEmployee
}

export async function updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt'>>): Promise<Employee | null> {
  const employees = await getEmployees()
  const index = employees.findIndex(emp => emp.id === id)
  if (index === -1) return null
  
  employees[index] = {
    ...employees[index],
    ...updates,
    updatedAt: getCurrentDateTimeCairo()
  }
  await saveEmployees(employees)
  return employees[index]
}

// Invoice functions
export async function getInvoices(): Promise<Invoice[]> {
  const filePath = path.join(DATA_DIR, 'invoices.json')
  return readJsonFile(filePath, [])
}

export async function getUnarchivedInvoices(): Promise<Invoice[]> {
  const allInvoices = await getInvoices()
  return allInvoices.filter(invoice => !invoice.isArchived)
}

export async function saveInvoices(invoices: Invoice[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'invoices.json')
  await writeJsonFile(filePath, invoices)
}

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const invoices = await getInvoices()
  const now = getCurrentDateTimeCairo()
  const newInvoice: Invoice = {
    ...invoice,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now
  }
  // Insert at the beginning (most recent first)
  invoices.unshift(newInvoice)
  await saveInvoices(invoices)
  return newInvoice
}

export async function updateInvoice(id: string, updates: Partial<Omit<Invoice, 'id' | 'createdAt'>>): Promise<Invoice | null> {
  const invoices = await getInvoices()
  const index = invoices.findIndex(inv => inv.id === id)
  if (index === -1) return null
  
  invoices[index] = {
    ...invoices[index],
    ...updates,
    updatedAt: getCurrentDateTimeCairo()
  }
  await saveInvoices(invoices)
  return invoices[index]
}

// Archive functions
export async function getArchives(): Promise<Archive[]> {
  const filePath = path.join(DATA_DIR, 'archives.json')
  return readJsonFile(filePath, [])
}

export async function saveArchives(archives: Archive[]): Promise<void> {
  const filePath = path.join(DATA_DIR, 'archives.json')
  await writeJsonFile(filePath, archives)
}

export async function createArchive(
  totalSales: number,
  suppliedAmount: number,
  employeeId: string,
  invoicesToArchive: Invoice[]
): Promise<Archive> {
  const now = getCurrentDateTimeCairo()
  const dateStr = getDateStringCairo()
  const archiveId = uuidv4()
  const filename = `${dateStr}-${archiveId}.json`
  
  const archive: Archive = {
    id: archiveId,
    date: dateStr,
    totalSales,
    suppliedAmount,
    openingAmountForNextDay: totalSales - suppliedAmount,
    employeeIdWhoArchived: employeeId,
    createdAt: now,
    filename
  }
  
  const archiveData: ArchiveData = {
    ...archive,
    invoices: invoicesToArchive
  }
  
  // Save archive data file
  const archiveFilePath = path.join(ARCHIVES_DIR, filename)
  await writeJsonFile(archiveFilePath, archiveData)
  
  // Update archives index
  const archives = await getArchives()
  archives.push(archive)
  await saveArchives(archives)
  
  return archive
}

export async function getArchiveData(filename: string): Promise<ArchiveData | null> {
  try {
    const filePath = path.join(ARCHIVES_DIR, filename)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

// Get yesterday's sales from archives
export async function getYesterdaySales(): Promise<number> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getDateStringCairo(yesterday)
  
  const archives = await getArchives()
  const yesterdayArchive = archives.find(archive => archive.date === yesterdayStr)
  
  if (yesterdayArchive) {
    const archiveData = await getArchiveData(yesterdayArchive.filename)
    if (archiveData) {
      // Calculate total sales from paid invoices in the archive
      return archiveData.invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0)
    }
  }
  
  return 0
}

// Get opening balance for today
export async function getTodaysOpeningBalance(): Promise<number> {
  const today = getDateStringCairo()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getDateStringCairo(yesterday)
  
  const archives = await getArchives()
  
  // First, check if there are any archives from today
  const todayArchives = archives
    .filter(archive => archive.date === today)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  if (todayArchives.length > 0) {
    // Use the most recent archive from today as the opening balance
    return todayArchives[0].openingAmountForNextDay
  }
  
  // If no archives from today, use yesterday's closing balance
  const yesterdayArchive = archives.find(archive => archive.date === yesterdayStr)
  return yesterdayArchive?.openingAmountForNextDay || 0
}

// Settings functions
export async function getSettings(): Promise<AppSettings> {
  const filePath = path.join(DATA_DIR, 'settings.json')
  const defaultSettings: AppSettings = {
    transactionTypes: [
      { id: uuidv4(), name: 'Product Sale', isActive: true },
      { id: uuidv4(), name: 'Subscription Renewal', isActive: true },
      { id: uuidv4(), name: 'Unspecified', isActive: true }
    ],
    timezone: 'Africa/Cairo',
    archiveOptions: {
      storeSnapshots: true
    }
  }
  return readJsonFile(filePath, defaultSettings)
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const filePath = path.join(DATA_DIR, 'settings.json')
  await writeJsonFile(filePath, settings)
}
