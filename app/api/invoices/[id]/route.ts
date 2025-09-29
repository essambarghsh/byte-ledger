import { NextRequest, NextResponse } from 'next/server'
import { updateInvoice } from '@/lib/data-access'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    
    // Handle "مسحوب" status - convert amount to negative
    if (body.status === 'مسحوب' && body.amount && body.amount > 0) {
      body.amount = body.amount * -1
    }
    // Handle changing from "مسحوب" to other status - convert to positive if negative
    else if (body.status && body.status !== 'مسحوب' && body.amount && body.amount < 0) {
      body.amount = Math.abs(body.amount)
    }
    
    const updatedInvoice = await updateInvoice(id, body)
    
    if (!updatedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
