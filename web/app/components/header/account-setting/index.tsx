'use client'
import type { AccountSettingTab } from '@/app/components/header/account-setting/constants'
import {
  RiBrain2Fill,
  RiBrain2Line,
  RiCloseLine,
  RiColorFilterFill,
  RiColorFilterLine,
  RiGroup2Fill,
  RiGroup2Line,
  RiMoneyDollarCircleFill,
  RiMoneyDollarCircleLine,
} from '@remixicon/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '@/app/components/base/input'
import BillingPage from '@/app/components/billing/billing-page'
import CustomPage from '@/app/components/custom/custom-page'
import {
  ACCOUNT_SETTING_TAB,
} from '@/app/components/header/account-setting/constants'
import MenuDialog from '@/app/components/header/account-setting/menu-dialog'
import { useAppContext } from '@/context/app-context'
import { useProviderContext } from '@/context/provider-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { cn } from '@/utils/classnames'
import Button from '../../base/button'
import MembersPage from './members-page'
import ModelProviderPage from './model-provider-page'

const iconClassName = `
  w-5 h-5 mr-2 shrink-0
`

type IAccountSettingProps = {
  onCancel: () => void
  activeTab?: AccountSettingTab
  onTabChange?: (tab: AccountSettingTab) => void
}

type GroupItem = {
  key: AccountSettingTab
  name: string
  description?: string
  icon: React.JSX.Element
  activeIcon: React.JSX.Element
}

export default function AccountSetting({
  onCancel,
  activeTab = ACCOUNT_SETTING_TAB.MEMBERS,
  onTabChange,
}: IAccountSettingProps) {
  const [activeMenu, setActiveMenu] = useState<AccountSettingTab>(activeTab)
  useEffect(() => {
    setActiveMenu(activeTab)
  }, [activeTab])
  const { t } = useTranslation()
  const { enableBilling, enableReplaceWebAppLogo } = useProviderContext()
  const { isCurrentWorkspaceDatasetOperator } = useAppContext()

  const workplaceGroupItems: GroupItem[] = (() => {
    if (isCurrentWorkspaceDatasetOperator)
      return []

    const items: GroupItem[] = [
      {
        key: ACCOUNT_SETTING_TAB.PROVIDER,
        name: t('settings.provider', { ns: 'common' }),
        icon: <RiBrain2Line className={iconClassName} />,
        activeIcon: <RiBrain2Fill className={iconClassName} />,
      },
      {
        key: ACCOUNT_SETTING_TAB.MEMBERS,
        name: t('settings.members', { ns: 'common' }),
        icon: <RiGroup2Line className={iconClassName} />,
        activeIcon: <RiGroup2Fill className={iconClassName} />,
      },
    ]

    if (enableBilling) {
      items.push({
        key: ACCOUNT_SETTING_TAB.BILLING,
        name: t('settings.billing', { ns: 'common' }),
        description: t('plansCommon.receiptInfo', { ns: 'billing' }),
        icon: <RiMoneyDollarCircleLine className={iconClassName} />,
        activeIcon: <RiMoneyDollarCircleFill className={iconClassName} />,
      })
    }

    if (enableReplaceWebAppLogo || enableBilling) {
      items.push({
        key: ACCOUNT_SETTING_TAB.CUSTOM,
        name: t('custom', { ns: 'custom' }),
        icon: <RiColorFilterLine className={iconClassName} />,
        activeIcon: <RiColorFilterFill className={iconClassName} />,
      })
    }

    return items
  })()

  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile

  const menuItems = [
    {
      key: 'workspace-group',
      name: t('settings.workplaceGroup', { ns: 'common' }),
      items: workplaceGroupItems,
    },
  ]

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const targetElement = scrollRef.current
    const scrollHandle = (e: Event) => {
      const userScrolled = (e.target as HTMLDivElement).scrollTop > 0
      setScrolled(userScrolled)
    }
    targetElement?.addEventListener('scroll', scrollHandle)
    return () => {
      targetElement?.removeEventListener('scroll', scrollHandle)
    }
  }, [])

  const activeItem = menuItems[0].items.find(item => item.key === activeMenu)

  const [searchValue, setSearchValue] = useState<string>('')

  return (
    <MenuDialog
      show
      onClose={onCancel}
    >
      <div className="mx-auto flex h-[100vh] max-w-[1048px]">
        {/* ── Sidebar ── */}
        <aside className={cn(
          'flex flex-col border-r border-slate-200 dark:border-slate-800',
          'bg-white dark:bg-slate-900',
          isMobile ? 'w-[56px]' : 'w-[224px]',
        )}>
          {/* Logo / title */}
          <div className="px-6 pb-4 pt-6">
            {!isMobile && (
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('userProfile.settings', { ns: 'common' })}
              </h1>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {menuItems.map(menuItem => (
              <div key={menuItem.key} className="mb-4">
                {!isCurrentWorkspaceDatasetOperator && !isMobile && (
                  <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {menuItem.name}
                  </p>
                )}
                <div className="space-y-0.5">
                  {menuItem.items.map(item => {
                    const isActive = activeMenu === item.key
                    return (
                      <div
                        key={item.key}
                        title={item.name}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
                        )}
                        onClick={() => {
                          setActiveMenu(item.key)
                          onTabChange?.(item.key)
                        }}
                      >
                        <span className={cn(
                          isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-500',
                        )}>
                          {isActive ? item.activeIcon : item.icon}
                        </span>
                        {!isMobile && <span className="truncate">{item.name}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="relative flex flex-1 flex-col min-w-0">
          {/* Close button */}
          <div className="fixed right-6 top-6 z-[9999] flex flex-col items-center">
            <Button
              variant="tertiary"
              size="large"
              className="px-2"
              onClick={onCancel}
            >
              <RiCloseLine className="h-5 w-5" />
            </Button>
            <div className="mt-1 text-text-tertiary system-2xs-medium-uppercase">ESC</div>
          </div>

          {/* Scrollable body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
            {/* Sticky header */}
            <header className={cn(
              'sticky top-0 z-20 bg-white dark:bg-slate-900 px-8 py-4',
              'border-b border-slate-200 dark:border-slate-800',
              scrolled ? 'shadow-sm' : '',
            )}>
              <div className="flex items-center justify-between">
                <div>
                  {/* Breadcrumb */}
                  <nav className="mb-1 flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>{t('userProfile.settings', { ns: 'common' })}</span>
                    <span className="mx-1">›</span>
                    <span className="text-slate-900 dark:text-white">{activeItem?.name}</span>
                  </nav>
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {activeItem?.name}
                  </h2>
                  {activeItem?.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activeItem.description}</p>
                  )}
                </div>
                {activeItem?.key === 'provider' && (
                  <div className="ml-4">
                    <Input
                      showLeftIcon
                      wrapperClassName="!w-[200px]"
                      className="!h-9 !text-sm !border-slate-200 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-800"
                      onChange={e => setSearchValue(e.target.value)}
                      value={searchValue}
                    />
                  </div>
                )}
              </div>
            </header>

            {/* Page content */}
            <div className="px-8 py-8">
              {activeMenu === 'provider' && <ModelProviderPage searchText={searchValue} />}
              {activeMenu === 'members' && <MembersPage />}
              {activeMenu === 'billing' && <BillingPage />}
              {activeMenu === 'custom' && <CustomPage />}
            </div>

          </div>
        </div>
      </div>
    </MenuDialog>
  )
}
