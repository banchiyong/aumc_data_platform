import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const swaggerProxyUrl = '/api/admin/swagger/docs'

export default function AdminSwaggerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API 문서</h1>
          <p className="mt-2 text-sm text-gray-600">
            관리자 화면에서 FastAPI Swagger 문서를 프록시 방식으로 확인할 수 있습니다.
          </p>
        </div>
        <a href={swaggerProxyUrl} target="_blank" rel="noreferrer">
          <Button variant="outline">
            새 창에서 열기
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={swaggerProxyUrl}
          title="FastAPI Swagger"
          className="h-[calc(100vh-220px)] min-h-[720px] w-full"
        />
      </div>
    </div>
  )
}
