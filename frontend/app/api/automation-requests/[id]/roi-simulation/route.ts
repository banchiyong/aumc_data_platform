import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return NextResponse.json({ detail: '로그인이 필요합니다' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/automation-requests/${id}/roi-simulation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    if (!response.ok) {
      return new NextResponse(text, { status: response.status })
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Save automation ROI proxy error:', error)
    return NextResponse.json({ detail: 'ROI 저장 처리 중 오류가 발생했습니다' }, { status: 500 })
  }
}
