import { NextRequest, NextResponse } from 'next/server'
import { updateInvoice } from '@/lib/data-access'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params
    
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
