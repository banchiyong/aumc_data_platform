'use client'

import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, Copy } from 'lucide-react'

interface AutomationRoiCalculatorProps {
  requestId: string
  currentManpowerCount: number
  currentWorkerAnnualSalary?: number | null
  currentExecutionFrequency: number
  currentTimeMinutes: number
  expectedTimeMinutes?: number | null
  savedRoiBasisJson?: string | null
  savedRoiAt?: string | null
}

const ANNUAL_WORK_MINUTES_PER_PERSON = 52 * 5 * 8 * 60
const DEFAULT_ANNUAL_SALARY_MANWON = 6000

function formatManwon(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}만원`
}

function formatYears(value: number) {
  if (value < 1) return `${(value * 12).toFixed(1)}개월`
  return `${value.toFixed(2)}년`
}

function legacyCopyText(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

function selectTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
}

export default function AutomationRoiCalculator({
  requestId,
  currentManpowerCount,
  currentWorkerAnnualSalary,
  currentExecutionFrequency,
  currentTimeMinutes,
  expectedTimeMinutes,
  savedRoiBasisJson,
  savedRoiAt,
}: AutomationRoiCalculatorProps) {
  const router = useRouter()
  const savedBasis = useMemo(() => {
    if (!savedRoiBasisJson) return null
    try {
      return JSON.parse(savedRoiBasisJson) as Record<string, unknown>
    } catch {
      return null
    }
  }, [savedRoiBasisJson])
  const [annualSalaryManwon, setAnnualSalaryManwon] = useState(
    String(
      Number(savedBasis?.annualSalaryManwon) ||
        (currentWorkerAnnualSalary && currentWorkerAnnualSalary > 0
          ? Math.round(currentWorkerAnnualSalary / 10000)
          : DEFAULT_ANNUAL_SALARY_MANWON)
    )
  )
  const [developmentPeople, setDevelopmentPeople] = useState(String(Number(savedBasis?.developmentPeople) || 1))
  const [developmentMonths, setDevelopmentMonths] = useState(String(Number(savedBasis?.developmentMonths) || 1))
  const [developerAnnualSalaryManwon, setDeveloperAnnualSalaryManwon] = useState(
    String(Number(savedBasis?.developerAnnualSalaryManwon) || DEFAULT_ANNUAL_SALARY_MANWON)
  )
  const [maintenancePeople, setMaintenancePeople] = useState(String(Number(savedBasis?.maintenancePeople) || 1))
  const [maintenanceMonths, setMaintenanceMonths] = useState(String(Number(savedBasis?.maintenanceMonths) || 12))
  const [maintenanceContributionPercent, setMaintenanceContributionPercent] = useState(
    String(Number(savedBasis?.maintenanceContributionPercent) || 100)
  )
  const [maintenanceAnnualSalaryManwon, setMaintenanceAnnualSalaryManwon] = useState(
    String(Number(savedBasis?.maintenanceAnnualSalaryManwon) || DEFAULT_ANNUAL_SALARY_MANWON)
  )
  const [annualEquipmentCostManwon, setAnnualEquipmentCostManwon] = useState(
    String(Number(savedBasis?.annualEquipmentCostManwon) || 0)
  )
  const [saving, setSaving] = useState(false)
  const summaryTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const calculation = useMemo(() => {
    const salaryManwon = Number(annualSalaryManwon)
    const developerSalaryManwon = Number(developerAnnualSalaryManwon)
    const maintenanceSalaryManwon = Number(maintenanceAnnualSalaryManwon)
    const people = Number(developmentPeople)
    const months = Number(developmentMonths)
    const maintenanceTeam = Number(maintenancePeople)
    const maintenancePeriod = Number(maintenanceMonths)
    const maintenanceContributionRate = Math.min(
      100,
      Math.max(1, Number(maintenanceContributionPercent) || 0)
    )
    const equipmentCostManwon = Number(annualEquipmentCostManwon)

    if (!salaryManwon || salaryManwon <= 0) return null

    const annualCurrentTaskMinutes =
      currentManpowerCount * currentExecutionFrequency * 12 * currentTimeMinutes

    const annualCurrentLaborCostManwon =
      salaryManwon * (annualCurrentTaskMinutes / ANNUAL_WORK_MINUTES_PER_PERSON)

    const annualExpectedTaskMinutes =
      expectedTimeMinutes !== undefined && expectedTimeMinutes !== null
        ? currentManpowerCount * currentExecutionFrequency * 12 * expectedTimeMinutes
        : null

    const annualExpectedLaborCostManwon =
      annualExpectedTaskMinutes !== null
        ? salaryManwon * (annualExpectedTaskMinutes / ANNUAL_WORK_MINUTES_PER_PERSON)
        : null

    const annualLaborSavingsManwon =
      annualExpectedLaborCostManwon !== null
        ? annualCurrentLaborCostManwon - annualExpectedLaborCostManwon
        : null

    const developmentCostManwon =
      developerSalaryManwon > 0 && people > 0 && months > 0
        ? (developerSalaryManwon / 12) * people * months
        : 0

    const maintenanceCostManwon =
      maintenanceSalaryManwon > 0 && maintenanceTeam > 0 && maintenancePeriod > 0
        ? (maintenanceSalaryManwon / 12) *
          maintenanceTeam *
          maintenancePeriod *
          (maintenanceContributionRate / 100)
        : 0

    const initialImplementationCostManwon =
      developmentCostManwon +
      maintenanceCostManwon +
      (equipmentCostManwon > 0 ? equipmentCostManwon : 0)

    const netGain1YearManwon =
      annualLaborSavingsManwon !== null
        ? annualLaborSavingsManwon - initialImplementationCostManwon
        : null
    const netGain3YearManwon =
      annualLaborSavingsManwon !== null
        ? annualLaborSavingsManwon * 3 - initialImplementationCostManwon
        : null
    const netGain5YearManwon =
      annualLaborSavingsManwon !== null
        ? annualLaborSavingsManwon * 5 - initialImplementationCostManwon
        : null

    const paybackYears =
      annualLaborSavingsManwon !== null &&
      annualLaborSavingsManwon > 0 &&
      initialImplementationCostManwon > 0
        ? initialImplementationCostManwon / annualLaborSavingsManwon
        : null

    const finalRoiAmountManwon =
      annualLaborSavingsManwon !== null
        ? annualLaborSavingsManwon - initialImplementationCostManwon
        : null

    const finalRoiRatio =
      finalRoiAmountManwon !== null && initialImplementationCostManwon > 0
        ? (finalRoiAmountManwon / initialImplementationCostManwon) * 100
        : null

    const implementationCostWithoutDevelopmentManwon =
      maintenanceCostManwon + (equipmentCostManwon > 0 ? equipmentCostManwon : 0)

    const finalRoiAmountWithoutDevelopmentManwon =
      annualLaborSavingsManwon !== null
        ? annualLaborSavingsManwon - implementationCostWithoutDevelopmentManwon
        : null

    const finalRoiRatioWithoutDevelopment =
      finalRoiAmountWithoutDevelopmentManwon !== null && implementationCostWithoutDevelopmentManwon > 0
        ? (finalRoiAmountWithoutDevelopmentManwon / implementationCostWithoutDevelopmentManwon) *
          100
        : null

    return {
      annualCurrentLaborCostManwon,
      annualExpectedLaborCostManwon,
      annualLaborSavingsManwon,
      developmentCostManwon,
      maintenanceCostManwon,
      annualEquipmentCostManwon: equipmentCostManwon,
      initialImplementationCostManwon,
      netGain1YearManwon,
      netGain3YearManwon,
      netGain5YearManwon,
      paybackYears,
      finalRoiAmountManwon,
      finalRoiRatio,
      finalRoiAmountWithoutDevelopmentManwon,
      finalRoiRatioWithoutDevelopment,
    }
  }, [
    annualEquipmentCostManwon,
    annualSalaryManwon,
    currentExecutionFrequency,
    currentManpowerCount,
    currentTimeMinutes,
    developerAnnualSalaryManwon,
    developmentMonths,
    developmentPeople,
    expectedTimeMinutes,
    maintenanceAnnualSalaryManwon,
    maintenanceContributionPercent,
    maintenanceMonths,
    maintenancePeople,
  ])

  const summaryText = useMemo(() => {
    if (!calculation) return ''

    return [
      '[자동화 서비스 ROI 분석 시뮬레이션]',
      '',
      '1. 입력 가정',
      `- 기존 작업 투입 인력: ${currentManpowerCount}명`,
      `- 기존 작업 빈도(월 기준): ${currentExecutionFrequency}회`,
      `- 기존 작업 소요 시간: ${currentTimeMinutes}분`,
      `- 자동화 후 예상 소요 시간: ${expectedTimeMinutes ?? '-'}분`,
      `- 대상 인력 평균 연봉: ${formatManwon(Number(annualSalaryManwon))}`,
      `- 개발 인원 / 기간: ${developmentPeople}명 / ${developmentMonths}개월`,
      `- 개발자 평균 연봉: ${formatManwon(Number(developerAnnualSalaryManwon))}`,
      `- 유지보수 인원 / 기간: ${maintenancePeople}명 / ${maintenanceMonths}개월`,
      `- 유지보수 업무 기여도: ${maintenanceContributionPercent}%`,
      `- 유지보수 담당 평균 연봉: ${formatManwon(Number(maintenanceAnnualSalaryManwon))}`,
      `- 장비 점유 예상비용(년): ${formatManwon(Number(annualEquipmentCostManwon) || 0)}`,
      '',
      '2. 업무 비용 비교',
      `- 기존 업무 비용(연): ${formatManwon(calculation.annualCurrentLaborCostManwon)}`,
      `- 변경 후 업무 비용(연): ${
        calculation.annualExpectedLaborCostManwon !== null
          ? formatManwon(calculation.annualExpectedLaborCostManwon)
          : '-'
      }`,
      `- 연간 절감액: ${
        calculation.annualLaborSavingsManwon !== null
          ? formatManwon(calculation.annualLaborSavingsManwon)
          : '-'
      }`,
      '',
      '3. 기간별 순이득',
      `- 1년 기준: ${
        calculation.netGain1YearManwon !== null ? formatManwon(calculation.netGain1YearManwon) : '-'
      }`,
      `- 3년 기준: ${
        calculation.netGain3YearManwon !== null ? formatManwon(calculation.netGain3YearManwon) : '-'
      }`,
      `- 5년 기준: ${
        calculation.netGain5YearManwon !== null ? formatManwon(calculation.netGain5YearManwon) : '-'
      }`,
      '',
      '4. 초기 도입비용 및 회수기간',
      `- 개발 비용: ${formatManwon(calculation.developmentCostManwon)}`,
      `- 유지보수 비용: ${formatManwon(calculation.maintenanceCostManwon)}`,
      `- 장비 비용: ${formatManwon(calculation.annualEquipmentCostManwon)}`,
      `- 초기 도입비용: ${formatManwon(calculation.initialImplementationCostManwon)}`,
      `- 최종 ROI 금액(개발비용 포함): ${
        calculation.finalRoiAmountManwon !== null ? formatManwon(calculation.finalRoiAmountManwon) : '-'
      }`,
      `- 최종 ROI 금액(개발비용 제외): ${
        calculation.finalRoiAmountWithoutDevelopmentManwon !== null
          ? formatManwon(calculation.finalRoiAmountWithoutDevelopmentManwon)
          : '-'
      }`,
      `- 최종 ROI 비율(개발비용 포함): ${
        calculation.finalRoiRatio !== null ? `${calculation.finalRoiRatio.toFixed(1)}%` : '-'
      }`,
      `- 최종 ROI 비율(개발비용 제외): ${
        calculation.finalRoiRatioWithoutDevelopment !== null
          ? `${calculation.finalRoiRatioWithoutDevelopment.toFixed(1)}%`
          : '-'
      }`,
      `- 투자 회수기간: ${
        calculation.paybackYears !== null ? formatYears(calculation.paybackYears) : '-'
      }`,
    ].join('\n')
  }, [
    annualEquipmentCostManwon,
    annualSalaryManwon,
    calculation,
    currentExecutionFrequency,
    currentManpowerCount,
    currentTimeMinutes,
    developerAnnualSalaryManwon,
    developmentMonths,
    developmentPeople,
    expectedTimeMinutes,
    maintenanceAnnualSalaryManwon,
    maintenanceContributionPercent,
    maintenanceMonths,
    maintenancePeople,
  ])

  const handleCopy = async () => {
    if (!summaryText) return

    try {
      const clipboard = globalThis.navigator?.clipboard
      if (!clipboard || typeof clipboard.writeText !== 'function') {
        throw new Error('Clipboard API unavailable')
      }

      await clipboard.writeText(summaryText)
      alert('ROI 분석 결과를 복사했습니다.')
    } catch (error) {
      try {
        const copied = legacyCopyText(summaryText)
        if (copied) {
          selectTextarea(summaryTextareaRef.current)
          alert('자동 복사가 제한되어 결과 텍스트를 선택했습니다. Ctrl+C 또는 Cmd+C로 복사해주세요.')
          return
        }
      } catch (fallbackError) {
        console.error('ROI summary fallback copy error:', fallbackError)
      }
      selectTextarea(summaryTextareaRef.current)
      console.error('ROI summary copy error:', error)
      alert('자동 복사가 제한되었습니다. 결과 텍스트를 선택했으니 Ctrl+C 또는 Cmd+C로 복사해주세요.')
    }
  }

  const handleSave = async () => {
    if (!calculation) return

    setSaving(true)
    try {
      const basis = {
        annualSalaryManwon: Number(annualSalaryManwon),
        developmentPeople: Number(developmentPeople),
        developmentMonths: Number(developmentMonths),
        developerAnnualSalaryManwon: Number(developerAnnualSalaryManwon),
        maintenancePeople: Number(maintenancePeople),
        maintenanceMonths: Number(maintenanceMonths),
        maintenanceContributionPercent: Number(maintenanceContributionPercent),
        maintenanceAnnualSalaryManwon: Number(maintenanceAnnualSalaryManwon),
        annualEquipmentCostManwon: Number(annualEquipmentCostManwon),
      }

      const result = {
        annualCurrentLaborCostManwon: calculation.annualCurrentLaborCostManwon,
        annualExpectedLaborCostManwon: calculation.annualExpectedLaborCostManwon,
        annualLaborSavingsManwon: calculation.annualLaborSavingsManwon,
        developmentCostManwon: calculation.developmentCostManwon,
        maintenanceCostManwon: calculation.maintenanceCostManwon,
        annualEquipmentCostManwon: calculation.annualEquipmentCostManwon,
        initialImplementationCostManwon: calculation.initialImplementationCostManwon,
        netGain1YearManwon: calculation.netGain1YearManwon,
        netGain3YearManwon: calculation.netGain3YearManwon,
        netGain5YearManwon: calculation.netGain5YearManwon,
        paybackYears: calculation.paybackYears,
        finalRoiAmountManwon: calculation.finalRoiAmountManwon,
        finalRoiAmountWithoutDevelopmentManwon: calculation.finalRoiAmountWithoutDevelopmentManwon,
        finalRoiRatio: calculation.finalRoiRatio,
        finalRoiRatioWithoutDevelopment: calculation.finalRoiRatioWithoutDevelopment,
      }

      const response = await fetch(`/api/automation-requests/${requestId}/roi-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basis,
          result,
          roi_amount_with_dev: Math.round(calculation.finalRoiAmountManwon ?? 0),
          roi_amount_without_dev: Math.round(calculation.finalRoiAmountWithoutDevelopmentManwon ?? 0),
          roi_ratio_with_dev: calculation.finalRoiRatio ?? 0,
          roi_ratio_without_dev: calculation.finalRoiRatioWithoutDevelopment ?? 0,
        }),
      })

      const text = await response.text()
      if (!response.ok) {
        throw new Error(text || 'ROI 저장에 실패했습니다.')
      }

      alert('ROI 시뮬레이션 결과를 저장했습니다.')
      router.refresh()
    } catch (error) {
      console.error('ROI save error:', error)
      alert(error instanceof Error ? error.message : 'ROI 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Calculator className="mr-2 h-4 w-4" />
          ROI 분석 시뮬레이션
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] max-w-6xl overflow-hidden text-xs">
        <DialogHeader>
          <DialogTitle className="text-base">ROI 분석 시뮬레이션</DialogTitle>
          <DialogDescription className="text-[11px] leading-5">
            금액은 모두 만원 기준입니다. 기존 업무 비용과 변경 후 비용, 기간별 순이득, 초기 도입비용을 한 번에 비교할 수
            있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[72vh] gap-4 overflow-y-auto pr-2 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">운영 인건비 가정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="space-y-1.5">
                  <Label htmlFor="annual-salary" className="text-xs">대상 인력 평균 연봉(만원)</Label>
                  <Input
                    id="annual-salary"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="예: 6000"
                    value={annualSalaryManwon}
                    onChange={(e) => setAnnualSalaryManwon(e.target.value)}
                  />
                </div>
                <p className="text-[11px] leading-5 text-gray-500">
                  신청서의 인력, 월 기준 횟수, 소요 시간을 바탕으로 연간 기준 비용을 계산합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">개발 공수 가정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="grid gap-2.5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="development-people" className="text-xs">개발 인원</Label>
                    <Input
                      id="development-people"
                      type="number"
                      min="1"
                      step="1"
                      value={developmentPeople}
                      onChange={(e) => setDevelopmentPeople(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="development-months" className="text-xs">개발 기간(개월)</Label>
                    <Input
                      id="development-months"
                      type="number"
                      min="1"
                      step="1"
                      value={developmentMonths}
                      onChange={(e) => setDevelopmentMonths(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="developer-annual-salary" className="text-xs">개발자 평균 연봉(만원)</Label>
                  <Input
                    id="developer-annual-salary"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="예: 6000"
                    value={developerAnnualSalaryManwon}
                    onChange={(e) => setDeveloperAnnualSalaryManwon(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">유지보수 가정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="grid gap-2.5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-people" className="text-xs">유지보수 인원</Label>
                    <Input
                      id="maintenance-people"
                      type="number"
                      min="1"
                      step="1"
                      value={maintenancePeople}
                      onChange={(e) => setMaintenancePeople(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maintenance-months" className="text-xs">유지보수 기간(개월)</Label>
                    <Input
                      id="maintenance-months"
                      type="number"
                      min="1"
                      step="1"
                      value={maintenanceMonths}
                      onChange={(e) => setMaintenanceMonths(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maintenance-contribution" className="text-xs">업무 기여도(%)</Label>
                  <Input
                    id="maintenance-contribution"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    placeholder="예: 100"
                    value={maintenanceContributionPercent}
                    onChange={(e) => setMaintenanceContributionPercent(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maintenance-annual-salary" className="text-xs">유지보수 평균 연봉(만원)</Label>
                  <Input
                    id="maintenance-annual-salary"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="예: 6000"
                    value={maintenanceAnnualSalaryManwon}
                    onChange={(e) => setMaintenanceAnnualSalaryManwon(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">장비 비용 가정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="space-y-1.5">
                  <Label htmlFor="annual-equipment-cost" className="text-xs">장비 점유 예상비용(년, 만원)</Label>
                  <Input
                    id="annual-equipment-cost"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="예: 0"
                    value={annualEquipmentCostManwon}
                    onChange={(e) => setAnnualEquipmentCostManwon(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <ResultSection title="업무 비용 비교">
              <ResultGrid
                items={[
                  {
                    label: '기존 업무 비용(연)',
                    value: calculation ? formatManwon(calculation.annualCurrentLaborCostManwon) : '-',
                  },
                  {
                    label: '변경 후 업무 비용(연)',
                    value:
                      calculation && calculation.annualExpectedLaborCostManwon !== null
                        ? formatManwon(calculation.annualExpectedLaborCostManwon)
                        : '-',
                  },
                  {
                    label: '연간 절감액',
                    value:
                      calculation && calculation.annualLaborSavingsManwon !== null
                        ? formatManwon(calculation.annualLaborSavingsManwon)
                        : '-',
                    highlight: true,
                  },
                ]}
              />
            </ResultSection>

            <ResultSection title="기간별 순이득">
              <ResultGrid
                items={[
                  {
                    label: '1년 기준',
                    value:
                      calculation && calculation.netGain1YearManwon !== null
                        ? formatManwon(calculation.netGain1YearManwon)
                        : '-',
                  },
                  {
                    label: '3년 기준',
                    value:
                      calculation && calculation.netGain3YearManwon !== null
                        ? formatManwon(calculation.netGain3YearManwon)
                        : '-',
                  },
                  {
                    label: '5년 기준',
                    value:
                      calculation && calculation.netGain5YearManwon !== null
                        ? formatManwon(calculation.netGain5YearManwon)
                        : '-',
                  },
                ]}
              />
            </ResultSection>

            <ResultSection title="초기 도입비용 및 회수기간">
              <ResultGrid
                items={[
                  {
                    label: '개발 비용',
                    value: calculation ? formatManwon(calculation.developmentCostManwon) : '-',
                  },
                  {
                    label: '유지보수 비용',
                    value: calculation ? formatManwon(calculation.maintenanceCostManwon) : '-',
                  },
                  {
                    label: '장비 비용',
                    value: calculation ? formatManwon(calculation.annualEquipmentCostManwon) : '-',
                  },
                  {
                    label: '초기 도입비용',
                    value: calculation ? formatManwon(calculation.initialImplementationCostManwon) : '-',
                    highlight: true,
                  },
                  {
                    label: 'ROI 금액(개발비용 포함)',
                    value:
                      calculation && calculation.finalRoiAmountManwon !== null
                        ? formatManwon(calculation.finalRoiAmountManwon)
                        : '-',
                    highlight: true,
                  },
                  {
                    label: 'ROI 금액(개발비용 제외)',
                    value:
                      calculation && calculation.finalRoiAmountWithoutDevelopmentManwon !== null
                        ? formatManwon(calculation.finalRoiAmountWithoutDevelopmentManwon)
                        : '-',
                    highlight: true,
                  },
                  {
                    label: 'ROI 비율(개발비용 포함)',
                    value:
                      calculation && calculation.finalRoiRatio !== null
                        ? `${calculation.finalRoiRatio.toFixed(1)}%`
                        : '-',
                    highlight: true,
                  },
                  {
                    label: 'ROI 비율(개발비용 제외)',
                    value:
                      calculation && calculation.finalRoiRatioWithoutDevelopment !== null
                        ? `${calculation.finalRoiRatioWithoutDevelopment.toFixed(1)}%`
                        : '-',
                    highlight: true,
                  },
                  {
                    label: '투자 회수기간',
                    value:
                      calculation && calculation.paybackYears !== null
                        ? formatYears(calculation.paybackYears)
                        : '-',
                  },
                ]}
              />
            </ResultSection>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">결과 텍스트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <textarea
                  ref={summaryTextareaRef}
                  readOnly
                  value={summaryText}
                  className="min-h-[240px] w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[11px] leading-5 text-slate-700"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleCopy} disabled={!summaryText}>
                    <Copy className="mr-2 h-4 w-4" />
                    결과 복사
                  </Button>
                  <Button variant="outline" onClick={handleSave} disabled={!calculation || saving}>
                    {saving ? '저장 중...' : 'ROI 결과 저장'}
                  </Button>
                </div>
                {savedRoiAt && (
                  <p className="text-[11px] text-slate-500">
                    마지막 저장: {new Date(savedRoiAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          계산 기준: 1인 연간 근로시간 2,080시간(연 124,800분) 가정, 금액 단위는 모두 만원입니다.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function ResultSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ResultGrid({
  items,
}: {
  items: Array<{ label: string; value: string; highlight?: boolean }>
}) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border px-3 py-2.5 ${
            item.highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <p className={`text-[11px] font-medium ${item.highlight ? 'text-emerald-700' : 'text-slate-500'}`}>
            {item.label}
          </p>
          <p className={`mt-1 text-sm font-semibold ${item.highlight ? 'text-emerald-800' : 'text-slate-900'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
