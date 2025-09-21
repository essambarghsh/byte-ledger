import { NextRequest, NextResponse } from 'next/server'
import { getInvoices, getUnarchivedInvoices, addInvoice } from '@/lib/data-access'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'
    
    const invoices = includeArchived ? await getInvoices() : await getUnarchivedInvoices()
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { transactionType, customerName, description, amount, status, employeeId, employeeName, employeeAvatar } = body
    
    if (!transactionType || !amount || !status || !employeeId || !employeeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const newInvoice = await addInvoice({
      transactionType,
      customerName,
      description,
      amount,
      status,
      employeeId,
      employeeName,
      employeeAvatar: employeeAvatar || ''
    })
    
    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
