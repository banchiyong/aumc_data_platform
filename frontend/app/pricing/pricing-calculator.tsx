'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PricingCalculator() {
  const [serviceType, setServiceType] = useState<string>('')
  const [serviceName, setServiceName] = useState<string>('')
  const [dataSize, setDataSize] = useState<number>(0)
  const [additionalHours, setAdditionalHours] = useState<number>(0)
  const [discount, setDiscount] = useState<string>('none')
  const [calculatedPrice, setCalculatedPrice] = useState<{
    base: number
    additional: number
    discountAmount: number
    total: number
  } | null>(null)

  const services = {
    extraction: {
      simple: { name: '단순 추출', base: 300000, perMB: 1000, freeSize: 500 },
      form: { name: '서식지 추출', base: 500000, perMB: 1000, freeSize: 500 },
    },
    processing: {
      structured: { name: '정형 전처리', base: 400000, perHour: 30000 },
      unstructured: { name: '비정형 전처리', base: 700000, perHour: 30000 },
    },
  }

  const calculatePrice = () => {
    if (!serviceType || !serviceName) {
      alert('서비스를 선택해주세요')
      return
    }

    let basePrice = 0
    let additionalPrice = 0

    if (serviceType === 'extraction') {
      const service = services.extraction[serviceName as keyof typeof services.extraction]
      basePrice = service.base
      
      if (dataSize > service.freeSize) {
        additionalPrice = (dataSize - service.freeSize) * service.perMB
      }
    } else if (serviceType === 'processing') {
      const service = services.processing[serviceName as keyof typeof services.processing]
      basePrice = service.base
      additionalPrice = additionalHours * service.perHour
    }

    let discountRate = 0
    if (discount !== 'none') {
      // 환자번호 확정 할인은 데이터 추출 서비스에만 적용
      if (discount === 'confirmedPatient' && serviceType !== 'extraction') {
        discountRate = 0
      } else {
        discountRate = 0.5
      }
    }
    const discountAmount = basePrice * discountRate
    const total = basePrice + additionalPrice - discountAmount

    setCalculatedPrice({
      base: basePrice,
      additional: additionalPrice,
      discountAmount,
      total,
    })
  }

  const reset = () => {
    setServiceType('')
    setServiceName('')
    setDataSize(0)
    setAdditionalHours(0)
    setDiscount('none')
    setCalculatedPrice(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          요금 계산기
        </CardTitle>
        <CardDescription>
          서비스 종류와 옵션을 선택하여 예상 요금을 계산해보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceType">서비스 분류</Label>
              <Select value={serviceType} onValueChange={(value) => {
                setServiceType(value)
                setServiceName('')
                // 데이터 가공으로 변경 시 환자번호 확정 할인 해제
                if (value === 'processing' && discount === 'confirmedPatient') {
                  setDiscount('none')
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="서비스 분류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extraction">데이터 추출</SelectItem>
                  <SelectItem value="processing">데이터 가공</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {serviceType && (
              <div>
                <Label htmlFor="serviceName">서비스명</Label>
                <Select value={serviceName} onValueChange={setServiceName}>
                  <SelectTrigger>
                    <SelectValue placeholder="서비스를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceType === 'extraction' ? (
                      <>
                        <SelectItem value="simple">단순 추출</SelectItem>
                        <SelectItem value="form">서식지 추출</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="structured">정형 전처리</SelectItem>
                        <SelectItem value="unstructured">비정형 전처리</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {serviceType === 'extraction' && (
              <div>
                <Label htmlFor="dataSize">데이터 용량 (MB)</Label>
                <Input
                  id="dataSize"
                  type="number"
                  value={dataSize}
                  onChange={(e) => setDataSize(Number(e.target.value))}
                  placeholder="예: 700"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  500MB까지는 기본료에 포함됩니다
                </p>
              </div>
            )}

            {serviceType === 'processing' && (
              <div>
                <Label htmlFor="additionalHours">추가 작업 시간 (시간)</Label>
                <Input
                  id="additionalHours"
                  type="number"
                  value={additionalHours}
                  onChange={(e) => setAdditionalHours(Number(e.target.value))}
                  placeholder="예: 3"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  추가 요청사항에 대한 작업 시간
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="discount">감면 조건</Label>
              <Select value={discount} onValueChange={setDiscount}>
                <SelectTrigger>
                  <SelectValue placeholder="해당사항 없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">해당사항 없음</SelectItem>
                  <SelectItem value="newResearcher">신진 연구자 (임용 후 2년 이내)</SelectItem>
                  <SelectItem value="noFunding">연구비 재원 없음</SelectItem>
                  {serviceType === 'extraction' && (
                    <SelectItem value="confirmedPatient">환자번호 확정 (데이터 추출만)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculatePrice} className="flex-1">
                요금 계산
              </Button>
              <Button onClick={reset} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 계산 결과 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">계산 결과</h3>
            
            {calculatedPrice ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">기본료</span>
                  <span className="font-semibold">
                    {calculatedPrice.base.toLocaleString()}원
                  </span>
                </div>
                
                {calculatedPrice.additional > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">
                      추가비용
                      {serviceType === 'extraction' 
                        ? ` (${dataSize - 500}MB)` 
                        : ` (${additionalHours}시간)`}
                    </span>
                    <span className="font-semibold">
                      {calculatedPrice.additional.toLocaleString()}원
                    </span>
                  </div>
                )}
                
                {calculatedPrice.discountAmount > 0 && (
                  <div className="flex justify-between py-2 border-b text-green-600">
                    <span>감면 (50%)</span>
                    <span className="font-semibold">
                      -{calculatedPrice.discountAmount.toLocaleString()}원
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 text-lg font-bold">
                  <span>총 예상 금액</span>
                  <span className="text-blue-600">
                    {calculatedPrice.total.toLocaleString()}원
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    * 본 계산 결과는 예상 금액이며, 실제 요금은 상세 요구사항에 따라 달라질 수 있습니다.
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    * 모든 금액은 부가세 별도입니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calculator className="h-12 w-12 mx-auto mb-3" />
                <p>서비스를 선택하고 계산 버튼을 클릭하세요</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}