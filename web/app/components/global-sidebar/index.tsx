'use client'

import {
  RiAddLine,
  RiApps2Line,
  RiBrain2Line,
  RiBrain2Fill,
  RiChat3Line,
  RiChat3Fill,
  RiCompass3Line,
  RiCompass3Fill,
  RiDatabase2Line,
  RiDatabase2Fill,
  RiFileEditLine,
  RiFileEditFill,
  RiHammerLine,
  RiHammerFill,
  RiHome5Line,
  RiHome5Fill,
  RiMentalHealthLine,
  RiMentalHealthFill,
  RiMindMap,
  RiOrganizationChart,
  RiPuzzle2Line,
  RiPuzzle2Fill,
  RiRobot2Line,
  RiRobot2Fill,
  RiArrowDownSLine,
  RiArrowRightSLine,
} from '@remixicon/react'
import { flatten } from 'es-toolkit/compat'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppIcon from '@/app/components/base/app-icon'
import CreateAppModal from '@/app/components/app/create-app-modal'
import { useAppContext } from '@/context/app-context'
import { useInfiniteAppList } from '@/service/use-apps'
import { AppModeEnum } from '@/types/app'
import { cn } from '@/utils/classnames'

// Routes where the sidebar should be hidden
const HIDDEN_ROUTES = ['/workflow', '/pipeline']

type SidebarItemProps = {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  label: string
  href?: string
  isActive?: boolean
  onClick?: () => void
  className?: string
  indent?: number
  onQuickCreate?: () => void
}

const SidebarItem = ({ icon, activeIcon, label, href, isActive, onClick, className, indent = 0, onQuickCreate }: SidebarItemProps) => {
  const baseClass = cn(
    'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
    indent === 1 && 'pl-5',
    indent === 2 && 'pl-7',
    indent === 3 && 'pl-9',
    isActive
      ? 'bg-primary-50 text-primary-600 font-medium dark:bg-blue-900/30 dark:text-blue-400'
      : 'text-text-secondary hover:bg-state-base-hover hover:text-text-primary font-normal',
    className,
  )

  const content = (
    <>
      <span className={cn('shrink-0', isActive ? 'text-primary-600 dark:text-blue-400' : 'text-text-tertiary')}>
        {isActive && activeIcon ? activeIcon : icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {onQuickCreate && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickCreate() }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onQuickCreate() } }}
          className="hidden shrink-0 rounded p-0.5 text-text-quaternary hover:bg-state-base-hover hover:text-text-secondary group-hover:flex"
        >
          <RiAddLine className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={baseClass}>
      {content}
    </button>
  )
}

type CollapsibleSectionProps = {
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  label: string
  isActive?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
  indent?: number
}

const CollapsibleSection = ({ icon, activeIcon, label, isActive, defaultOpen = false, children, indent = 0 }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (isActive)
      setOpen(true)
  }, [isActive])

  return (
    <div>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          indent === 1 && 'pl-5',
          indent === 2 && 'pl-7',
          isActive
            ? 'text-primary-600 font-medium dark:text-blue-400'
            : 'text-text-secondary hover:bg-state-base-hover hover:text-text-primary font-normal',
        )}
      >
        <span className={cn('shrink-0', isActive ? 'text-primary-600 dark:text-blue-400' : 'text-text-tertiary')}>
          {isActive && activeIcon ? activeIcon : icon}
        </span>
        <span className="flex-1 truncate text-left">{label}</span>
        {open
          ? <RiArrowDownSLine className="h-3.5 w-3.5 shrink-0 text-text-quaternary" />
          : <RiArrowRightSLine className="h-3.5 w-3.5 shrink-0 text-text-quaternary" />}
      </button>
      {open && (
        <div className="mt-0.5">
          {children}
        </div>
      )}
    </div>
  )
}

const GlobalSidebar = () => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const [createMode, setCreateMode] = useState<AppModeEnum | null>(null)

  const activeCategory = searchParams.get('category') || 'all'

  // Hide sidebar on workflow/pipeline canvas pages
  const isHidden = HIDDEN_ROUTES.some(route => pathname.endsWith(route))

  // Load user apps for "My Agents" section
  const isOnAppPage = pathname.includes('/app/')
  const {
    data: appsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAppList({
    page: 1,
    limit: 20,
    name: '',
    is_created_by_me: true,
  }, { enabled: isCurrentWorkspaceEditor })

  const myApps = useMemo(() => {
    if (!appsData) return []
    return flatten((appsData.pages ?? []).map(p => p.data))
  }, [appsData])

  const getAppLink = useCallback((app: typeof myApps[number]) => {
    if (!isCurrentWorkspaceEditor)
      return `/app/${app.id}/overview`
    if (app.mode === AppModeEnum.WORKFLOW || app.mode === AppModeEnum.ADVANCED_CHAT)
      return `/app/${app.id}/workflow`
    return `/app/${app.id}/configuration`
  }, [isCurrentWorkspaceEditor])

  // Active state checks
  const isExploreActive = pathname.startsWith('/explore')
  const isMyAgentActive = isOnAppPage
  const isAppsActive = pathname.startsWith('/apps') || isOnAppPage
  const isDatasetsActive = pathname.startsWith('/datasets')
  const isToolsActive = pathname.startsWith('/tools')

  const isWorkflowActive = isAppsActive && activeCategory === AppModeEnum.WORKFLOW
  const isAdvancedActive = isAppsActive && activeCategory === AppModeEnum.ADVANCED_CHAT
  const isChatActive = isAppsActive && activeCategory === AppModeEnum.CHAT
  const isAgentActive = isAppsActive && activeCategory === AppModeEnum.AGENT_CHAT
  const isCompletionActive = isAppsActive && activeCategory === AppModeEnum.COMPLETION

  const isAgentCenterActive = isExploreActive || isAppsActive
  const isComponentLibActive = isDatasetsActive || isToolsActive
  const isAgentManageActive = isAppsActive
  const isBusinessOrchActive = isWorkflowActive || isAdvancedActive
  const isIntelAssistActive = isChatActive || isAgentActive || isCompletionActive

  if (isHidden)
    return null

  return (
    <div className="flex h-full w-56 shrink-0 flex-col border-r border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] overflow-y-auto">
      <nav className="flex-1 p-2 space-y-0.5">

        {/* ── 智能体中心 ── */}
        <CollapsibleSection
          icon={<RiHome5Line className="h-4 w-4" />}
          activeIcon={<RiHome5Fill className="h-4 w-4" />}
          label={t('menus.agentCenter', { ns: 'common' })}
          isActive={isAgentCenterActive}
          defaultOpen={isAgentCenterActive || true}
        >
          {/* 智能体广场 */}
          {!isCurrentWorkspaceDatasetOperator && (
            <SidebarItem
              icon={<RiCompass3Line className="h-4 w-4" />}
              activeIcon={<RiCompass3Fill className="h-4 w-4" />}
              label={t('menus.explore', { ns: 'common' })}
              href="/explore/apps"
              isActive={isExploreActive}
              indent={1}
            />
          )}

          {/* 我的智能体 */}
          {!isCurrentWorkspaceDatasetOperator && (
            <CollapsibleSection
              icon={<RiApps2Line className="h-4 w-4" />}
              label={t('menus.myAgents', { ns: 'common' })}
              isActive={isMyAgentActive}
              defaultOpen={isMyAgentActive}
              indent={1}
            >
              {myApps.map(app => (
                <SidebarItem
                  key={app.id}
                  icon={
                    <div className="h-4 w-4 shrink-0 overflow-hidden rounded">
                      <AppIcon
                        size="tiny"
                        iconType={app.icon_type}
                        icon={app.icon}
                        background={app.icon_background}
                        imageUrl={app.icon_url}
                      />
                    </div>
                  }
                  label={app.name}
                  href={getAppLink(app)}
                  isActive={pathname.includes(`/app/${app.id}`)}
                  indent={2}
                />
              ))}
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-text-quaternary hover:text-text-secondary transition-colors"
                >
                  {isFetchingNextPage ? '加载中...' : '加载更多'}
                </button>
              )}
            </CollapsibleSection>
          )}

          {/* 智能体管理 */}
          {!isCurrentWorkspaceDatasetOperator && (
            <CollapsibleSection
              icon={<RiBrain2Line className="h-4 w-4" />}
              activeIcon={<RiBrain2Fill className="h-4 w-4" />}
              label={t('menus.agentManage', { ns: 'common' })}
              isActive={isAgentManageActive}
              defaultOpen={isAgentManageActive}
              indent={1}
            >
              {/* 流程与协作 */}
              <CollapsibleSection
                icon={<RiOrganizationChart className="h-4 w-4" />}
                label={t('menus.processAndCollaboration', { ns: 'common' })}
                isActive={isBusinessOrchActive}
                defaultOpen={isBusinessOrchActive}
                indent={2}
              >
                <SidebarItem
                  icon={<RiOrganizationChart className="h-4 w-4" />}
                  label={t('menus.businessOrchestration', { ns: 'common' })}
                  href={`/apps?category=${AppModeEnum.WORKFLOW}`}
                  isActive={isWorkflowActive}
                  indent={3}
                  onQuickCreate={() => setCreateMode(AppModeEnum.WORKFLOW)}
                />
                <SidebarItem
                  icon={<RiMindMap className="h-4 w-4" />}
                  label={t('menus.collaborationEngine', { ns: 'common' })}
                  href={`/apps?category=${AppModeEnum.ADVANCED_CHAT}`}
                  isActive={isAdvancedActive}
                  indent={3}
                  onQuickCreate={() => setCreateMode(AppModeEnum.ADVANCED_CHAT)}
                />
              </CollapsibleSection>

              {/* 智能助理 */}
              <CollapsibleSection
                icon={<RiChat3Line className="h-4 w-4" />}
                activeIcon={<RiChat3Fill className="h-4 w-4" />}
                label={t('menus.intelligentAssistant', { ns: 'common' })}
                isActive={isIntelAssistActive}
                defaultOpen={isIntelAssistActive}
                indent={2}
              >
                <SidebarItem
                  icon={<RiMentalHealthLine className="h-4 w-4" />}
                  activeIcon={<RiMentalHealthFill className="h-4 w-4" />}
                  label={t('menus.knowledgeAssistant', { ns: 'common' })}
                  href={`/apps?category=${AppModeEnum.CHAT}`}
                  isActive={isChatActive}
                  indent={3}
                  onQuickCreate={() => setCreateMode(AppModeEnum.CHAT)}
                />
                <SidebarItem
                  icon={<RiRobot2Line className="h-4 w-4" />}
                  activeIcon={<RiRobot2Fill className="h-4 w-4" />}
                  label={t('menus.digitalEmployee', { ns: 'common' })}
                  href={`/apps?category=${AppModeEnum.AGENT_CHAT}`}
                  isActive={isAgentActive}
                  indent={3}
                  onQuickCreate={() => setCreateMode(AppModeEnum.AGENT_CHAT)}
                />
                <SidebarItem
                  icon={<RiFileEditLine className="h-4 w-4" />}
                  activeIcon={<RiFileEditFill className="h-4 w-4" />}
                  label={t('menus.intelligentWriting', { ns: 'common' })}
                  href={`/apps?category=${AppModeEnum.COMPLETION}`}
                  isActive={isCompletionActive}
                  indent={3}
                  onQuickCreate={() => setCreateMode(AppModeEnum.COMPLETION)}
                />
              </CollapsibleSection>
            </CollapsibleSection>
          )}
        </CollapsibleSection>

        <div className="my-1 border-t border-divider-subtle" />

        {/* ── 组件库管理 ── */}
        <CollapsibleSection
          icon={<RiPuzzle2Line className="h-4 w-4" />}
          activeIcon={<RiPuzzle2Fill className="h-4 w-4" />}
          label={t('menus.componentLib', { ns: 'common' })}
          isActive={isComponentLibActive}
          defaultOpen={isComponentLibActive || true}
        >
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && (
            <SidebarItem
              icon={<RiDatabase2Line className="h-4 w-4" />}
              activeIcon={<RiDatabase2Fill className="h-4 w-4" />}
              label={t('menus.datasets', { ns: 'common' })}
              href="/datasets"
              isActive={isDatasetsActive}
              indent={1}
            />
          )}
          {!isCurrentWorkspaceDatasetOperator && (
            <SidebarItem
              icon={<RiHammerLine className="h-4 w-4" />}
              activeIcon={<RiHammerFill className="h-4 w-4" />}
              label={t('menus.tools', { ns: 'common' })}
              href="/tools"
              isActive={isToolsActive}
              indent={1}
            />
          )}
        </CollapsibleSection>
      </nav>
      {createMode !== null && (
        <CreateAppModal
          show={true}
          defaultAppMode={createMode}
          onClose={() => setCreateMode(null)}
          onSuccess={() => setCreateMode(null)}
        />
      )}
    </div>
  )
}

export default GlobalSidebar
