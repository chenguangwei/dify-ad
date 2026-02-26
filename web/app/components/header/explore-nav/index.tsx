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
      className={cn(className, 'group', activated && 'bg-components-main-nav-nav-button-bg-active shadow-md', activated ? 'text-components-main-nav-nav-button-text-active' : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover')}
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
