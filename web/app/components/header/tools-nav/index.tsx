'use client'

import {
  RiPuzzle2Fill,
  RiPuzzle2Line,
} from '@remixicon/react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/classnames'

type ToolsNavProps = {
  className?: string
}

const ToolsNav = ({
  className,
}: ToolsNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'tools'

  return (
    <Link
      href="/tools"
      className={cn(className, 'group', activated && 'bg-white dark:bg-[#374151] shadow-sm', activated ? 'text-[#2563EB] dark:text-white' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-white dark:hover:bg-[#374151]')}
    >
      {
        activated
          ? <RiPuzzle2Fill className="h-4 w-4" />
          : <RiPuzzle2Line className="h-4 w-4" />
      }
      <div className="ml-2 max-[1024px]:hidden">
        {t('menus.tools', { ns: 'common' })}
      </div>
    </Link>
  )
}

export default ToolsNav
