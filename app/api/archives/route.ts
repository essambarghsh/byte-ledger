import { NextRequest, NextResponse } from 'next/server'
import { getArchives, createArchive, getInvoices, saveInvoices } from '@/lib/data-access'
import { isToday } from '@/lib/date-utils'

export async function GET() {
  try {
    const archives = await getArchives()
    return NextResponse.json(archives)
  } catch (error) {
    console.error('Error fetching archives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { suppliedAmount, openingBalance = 0, employeeId } = body
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    if (typeof suppliedAmount !== 'number' || suppliedAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid supplied amount' },
        { status: 400 }
      )
    }

    if (typeof openingBalance !== 'number' || openingBalance < 0) {
      return NextResponse.json(
        { error: 'Invalid opening balance' },
        { status: 400 }
      )
    }

    // Get all invoices
    const allInvoices = await getInvoices()
    
    // Find today's paid, canceled, and withdrawn invoices that are not archived
    const todayInvoices = allInvoices.filter(invoice => 
      (invoice.status === 'paid' || invoice.status === 'canceled' || invoice.status === 'مسحوب') && 
      isToday(invoice.createdAt) && 
      !invoice.isArchived
    )
    
    // Calculate actual sales from today's paid and withdrawn invoices
    const actualSales = todayInvoices
      .filter(invoice => invoice.status === 'paid' || invoice.status === 'مسحوب')
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    
    // Total sales includes opening balance
    const totalSales = actualSales + openingBalance
    
    if (suppliedAmount > totalSales) {
      return NextResponse.json(
        { error: 'Supplied amount cannot exceed total sales' },
        { status: 400 }
      )
    }

    // Create archive
    const archive = await createArchive(
      totalSales,
      suppliedAmount,
      employeeId,
      todayInvoices
    )
    
    // Mark invoices as archived
    const updatedInvoices = allInvoices.map(invoice => {
      if (todayInvoices.some(todayInv => todayInv.id === invoice.id)) {
        return { ...invoice, isArchived: true }
      }
      return invoice
    })
    
    await saveInvoices(updatedInvoices)
    
    return NextResponse.json(archive, { status: 201 })
  } catch (error) {
    console.error('Error creating archive:', error)
    return NextResponse.json(
      { error: 'Failed to create archive' },
      { status: 500 }
    )
  }
}
