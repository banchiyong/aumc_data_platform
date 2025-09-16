'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Pill, TestTube, Scissors, Microscope, FileText, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Column definitions for each data type
const diagnosisColumns = [
  { key: 'id', label: '대체번호', default: true },
  { key: 'date', label: '진단일자', default: true },
  { key: 'visitCode', label: '내원구분', default: true },
  { key: 'visitName', label: '내원구분명', default: true },
  { key: 'deptCode', label: '진료과', default: true },
  { key: 'deptName', label: '진료과명', default: true },
  { key: 'dischargeDate', label: '퇴원일자', default: false },
  { key: 'birth', label: '생년월일', default: false },
  { key: 'gender', label: '성별', default: true },
  { key: 'height', label: '신장', default: false },
  { key: 'weight', label: '체중', default: false },
  { key: 'bmi', label: 'BMI', default: true },
  { key: 'diagCode', label: '진단코드', default: true },
  { key: 'diagName', label: '진단명', default: true },
  { key: 'mainDiag', label: '주진단여부', default: true },
]

const medicationColumns = [
  { key: 'id', label: '대체번호', default: true },
  { key: 'visitTime', label: '외래/입원일시', default: true },
  { key: 'visitCode', label: '내원구분코드', default: false },
  { key: 'visitName', label: '내원구분명', default: true },
  { key: 'deptCode', label: '진료과코드', default: false },
  { key: 'deptName', label: '진료과명', default: true },
  { key: 'birth', label: '생년월일', default: false },
  { key: 'gender', label: '성별', default: false },
  { key: 'height', label: '신장', default: false },
  { key: 'weight', label: '체중', default: false },
  { key: 'bmi', label: 'BMI', default: false },
  { key: 'prescDate', label: '처방일자', default: true },
  { key: 'prescOrder', label: '처방순서', default: false },
  { key: 'prescCode', label: '처방코드', default: false },
  { key: 'prescName', label: '처방명', default: true },
  { key: 'ingredCode', label: '성분코드', default: false },
  { key: 'ingredName', label: '성분명', default: true },
  { key: 'atcCode', label: 'ATC코드', default: true },
  { key: 'atcName', label: 'ATC명', default: false },
  { key: 'usage', label: '용법명', default: true },
  { key: 'dose', label: '처방용량', default: true },
  { key: 'days', label: '처방일수', default: true },
]

const labColumns = [
  { key: 'id', label: '대체번호', default: true },
  { key: 'visitTime', label: '외래/입원일시', default: true },
  { key: 'visitCode', label: '내원구분코드', default: false },
  { key: 'visitName', label: '내원구분명', default: true },
  { key: 'deptCode', label: '진료과코드', default: false },
  { key: 'deptName', label: '진료과명', default: true },
  { key: 'birth', label: '생년월일', default: false },
  { key: 'gender', label: '성별', default: false },
  { key: 'height', label: '신장', default: false },
  { key: 'weight', label: '체중', default: false },
  { key: 'bmi', label: 'BMI', default: false },
  { key: 'prescDate', label: '처방일자', default: true },
  { key: 'prescOrder', label: '처방순서', default: false },
  { key: 'prescName', label: '처방명', default: false },
  { key: 'testName', label: '검사명', default: true },
  { key: 'testCode', label: '검사코드', default: false },
  { key: 'result', label: '결과', default: true },
  { key: 'unit', label: '단위', default: true },
  { key: 'normalFlag', label: '정상구분', default: false },
  { key: 'normalLow', label: '정상치(하한)', default: false },
  { key: 'normalHigh', label: '정상치(상한)', default: false },
  { key: 'normalRange', label: '정상범위', default: true },
]

const surgeryColumns = [
  { key: 'id', label: '대체번호', default: true },
  { key: 'visitTime', label: '외래/입원일시', default: true },
  { key: 'visitCode', label: '진료내원구분', default: false },
  { key: 'visitName', label: '진료내원구분명', default: true },
  { key: 'deptCode', label: '진료과', default: false },
  { key: 'deptName', label: '진료과명', default: true },
  { key: 'surgDate', label: '수술일자', default: true },
  { key: 'surgVisitCode', label: '수술내원구분', default: false },
  { key: 'surgVisitName', label: '수술내원구분명', default: false },
  { key: 'surgDeptCode', label: '수술과', default: false },
  { key: 'surgDeptName', label: '수술과명', default: false },
  { key: 'dischargeTime', label: '퇴원일시', default: false },
  { key: 'birth', label: '생년월일', default: false },
  { key: 'gender', label: '성별', default: false },
  { key: 'height', label: '신장', default: false },
  { key: 'weight', label: '체중', default: false },
  { key: 'bmi', label: 'BMI', default: false },
  { key: 'surgOrder', label: '수술순번', default: false },
  { key: 'surgCode', label: '수술코드', default: false },
  { key: 'surgName', label: '수술명', default: true },
  { key: 'specimen', label: '검체여부', default: true },
  { key: 'anesthesia', label: '마취방법명', default: true },
]

const pathologyColumns = [
  { key: 'id', label: '대체번호', default: true },
  { key: 'visitTime', label: '외래/입원일시', default: true },
  { key: 'deptCode', label: '진료과', default: false },
  { key: 'deptName', label: '진료과명', default: true },
  { key: 'birth', label: '생년월일', default: false },
  { key: 'gender', label: '성별', default: false },
  { key: 'height', label: '신장', default: false },
  { key: 'weight', label: '체중', default: false },
  { key: 'bmi', label: 'BMI', default: false },
  { key: 'pathType', label: '병리구분', default: false },
  { key: 'pathTypeName', label: '병리구분명', default: true },
  { key: 'prescCode', label: '처방코드', default: false },
  { key: 'prescName', label: '처방명', default: true },
  { key: 'pathFindings', label: '병리소견', default: true },
  { key: 'pathFindings2', label: '병리소견2', default: false },
  { key: 'grossFindings', label: 'GROSS소견', default: false },
  { key: 'grossFindings2', label: 'GROSS소견2', default: false },
  { key: 'receiveTime', label: '접수일시', default: false },
  { key: 'reportTime', label: '보고일시', default: true },
]

// Sample data
const diagnosisData = {
  id: 'KA8330',
  date: '3111-09-02',
  visitCode: 'O',
  visitName: '외래',
  deptCode: 'FM',
  deptName: '가정의학과',
  dischargeDate: '-',
  birth: '408303',
  gender: 'M',
  height: '176',
  weight: '75',
  bmi: '24.2',
  diagCode: 'B34.9',
  diagName: 'Viral infection, unspecified',
  mainDiag: 'Y',
}

const medicationData = {
  id: 'TS58301',
  visitTime: '4011-09-02 00:00:00',
  visitCode: 'O',
  visitName: '외래',
  deptCode: 'FM',
  deptName: '가정의학과',
  birth: '398303',
  gender: 'M',
  height: '176',
  weight: '75',
  bmi: '24.2',
  prescDate: '4011-09-02',
  prescOrder: '3',
  prescCode: 'M1MT059',
  prescName: 'Selbex Cap 50mg',
  ingredCode: '235401ACH',
  ingredName: 'teprenone',
  atcCode: 'A02BX15',
  atcName: 'teprenone',
  usage: '복용',
  dose: '1',
  days: '5',
}

const labData = [
  {
    id: 'OA25444',
    visitTime: '4011-09-02 00:00:00',
    visitCode: 'M',
    visitName: '산업의학',
    deptCode: 'INDM',
    deptName: '건강증진센터4층',
    birth: '398303',
    gender: 'M',
    height: '176',
    weight: '75',
    bmi: '24.2',
    prescDate: '4011-09-02',
    prescOrder: '1',
    prescName: 'Glucose (AC)',
    testName: 'Glucose (AC)',
    testCode: 'C3711001',
    result: '81',
    unit: 'mg/dl',
    normalFlag: '-',
    normalLow: '70',
    normalHigh: '110',
    normalRange: '70-110',
  },
  {
    id: 'OA25445',
    visitTime: '4011-09-02 00:00:00',
    visitCode: 'M',
    visitName: '산업의학',
    deptCode: 'INDM',
    deptName: '건강증진센터4층',
    birth: '398303',
    gender: 'M',
    height: '176',
    weight: '75',
    bmi: '24.2',
    prescDate: '4011-09-02',
    prescOrder: '2',
    prescName: 'T.Cholesterol',
    testName: 'T.Cholesterol',
    testCode: 'C2411001',
    result: '165',
    unit: 'mg/dl',
    normalFlag: '-',
    normalLow: '120',
    normalHigh: '220',
    normalRange: '120-220',
  },
  {
    id: 'OA25446',
    visitTime: '4011-09-02 00:00:00',
    visitCode: 'M',
    visitName: '산업의학',
    deptCode: 'INDM',
    deptName: '건강증진센터4층',
    birth: '398303',
    gender: 'M',
    height: '176',
    weight: '75',
    bmi: '24.2',
    prescDate: '4011-09-02',
    prescOrder: '3',
    prescName: 'AST (GOT)',
    testName: 'AST (GOT)',
    testCode: 'B2570001',
    result: '23',
    unit: 'U/L',
    normalFlag: '-',
    normalLow: '5',
    normalHigh: '40',
    normalRange: '5-40',
  },
]

const surgeryData = {
  id: 'OR7753',
  visitTime: '3019-04-09 13:01:00 PM',
  visitCode: 'I',
  visitName: '입원',
  deptCode: 'DOP',
  deptName: '췌담도외과',
  surgDate: '3019-04-10',
  surgVisitCode: 'I',
  surgVisitName: '입원',
  surgDeptCode: 'DOP',
  surgDeptName: '췌담도외과',
  dischargeTime: '3019-04-11 15:19:23 AM',
  birth: '29336',
  gender: 'M',
  height: '155',
  weight: '48.9',
  bmi: '20.4',
  surgOrder: '1',
  surgCode: 'Q7380002',
  surgName: 'Laparoscopic Cholecystectomy',
  specimen: 'Y',
  anesthesia: 'ENDO CIRCLE',
}

const pathologyData = {
  id: 'QQ78864',
  visitTime: '3019-04-09 15:01:00',
  deptCode: 'DOP',
  deptName: '췌담도외과',
  birth: '295212',
  gender: 'F',
  height: '155',
  weight: '48.9',
  bmi: '20.4',
  pathType: 'S',
  pathTypeName: '조직',
  prescCode: 'C5601001',
  prescName: '병리 염증,감염,비종양 절제(Level A)',
  pathFindings: 'Gallbladder, cholecystectomy: Chronic cholecystitis.',
  pathFindings2: '-',
  grossFindings: 'Received in formalin, specimen labelled as "***"...',
  grossFindings2: '-',
  receiveTime: '3019-04-10 1:03:53 PM',
  reportTime: '3019-04-16 10:45:17 AM',
}

export default function DataCatalogPage() {
  const [diagnosisVisibleColumns, setDiagnosisVisibleColumns] = useState<Set<string>>(
    new Set(diagnosisColumns.filter(col => col.default).map(col => col.key))
  )
  const [medicationVisibleColumns, setMedicationVisibleColumns] = useState<Set<string>>(
    new Set(medicationColumns.filter(col => col.default).map(col => col.key))
  )
  const [labVisibleColumns, setLabVisibleColumns] = useState<Set<string>>(
    new Set(labColumns.filter(col => col.default).map(col => col.key))
  )
  const [surgeryVisibleColumns, setSurgeryVisibleColumns] = useState<Set<string>>(
    new Set(surgeryColumns.filter(col => col.default).map(col => col.key))
  )
  const [pathologyVisibleColumns, setPathologyVisibleColumns] = useState<Set<string>>(
    new Set(pathologyColumns.filter(col => col.default).map(col => col.key))
  )

  const toggleColumn = (columnKey: string, visibleColumns: Set<string>, setVisibleColumns: (cols: Set<string>) => void) => {
    const newSet = new Set(visibleColumns)
    if (newSet.has(columnKey)) {
      newSet.delete(columnKey)
    } else {
      newSet.add(columnKey)
    }
    setVisibleColumns(newSet)
  }


  // Mock user data for navigation
  const user = { role: 'RESEARCHER' as const, name: '연구자' }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navigation userRole={user.role} userName={user.name} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            데이터 카탈로그
          </h1>
          <p className="text-xl text-gray-600">
            아주대학교병원 의료빅데이터센터에서 제공 가능한 데이터 목록 및 예시
          </p>
        </div>

        {/* 안내 메시지 */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            아래 데이터는 <strong>익명화된 예시 데이터</strong> 입니다.
            데이터 항목은 연구 목적에 따라 추가 또는 제외될 수 있습니다.
          </AlertDescription>
        </Alert>

        {/* 데이터 종류별 탭 */}
        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="diagnosis" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              진단
            </TabsTrigger>
            <TabsTrigger value="medication" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              약처방
            </TabsTrigger>
            <TabsTrigger value="lab" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              검사결과
            </TabsTrigger>
            <TabsTrigger value="surgery" className="flex items-center gap-2">
              <Scissors className="h-4 w-4" />
              수술
            </TabsTrigger>
            <TabsTrigger value="pathology" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              병리
            </TabsTrigger>
          </TabsList>

          {/* 진단 데이터 */}
          <TabsContent value="diagnosis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  진단 데이터
                </CardTitle>
                <CardDescription>
                  환자의 진단 이력 정보 (ICD-10 코드 기반)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">데이터 항목 (클릭하여 선택/해제)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {diagnosisColumns.map(col => (
                      <div 
                        key={col.key} 
                        className={`p-2 rounded cursor-pointer transition-colors hover:opacity-80 ${
                          diagnosisVisibleColumns.has(col.key) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => toggleColumn(col.key, diagnosisVisibleColumns, setDiagnosisVisibleColumns)}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">예시 데이터</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {diagnosisColumns.filter(col => diagnosisVisibleColumns.has(col.key)).map(col => (
                            <th key={col.key} className="px-3 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          {diagnosisColumns.filter(col => diagnosisVisibleColumns.has(col.key)).map(col => (
                            <td key={col.key} className={`px-3 py-2 ${col.key === 'id' || col.key === 'diagCode' ? 'font-mono' : ''}`}>
                              {diagnosisData[col.key as keyof typeof diagnosisData]}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 약처방 데이터 */}
          <TabsContent value="medication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  약처방 데이터
                </CardTitle>
                <CardDescription>
                  처방된 약물 정보 (ATC 코드 포함)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">데이터 항목 (클릭하여 선택/해제)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {medicationColumns.map(col => (
                      <div 
                        key={col.key} 
                        className={`p-2 rounded cursor-pointer transition-colors hover:opacity-80 ${
                          medicationVisibleColumns.has(col.key) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => toggleColumn(col.key, medicationVisibleColumns, setMedicationVisibleColumns)}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">예시 데이터</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {medicationColumns.filter(col => medicationVisibleColumns.has(col.key)).map(col => (
                            <th key={col.key} className="px-3 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          {medicationColumns.filter(col => medicationVisibleColumns.has(col.key)).map(col => (
                            <td key={col.key} className={`px-3 py-2 ${col.key === 'id' || col.key === 'atcCode' ? 'font-mono' : ''}`}>
                              {medicationData[col.key as keyof typeof medicationData]}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 검사결과 데이터 */}
          <TabsContent value="lab">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  검사결과 데이터
                </CardTitle>
                <CardDescription>
                  혈액검사, 소변검사 등 각종 검체 검사 결과
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">데이터 항목 (클릭하여 선택/해제)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {labColumns.map(col => (
                      <div 
                        key={col.key} 
                        className={`p-2 rounded cursor-pointer transition-colors hover:opacity-80 ${
                          labVisibleColumns.has(col.key) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => toggleColumn(col.key, labVisibleColumns, setLabVisibleColumns)}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">예시 데이터</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {labColumns.filter(col => labVisibleColumns.has(col.key)).map(col => (
                            <th key={col.key} className="px-3 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {labData.map((row, idx) => (
                          <tr key={idx}>
                            {labColumns.filter(col => labVisibleColumns.has(col.key)).map(col => (
                              <td key={col.key} className={`px-3 py-2 ${col.key === 'id' ? 'font-mono' : ''}`}>
                                {row[col.key as keyof typeof row]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 수술 데이터 */}
          <TabsContent value="surgery">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  수술 데이터
                </CardTitle>
                <CardDescription>
                  수술 이력 및 관련 정보
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">데이터 항목 (클릭하여 선택/해제)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {surgeryColumns.map(col => (
                      <div 
                        key={col.key} 
                        className={`p-2 rounded cursor-pointer transition-colors hover:opacity-80 ${
                          surgeryVisibleColumns.has(col.key) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => toggleColumn(col.key, surgeryVisibleColumns, setSurgeryVisibleColumns)}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">예시 데이터</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {surgeryColumns.filter(col => surgeryVisibleColumns.has(col.key)).map(col => (
                            <th key={col.key} className="px-3 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          {surgeryColumns.filter(col => surgeryVisibleColumns.has(col.key)).map(col => (
                            <td key={col.key} className={`px-3 py-2 ${col.key === 'id' ? 'font-mono' : ''}`}>
                              {surgeryData[col.key as keyof typeof surgeryData]}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 병리 데이터 */}
          <TabsContent value="pathology">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  병리 데이터
                </CardTitle>
                <CardDescription>
                  조직검사, 세포검사 등 병리 검사 결과
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">데이터 항목 (클릭하여 선택/해제)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {pathologyColumns.map(col => (
                      <div 
                        key={col.key} 
                        className={`p-2 rounded cursor-pointer transition-colors hover:opacity-80 ${
                          pathologyVisibleColumns.has(col.key) ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100 border-2 border-transparent'
                        }`}
                        onClick={() => toggleColumn(col.key, pathologyVisibleColumns, setPathologyVisibleColumns)}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">예시 데이터</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {pathologyColumns.filter(col => pathologyVisibleColumns.has(col.key)).map(col => (
                            <th key={col.key} className="px-3 py-2 text-left">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          {pathologyColumns.filter(col => pathologyVisibleColumns.has(col.key)).map(col => (
                            <td key={col.key} className={`px-3 py-2 ${col.key === 'id' ? 'font-mono' : ''}`}>
                              {pathologyData[col.key as keyof typeof pathologyData]}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 추가 정보 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>데이터 제공 범위</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>외래, 입원, 응급 모든 내원 구분 포함</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>전체 진료과 데이터 이용 가능</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>연구 목적에 따른 맞춤형 추출</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}