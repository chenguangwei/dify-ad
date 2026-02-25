'use client'
import Header from '@/app/signin/_header'

import { useGlobalPublicStore } from '@/context/global-public-context'
import useDocumentTitle from '@/hooks/use-document-title'
import { cn } from '@/utils/classnames'

export default function RegisterLayout({ children }: any) {
  const { systemFeatures } = useGlobalPublicStore()
  useDocumentTitle('')
  return (
    <>
      <div className={cn('flex min-h-screen w-full justify-center bg-[#f5f5f7] p-6')}>
        <div className={cn('flex w-full shrink-0 flex-col items-center rounded-2xl bg-background-default-subtle shadow-2xl')}>
          <Header />
          <div className={cn('flex w-full grow flex-col items-center justify-center px-6 md:px-[108px]')}>
            <div className="flex flex-col md:w-[400px]">
              {children}
            </div>
          </div>
          {systemFeatures.branding.enabled === false && (
            <div className="px-8 py-6 text-text-tertiary system-xs-regular">
              ©
              {' '}
              {new Date().getFullYear()}
              {' '}
              云知声智能科技股份有限公司 版权所有
            </div>
          )}
        </div>
      </div>
    </>
  )
}
