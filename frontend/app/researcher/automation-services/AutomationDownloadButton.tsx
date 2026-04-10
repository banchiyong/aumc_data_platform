'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AutomationDownloadButtonProps {
  requestId: string
  fileType: 'process-document' | 'reference-document'
  label: string
  disabled?: boolean
}

export default function AutomationDownloadButton({
  requestId,
  fileType,
  label,
  disabled,
}: AutomationDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (disabled) return

    setDownloading(true)
    try {
      window.open(`/api/automation-download/${requestId}/${fileType}`, '_blank')
    } catch (error) {
      console.error('Automation download error:', error)
      alert('파일 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={disabled || downloading} size="sm" variant="outline">
      {downloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {downloading ? '다운로드 중...' : label}
    </Button>
  )
}
