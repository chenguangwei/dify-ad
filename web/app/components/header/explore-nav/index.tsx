'use client'

import {
  RiCompass3Fill,
  RiCompass3Line,
} from '@remixicon/react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/classnames'

type ExploreNavProps = {
  className?: string
}

const ExploreNav = ({
  className,
}: ExploreNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'explore'

  return (
    <Link
      href="/explore/apps"
      className={cn(className, 'group', activated && 'bg-white dark:bg-[#374151] shadow-sm', activated ? 'text-[#2563EB] dark:text-white' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-white dark:hover:bg-[#374151]')}
    >
      {
        activated
          ? <RiCompass3Fill className="h-4 w-4" />
          : <RiCompass3Line className="h-4 w-4" />
      }
      <div className="ml-2 max-[1024px]:hidden">
        {t('menus.explore', { ns: 'common' })}
      </div>
    </Link>
  )
}

export default ExploreNav
