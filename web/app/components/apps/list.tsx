'use client'

import type { FC } from 'react'
import {
  RiApps2Line,
  RiDragDropLine,
  RiSettingsLine,
  RiAddLine,
  RiOrganizationChart,
  RiMindMap,
  RiMentalHealthLine,
  RiRobot2Line,
  RiFileEditLine,
  RiSearchLine,
  RiArrowDownSLine,
} from '@remixicon/react'
import { useDebounceFn, useMount } from 'ahooks'
import dynamic from 'next/dynamic'
import {
  useRouter,
} from 'next/navigation'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import { createTag, fetchTagList } from '@/service/tag'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { useAppContext } from '@/context/app-context'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { CheckModal } from '@/hooks/use-pay'
import { useInfiniteAppList } from '@/service/use-apps'
import { AppModeEnum } from '@/types/app'
import { cn } from '@/utils/classnames'
import AppCard from './app-card'
import { AppCardSkeleton } from './app-card-skeleton'
import Empty from './empty'
import Footer from './footer'
import useAppsQueryState from './hooks/use-apps-query-state'
import { useDSLDragDrop } from './hooks/use-dsl-drag-drop'
import NewAppCard from './new-app-card'

// Define valid tabs at module scope to avoid re-creation on each render and stale closures
const validTabs = new Set<string | AppModeEnum>([
  'all',
  AppModeEnum.WORKFLOW,
  AppModeEnum.ADVANCED_CHAT,
  AppModeEnum.CHAT,
  AppModeEnum.AGENT_CHAT,
  AppModeEnum.COMPLETION,
])

// Default tags seeded on first load if they don't exist
const DEFAULT_APP_TAG_NAMES = ['知识问答', '数据分析', '智慧运维', '信息抽取', '智能审查']

const TagManagementModal = dynamic(() => import('@/app/components/base/tag-management'), {
  ssr: false,
})
const CreateFromDSLModal = dynamic(() => import('@/app/components/app/create-from-dsl-modal'), {
  ssr: false,
})

type Props = {
  controlRefreshList?: number
}
const List: FC<Props> = ({
  controlRefreshList = 0,
}) => {
  const { t } = useTranslation()
  const { systemFeatures } = useGlobalPublicStore()
  const router = useRouter()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator, isLoadingCurrentWorkspace } = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const tagList = useTagStore(s => s.tagList)
  const setTagList = useTagStore(s => s.setTagList)
  const appTags = tagList.filter(tag => tag.type === 'app')

  useMount(async () => {
    const tags = await fetchTagList('app')
    const existingNames = new Set(tags.map(t => t.name))
    const missing = DEFAULT_APP_TAG_NAMES.filter(name => !existingNames.has(name))
    if (missing.length > 0) {
      const created = await Promise.all(missing.map(name => createTag(name, 'app')))
      setTagList([...tags, ...created])
    }
    else {
      setTagList(tags)
    }
  })

  const [activeTab, setActiveTab] = useQueryState(
    'category',
    parseAsString.withDefault('all').withOptions({ history: 'push' }),
  )

  const { query: { tagIDs = [], keywords = '', isCreatedByMe: queryIsCreatedByMe = false }, setQuery } = useAppsQueryState()
  const [isCreatedByMe, setIsCreatedByMe] = useState(queryIsCreatedByMe)
  const [tagFilterValue, setTagFilterValue] = useState<string[]>(tagIDs)
  const [searchKeywords, setSearchKeywords] = useState(keywords)
  const newAppCardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showCreateFromDSLModal, setShowCreateFromDSLModal] = useState(false)
  const [droppedDSLFile, setDroppedDSLFile] = useState<File | undefined>()
  const setKeywords = useCallback((keywords: string) => {
    setQuery(prev => ({ ...prev, keywords }))
  }, [setQuery])
  const setTagIDs = useCallback((tagIDs: string[]) => {
    setQuery(prev => ({ ...prev, tagIDs }))
  }, [setQuery])

  const handleDSLFileDropped = useCallback((file: File) => {
    setDroppedDSLFile(file)
    setShowCreateFromDSLModal(true)
  }, [])

  const { dragging } = useDSLDragDrop({
    onDSLFileDropped: handleDSLFileDropped,
    containerRef,
    enabled: isCurrentWorkspaceEditor,
  })

  const appListQueryParams = {
    page: 1,
    limit: 30,
    name: searchKeywords,
    tag_ids: tagIDs,
    is_created_by_me: isCreatedByMe,
    ...(activeTab !== 'all' ? { mode: activeTab as AppModeEnum } : {}),
  }

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteAppList(appListQueryParams, { enabled: !isCurrentWorkspaceDatasetOperator })

  useEffect(() => {
    if (controlRefreshList > 0) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlRefreshList])

  const anchorRef = useRef<HTMLDivElement>(null)
  const options = [
    { value: 'all', text: t('types.all', { ns: 'app' }), icon: <RiApps2Line className="h-[14px] w-[14px]" /> },
    { value: AppModeEnum.WORKFLOW, text: t('types.workflow', { ns: 'app' }), icon: <RiOrganizationChart className="h-[14px] w-[14px]" /> },
    { value: AppModeEnum.ADVANCED_CHAT, text: t('types.advanced', { ns: 'app' }), icon: <RiMindMap className="h-[14px] w-[14px]" /> },
    { value: AppModeEnum.CHAT, text: t('types.chatbot', { ns: 'app' }), icon: <RiMentalHealthLine className="h-[14px] w-[14px]" /> },
    { value: AppModeEnum.AGENT_CHAT, text: t('types.agent', { ns: 'app' }), icon: <RiRobot2Line className="h-[14px] w-[14px]" /> },
    { value: AppModeEnum.COMPLETION, text: t('types.completion', { ns: 'app' }), icon: <RiFileEditLine className="h-[14px] w-[14px]" /> },
  ]

  const sectionedOptions = [
    {
      label: t('sectionLabels.businessOrchestration', { ns: 'app', defaultValue: '业务编排' }),
      items: [options[1], options[2]],
    },
    {
      label: t('sectionLabels.intelligentAssistant', { ns: 'app', defaultValue: '智能助理' }),
      items: [options[3], options[4], options[5]],
    },
  ]

  useEffect(() => {
    if (localStorage.getItem(NEED_REFRESH_APP_LIST_KEY) === '1') {
      localStorage.removeItem(NEED_REFRESH_APP_LIST_KEY)
      refetch()
    }
  }, [refetch])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return router.replace('/datasets')
  }, [router, isCurrentWorkspaceDatasetOperator])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return
    const hasMore = hasNextPage ?? true
    let observer: IntersectionObserver | undefined

    if (error) {
      if (observer)
        observer.disconnect()
      return
    }

    if (anchorRef.current && containerRef.current) {
      // Calculate dynamic rootMargin: clamps to 100-200px range, using 20% of container height as the base value for better responsiveness
      const containerHeight = containerRef.current.clientHeight
      const dynamicMargin = Math.max(100, Math.min(containerHeight * 0.2, 200)) // Clamps to 100-200px range, using 20% of container height as the base value

      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !isFetchingNextPage && !error && hasMore)
          fetchNextPage()
      }, {
        root: containerRef.current,
        rootMargin: `${dynamicMargin}px`,
        threshold: 0.1, // Trigger when 10% of the anchor element is visible
      })
      observer.observe(anchorRef.current)
    }
    return () => observer?.disconnect()
  }, [isLoading, isFetchingNextPage, fetchNextPage, error, hasNextPage, isCurrentWorkspaceDatasetOperator])

  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }

  const { run: handleTagsUpdate } = useDebounceFn(() => {
    setTagIDs(tagFilterValue)
  }, { wait: 500 })
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  const handleCreatedByMeChange = useCallback(() => {
    const newValue = !isCreatedByMe
    setIsCreatedByMe(newValue)
    setQuery(prev => ({ ...prev, isCreatedByMe: newValue }))
  }, [isCreatedByMe, setQuery])

  const pages = data?.pages ?? []
  const hasAnyApp = (pages[0]?.total ?? 0) > 0
  // Show skeleton during initial load or when refetching with no previous data
  const showSkeleton = isLoading || (isFetching && pages.length === 0)

  return (
    <>
      <div ref={containerRef} className="relative flex h-full shrink-0 grow flex-row overflow-hidden bg-[#F3F4F6] dark:bg-[#111827] text-[#111827] dark:text-[#F9FAFB] transition-colors duration-200 antialiased">

        {/* Left Sidebar for App Types Navigation */}
        <div className="flex w-56 shrink-0 flex-col border-r border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex-1 overflow-y-auto p-4">
            {/* 全部 */}
            <div className="mb-6">
              {(() => {
                const option = options[0]
                const isActive = activeTab === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setActiveTab(option.value as string)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-text-secondary hover:bg-state-base-hover hover:text-text-primary',
                    )}
                  >
                    <span className={cn(isActive ? 'text-primary-600' : 'text-text-tertiary')}>
                      {option.icon}
                    </span>
                    {option.text}
                  </button>
                )
              })()}
            </div>

            {/* 分组导航 */}
            {sectionedOptions.map(section => (
              <div key={section.label} className="mb-2">
                <div className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  {section.label}
                </div>
                {section.items.map((option) => {
                  const isActive = activeTab === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setActiveTab(option.value as string)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'font-medium text-primary-600 bg-primary-50'
                          : 'font-normal text-text-secondary hover:bg-state-base-hover hover:text-text-primary',
                      )}
                    >
                      <span className={cn(isActive ? 'text-primary-600' : 'text-text-tertiary')}>
                        {option.icon}
                      </span>
                      {option.text}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer: Settings */}
          <div className="border-t border-divider-subtle p-4">
            <button
              onClick={() => { }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-state-base-hover hover:text-text-primary"
            >
              <RiSettingsLine className="h-4 w-4 text-text-tertiary" />
              {t('operation.settings', { ns: 'common', defaultValue: '设置' })}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex h-full grow flex-col overflow-y-auto bg-transparent">
          {dragging && (
            <div className="absolute inset-0 z-50 m-0.5 rounded-2xl border-2 border-dashed border-components-dropzone-border-accent bg-[rgba(21,90,239,0.14)] p-2">
            </div>
          )}

          {/* Top Header & Actions */}
          <div className="px-4 md:px-8 pt-6 mb-8 mt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-2">探索企业级 AI 解决方案</h1>
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">体验为您的业务需求量身定制的精选应用案例。</p>
              </div>
              <div className="relative w-full md:w-96 flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative w-full">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] h-5 w-5" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-sm dark:placeholder-gray-500 text-[#111827] dark:text-[#F9FAFB]"
                    placeholder="搜索应用、工作流或工具..."
                    type="text"
                    value={keywords}
                    onChange={e => handleKeywordsChange(e.target.value)}
                  />
                </div>
                {(isCurrentWorkspaceEditor || isLoadingCurrentWorkspace) && (
                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (newAppCardRef.current) {
                          const btn = newAppCardRef.current.querySelector('button:nth-child(2)') as HTMLButtonElement
                          if (btn) btn.click()
                        }
                      }}
                      className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 h-[38px]"
                    >
                      <RiAddLine className="h-5 w-5" />
                      创建
                    </button>
                    <div className="hidden">
                      <NewAppCard
                        ref={newAppCardRef}
                        isLoading={isLoadingCurrentWorkspace}
                        onSuccess={refetch}
                        selectedAppType={activeTab}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-[#E5E7EB] dark:border-[#374151]">
              {/* 全部 pill */}
              <button
                onClick={() => setTagIDs([])}
                className={cn(
                  'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center',
                  tagIDs.length === 0
                    ? 'bg-[#2563EB] text-white shadow-sm hover:bg-blue-700'
                    : 'bg-[#FFFFFF] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]',
                )}
              >
                {t('types.all', { ns: 'app' })}
              </button>
              {/* Dynamic tag pills from tag management */}
              {appTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setTagIDs(tagIDs[0] === tag.id ? [] : [tag.id])}
                  className={cn(
                    'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center',
                    tagIDs[0] === tag.id
                      ? 'bg-[#2563EB] text-white shadow-sm hover:bg-blue-700'
                      : 'bg-[#FFFFFF] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]',
                  )}
                >
                  {tag.name}
                </button>
              ))}
              {appTags.length === 0 && (
                <span className="text-sm text-[#9CA3AF] dark:text-[#6B7280] pl-1">
                  {t('tag.noTag', { ns: 'common', defaultValue: '暂无标签，在应用卡片上添加标签后将显示在此处' })}
                </span>
              )}
            </div>
          </div>
          <div className={cn(
            'relative grid grow grid-cols-1 content-start gap-6 px-4 md:px-8 pb-8 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            !hasAnyApp && 'overflow-hidden',
          )}
          >
            {(() => {
              if (showSkeleton)
                return <AppCardSkeleton count={6} />

              if (hasAnyApp) {
                return pages.flatMap(({ data: apps }) => apps).map(app => (
                  <AppCard key={app.id} app={app} onRefresh={refetch} />
                ))
              }

              // No apps - show empty state
              return <Empty />
            })()}
            {isFetchingNextPage && (
              <AppCardSkeleton count={3} />
            )}
          </div>

          {isCurrentWorkspaceEditor && (
            <div
              className={`flex items-center justify-center gap-2 py-4 ${dragging ? 'text-text-accent' : 'text-text-quaternary'}`}
              role="region"
              aria-label={t('newApp.dropDSLToCreateApp', { ns: 'app' })}
            >
              <RiDragDropLine className="h-4 w-4" />
              <span className="system-xs-regular">{t('newApp.dropDSLToCreateApp', { ns: 'app' })}</span>
            </div>
          )}

          {/* Load More Module */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center pb-8">
              <button
                onClick={() => fetchNextPage()}
                className="bg-[#FFFFFF] dark:bg-[#1F2937] hover:bg-gray-50 dark:hover:bg-gray-800 border border-[#E5E7EB] dark:border-[#374151] text-[#111827] dark:text-[#F9FAFB] font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                加载更多应用
                <RiArrowDownSLine className="h-5 w-5" />
              </button>
            </div>
          )}

          {!systemFeatures.branding.enabled && (
            <Footer />
          )}
          <CheckModal />
          <div ref={anchorRef} className="h-0"> </div>
          {showTagManagementModal && (
            <TagManagementModal type="app" show={showTagManagementModal} />
          )}
        </div>
      </div >

      {showCreateFromDSLModal && (
        <CreateFromDSLModal
          show={showCreateFromDSLModal}
          onClose={() => {
            setShowCreateFromDSLModal(false)
            setDroppedDSLFile(undefined)
          }}
          onSuccess={() => {
            setShowCreateFromDSLModal(false)
            setDroppedDSLFile(undefined)
            refetch()
          }}
          droppedFile={droppedDSLFile}
        />
      )
      }
    </>
  )
}

export default List
