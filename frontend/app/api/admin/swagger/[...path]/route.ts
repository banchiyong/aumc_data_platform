import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:10402'

function rewriteSwaggerHtml(html: string) {
  return html
    .replaceAll("url: '/openapi.json'", "url: '/api/admin/swagger/openapi.json'")
    .replaceAll('url: "/openapi.json"', 'url: "/api/admin/swagger/openapi.json"')
    .replaceAll("'/docs/oauth2-redirect'", "'/api/admin/swagger/docs/oauth2-redirect'")
    .replaceAll('"/docs/oauth2-redirect"', '"/api/admin/swagger/docs/oauth2-redirect"')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')

  if (!accessToken) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { path = [] } = await params
  const proxiedPath = path.length ? path.join('/') : 'docs'
  const search = request.nextUrl.search || ''
  const targetUrl = `${API_BASE_URL}/${proxiedPath}${search}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return new NextResponse(error, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'text/plain'

    if (contentType.includes('text/html')) {
      const html = await response.text()
      return new NextResponse(rewriteSwaggerHtml(html), {
        status: 200,
        headers: {
          'Content-Type': contentType,
        },
      })
    }

    const body = await response.arrayBuffer()
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    console.error('Swagger proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
