'use client'

import type { INavSelectorProps } from './nav-selector'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { useStore as useAppStore } from '@/app/components/app/store'
import { ArrowNarrowLeft } from '@/app/components/base/icons/src/vender/line/arrows'
import { cn } from '@/utils/classnames'
import NavSelector from './nav-selector'

type INavProps = {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  text: string
  activeSegment: string | string[]
  link: string
  isApp: boolean
} & INavSelectorProps

const Nav = ({
  icon,
  activeIcon,
  text,
  activeSegment,
  link,
  curNav,
  navigationItems,
  createText,
  onCreate,
  onLoadMore,
  isLoadingMore,
  isApp,
}: INavProps) => {
  const setAppDetail = useAppStore(state => state.setAppDetail)
  const [hovered, setHovered] = useState(false)
  const segment = useSelectedLayoutSegment()
  const isActivated = Array.isArray(activeSegment) ? activeSegment.includes(segment!) : segment === activeSegment

  return (
    <div className={`
      flex h-8 max-w-[670px] shrink-0 items-center rounded-md px-0.5 text-sm font-medium max-[1024px]:max-w-[400px]
      ${isActivated && 'bg-white dark:bg-[#374151] shadow-sm'}
      ${!curNav && !isActivated && 'hover:bg-white dark:hover:bg-[#374151]'}
    `}
    >
      <Link href={link}>
        <div
          onClick={(e) => {
            // Don't clear state if opening in new tab/window
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
              return
            setAppDetail()
          }}
          className={cn('flex h-7 cursor-pointer items-center rounded-[10px] px-2.5', isActivated ? 'text-[#2563EB] dark:text-white' : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white', curNav && isActivated && 'hover:bg-white/50 dark:hover:bg-[#374151]')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div>
            {
              (hovered && curNav)
                ? <ArrowNarrowLeft className="h-4 w-4" />
                : isActivated
                  ? activeIcon
                  : icon
            }
          </div>
          <div className="ml-2 max-[1024px]:hidden">
            {text}
          </div>
        </div>
      </Link>
      {
        curNav && isActivated && (
          <>
            <div className="font-light text-divider-deep">/</div>
            <NavSelector
              isApp={isApp}
              curNav={curNav}
              navigationItems={navigationItems}
              createText={createText}
              onCreate={onCreate}
              onLoadMore={onLoadMore}
              isLoadingMore={isLoadingMore}
            />
          </>
        )
      }
    </div>
  )
}

export default Nav
