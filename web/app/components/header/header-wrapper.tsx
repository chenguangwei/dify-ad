'use client'
import { usePathname } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import { cn } from '@/utils/classnames'
import s from './index.module.css'

type HeaderWrapperProps = {
  children: React.ReactNode
}

const HeaderWrapper = ({
  children,
}: HeaderWrapperProps) => {
  const pathname = usePathname()
  const isBordered = ['/apps', '/datasets/create', '/tools'].includes(pathname)
  // Check if the current path is a workflow canvas & fullscreen
  const inWorkflowCanvas = pathname.endsWith('/workflow')
  const isPipelineCanvas = pathname.endsWith('/pipeline')
  const workflowCanvasMaximize = localStorage.getItem('workflow-canvas-maximize') === 'true'
  const [hideHeader, setHideHeader] = useState(workflowCanvasMaximize)
  const { eventEmitter } = useEventEmitterContextContext()

  eventEmitter?.useSubscription((v: any) => {
    if (v?.type === 'workflow-canvas-maximize')
      setHideHeader(v.payload)
  })

  return (
    <div className={cn('bg-[#FFFFFF] dark:bg-[#1F2937] sticky left-0 right-0 top-0 z-[30] flex min-h-16 shrink-0 grow-0 basis-auto flex-col border-b border-[#E5E7EB] dark:border-[#374151]', s.header, hideHeader && (inWorkflowCanvas || isPipelineCanvas) && 'hidden')}>
      {children}
    </div>
  )
}
export default HeaderWrapper
