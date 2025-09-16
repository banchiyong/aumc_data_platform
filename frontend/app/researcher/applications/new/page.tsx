import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MultiStepApplicationForm from './MultiStepApplicationForm'
import { api } from '@/lib/api'

export default async function NewApplicationPage() {
  // 사용자 정보 가져오기
  const userData = await api.auth.me()
  
  if (!userData.data) {
    redirect('/login')
  }
  
  return <MultiStepApplicationForm userData={userData.data} />
}