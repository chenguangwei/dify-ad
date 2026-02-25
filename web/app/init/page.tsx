import * as React from 'react'
import { cn } from '@/utils/classnames'
import InitPasswordPopup from './InitPasswordPopup'

const Install = () => {
  return (
    <div className={cn('flex min-h-screen w-full justify-center bg-[#f5f5f7] p-6')}>
      <div className={cn('flex w-full shrink-0 flex-col rounded-2xl bg-background-default-subtle shadow-2xl')}>
        <div className="m-auto block w-96">
          <InitPasswordPopup />
        </div>
      </div>
    </div>
  )
}

export default Install
