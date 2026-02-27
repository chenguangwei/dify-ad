'use client'

import {
  RiAddLine,
  RiApps2Line,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiChat3Line,
  RiCompass3Line,
  RiDatabase2Line,
  RiFileEditLine,
  RiHammerLine,
  RiMentalHealthLine,
  RiMindMap,
  RiOrganizationChart,
  RiRobot2Line,
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

const HIDDEN_ROUTES = ['/workflow', '/pipeline']

// ── Reusable leaf item ──────────────────────────────────────────────────
type ItemProps = {
  icon: React.ReactNode
  label: string
  href?: string
  isActive?: boolean
  onClick?: () => void
  onQuickCreate?: () => void
  /** visual depth: 0 = section header, 1 = group, 2 = leaf */
  depth?: 0 | 1 | 2
  className?: string
}

const Item = ({ icon, label, href, isActive, onClick, onQuickCreate, depth = 1, className }: ItemProps) => {
  const cls = cn(
    'group flex w-full items-center gap-2 rounded-md transition-colors duration-100',
    // depths
    depth === 0 && 'px-2 py-1.5 text-sm font-semibold',
    depth === 1 && 'px-2 py-1.5 pl-7 text-sm font-normal',
    depth === 2 && 'px-2 py-1.5 pl-10 text-[13px] font-normal',
    // colours
    isActive
      ? 'bg-state-accent-active text-text-accent'
      : 'text-text-secondary hover:bg-state-base-hover',
    className,
  )

  const inner = (
    <>
      <span className={cn('shrink-0', depth === 2 ? '[&>svg]:h-3.5 [&>svg]:w-3.5' : '[&>svg]:h-4 [&>svg]:w-4')}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {onQuickCreate && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickCreate() }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onQuickCreate() } }}
          className="hidden shrink-0 rounded p-0.5 text-text-quaternary hover:text-text-secondary group-hover:flex"
        >
          <RiAddLine className="h-3 w-3" />
        </span>
      )}
    </>
  )

  if (href) return <Link href={href} className={cls}>{inner}</Link>
  return <button onClick={onClick} className={cls}>{inner}</button>
}

// ── Collapsible group ───────────────────────────────────────────────────
type GroupProps = {
  icon: React.ReactNode
  label: string
  isActive?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
  depth?: 0 | 1 | 2
}

const Group = ({ icon, label, isActive, defaultOpen = false, children, depth = 0 }: GroupProps) => {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => { if (isActive) setOpen(true) }, [isActive])

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md transition-colors duration-100',
          depth === 0 && 'px-2 py-1.5 text-sm font-semibold',
          depth === 1 && 'px-2 py-1.5 pl-7 text-sm font-medium',
          depth === 2 && 'px-2 py-1.5 pl-10 text-[13px] font-medium',
          isActive ? 'text-text-accent' : 'text-text-secondary hover:bg-state-base-hover',
        )}
      >
        <span className={cn('shrink-0', depth === 2 ? '[&>svg]:h-3.5 [&>svg]:w-3.5' : '[&>svg]:h-4 [&>svg]:w-4')}>{icon}</span>
        <span className="flex-1 truncate text-left">{label}</span>
        {open
          ? <RiArrowDownSLine className="h-3 w-3 shrink-0 text-text-quaternary" />
          : <RiArrowRightSLine className="h-3 w-3 shrink-0 text-text-quaternary" />}
      </button>
      {open && <div className="mt-px">{children}</div>}
    </div>
  )
}

// ── Section label (tiny uppercase divider) ──────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 pb-1.5 pt-5 text-xs font-bold tracking-wide text-text-tertiary">
    {children}
  </div>
)

// ── Main sidebar ────────────────────────────────────────────────────────
const GlobalSidebar = () => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const [createMode, setCreateMode] = useState<AppModeEnum | null>(null)

  const activeCategory = searchParams.get('category') || 'all'
  const isHidden = HIDDEN_ROUTES.some(route => pathname.endsWith(route))

  const isOnAppPage = pathname.includes('/app/')
  const {
    data: appsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAppList({ page: 1, limit: 20, name: '', is_created_by_me: true }, { enabled: isCurrentWorkspaceEditor })

  const myApps = useMemo(() => {
    if (!appsData) return []
    return flatten((appsData.pages ?? []).map(p => p.data))
  }, [appsData])

  const getAppLink = useCallback((app: typeof myApps[number]) => {
    if (!isCurrentWorkspaceEditor) return `/app/${app.id}/overview`
    if (app.mode === AppModeEnum.WORKFLOW || app.mode === AppModeEnum.ADVANCED_CHAT) return `/app/${app.id}/workflow`
    return `/app/${app.id}/configuration`
  }, [isCurrentWorkspaceEditor])

  // Active states
  const isExploreActive = pathname.startsWith('/explore')
  const isAppsActive = pathname.startsWith('/apps') || isOnAppPage
  const isDatasetsActive = pathname.startsWith('/datasets')
  const isToolsActive = pathname.startsWith('/tools')

  const isWorkflowActive = isAppsActive && activeCategory === AppModeEnum.WORKFLOW
  const isAdvancedActive = isAppsActive && activeCategory === AppModeEnum.ADVANCED_CHAT
  const isChatActive = isAppsActive && activeCategory === AppModeEnum.CHAT
  const isAgentActive = isAppsActive && activeCategory === AppModeEnum.AGENT_CHAT
  const isCompletionActive = isAppsActive && activeCategory === AppModeEnum.COMPLETION

  if (isHidden) return null

  return (
    <div className="flex h-full w-52 shrink-0 flex-col border-r border-divider-subtle bg-background-default-subtle overflow-y-auto">
      <nav className="flex-1 space-y-px px-2 pb-2 pt-4">

        {/* ── 智能体广场 ── */}
        {!isCurrentWorkspaceDatasetOperator && (
          <div className="mb-1">
            <Item
              icon={<RiCompass3Line />}
              label={t('menus.explore', { ns: 'common' })}
              href="/explore/apps"
              isActive={isExploreActive}
              depth={0}
            />
          </div>
        )}

        {/* ── 我的智能体 ── */}
        {!isCurrentWorkspaceDatasetOperator && (
          <Group
            icon={<RiApps2Line />}
            label={t('menus.myAgents', { ns: 'common' })}
            isActive={isOnAppPage}
            defaultOpen={isOnAppPage}
            depth={0}
          >
            {myApps.map(app => (
              <Item
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
                depth={1}
              />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-1 pl-7 pr-2 text-[11px] text-text-quaternary hover:text-text-secondary transition-colors"
              >
                {isFetchingNextPage ? '加载中...' : '加载更多'}
              </button>
            )}
          </Group>
        )}

        {/* ── 分隔线 ── */}
        <SectionLabel>{t('menus.agentManage', { ns: 'common' })}</SectionLabel>

        {/* 流程与协作 */}
        {!isCurrentWorkspaceDatasetOperator && (
          <Group
            icon={<RiChat3Line />}
            label={t('menus.processAndCollaboration', { ns: 'common' })}
            isActive={isWorkflowActive || isAdvancedActive}
            defaultOpen={isWorkflowActive || isAdvancedActive}
            depth={0}
          >
            <Item
              icon={<RiOrganizationChart />}
              label={t('menus.businessOrchestration', { ns: 'common' })}
              href={`/apps?category=${AppModeEnum.WORKFLOW}`}
              isActive={isWorkflowActive}
              depth={1}
              onQuickCreate={() => setCreateMode(AppModeEnum.WORKFLOW)}
            />
            <Item
              icon={<RiMindMap />}
              label={t('menus.collaborationEngine', { ns: 'common' })}
              href={`/apps?category=${AppModeEnum.ADVANCED_CHAT}`}
              isActive={isAdvancedActive}
              depth={1}
              onQuickCreate={() => setCreateMode(AppModeEnum.ADVANCED_CHAT)}
            />
          </Group>
        )}

        {/* 智能助理 */}
        {!isCurrentWorkspaceDatasetOperator && (
          <Group
            icon={<RiRobot2Line />}
            label={t('menus.intelligentAssistant', { ns: 'common' })}
            isActive={isChatActive || isAgentActive || isCompletionActive}
            defaultOpen={isChatActive || isAgentActive || isCompletionActive}
            depth={0}
          >
            <Item
              icon={<RiMentalHealthLine />}
              label={t('menus.knowledgeAssistant', { ns: 'common' })}
              href={`/apps?category=${AppModeEnum.CHAT}`}
              isActive={isChatActive}
              depth={1}
              onQuickCreate={() => setCreateMode(AppModeEnum.CHAT)}
            />
            <Item
              icon={<RiRobot2Line />}
              label={t('menus.digitalEmployee', { ns: 'common' })}
              href={`/apps?category=${AppModeEnum.AGENT_CHAT}`}
              isActive={isAgentActive}
              depth={1}
              onQuickCreate={() => setCreateMode(AppModeEnum.AGENT_CHAT)}
            />
            <Item
              icon={<RiFileEditLine />}
              label={t('menus.intelligentWriting', { ns: 'common' })}
              href={`/apps?category=${AppModeEnum.COMPLETION}`}
              isActive={isCompletionActive}
              depth={1}
              onQuickCreate={() => setCreateMode(AppModeEnum.COMPLETION)}
            />
          </Group>
        )}

        {/* ── 分隔线 ── */}
        <SectionLabel>{t('menus.componentLib', { ns: 'common' })}</SectionLabel>

        {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && (
          <Item
            icon={<RiDatabase2Line />}
            label={t('menus.datasets', { ns: 'common' })}
            href="/datasets"
            isActive={isDatasetsActive}
            depth={0}
          />
        )}
        {!isCurrentWorkspaceDatasetOperator && (
          <Item
            icon={<RiHammerLine />}
            label={t('menus.tools', { ns: 'common' })}
            href="/tools"
            isActive={isToolsActive}
            depth={0}
          />
        )}
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
