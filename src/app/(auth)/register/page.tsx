'use client'

import { Suspense } from 'react'
import RegisterForm from './register-form'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-black border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
