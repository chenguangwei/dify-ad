'use client'
import * as React from 'react'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { cn } from '@/utils/classnames'
import Header from '../signin/_header'
import ActivateForm from './activateForm'

const Activate = () => {
  const { systemFeatures } = useGlobalPublicStore()
  return (
    <div className={cn('flex min-h-screen w-full justify-center bg-[#f5f5f7] p-6')}>
      <div className={cn('flex w-full shrink-0 flex-col rounded-2xl bg-background-default-subtle shadow-2xl')}>
        <Header />
        <ActivateForm />
        {!systemFeatures.branding.enabled && (
          <div className="px-8 py-6 text-sm font-normal text-text-tertiary">
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            云知声智能科技股份有限公司 版权所有
          </div>
        )}
      </div>
    </div>
  )
}

export default Activate
