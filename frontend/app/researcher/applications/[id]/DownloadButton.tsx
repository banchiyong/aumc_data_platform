'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface DownloadButtonProps {
  applicationId: string
  fileType: 'irb' | 'research-plan'
  label: string
  disabled?: boolean
}

export default function DownloadButton({ applicationId, fileType, label, disabled }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (disabled) return
    
    setDownloading(true)
    
    try {
      // 다운로드 링크로 이동 (새 탭에서)
      const downloadUrl = `/api/download/${applicationId}/${fileType}`
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      alert('파일 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button 
      onClick={handleDownload} 
      disabled={disabled || downloading}
      size="sm"
      variant="outline"
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {downloading ? '다운로드 중...' : label}
    </Button>
  )
}