import { NextRequest, NextResponse } from 'next/server'
import { api } from '@/lib/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const response = await api.applications.updateStatus(params.id, status)
    
    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}