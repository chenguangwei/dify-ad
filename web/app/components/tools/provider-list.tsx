'use client'
import type { Collection } from './types'
import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  RiAddLine,
  RiSearchLine,
} from '@remixicon/react'
import Card from '@/app/components/plugins/card'
import CardMoreInfo from '@/app/components/plugins/card/card-more-info'
import { useTags } from '@/app/components/plugins/hooks'
import Empty from '@/app/components/plugins/marketplace/empty'
import PluginDetailPanel from '@/app/components/plugins/plugin-detail-panel'
import LabelFilter from '@/app/components/tools/labels/filter'
import CustomCreateCard from '@/app/components/tools/provider/custom-create-card'
import ProviderDetail from '@/app/components/tools/provider/detail'
import WorkflowToolEmpty from '@/app/components/tools/provider/empty'
import { useAppContext } from '@/context/app-context'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useCheckInstalled, useInvalidateInstalledPluginList } from '@/service/use-plugins'
import { useAllToolProviders } from '@/service/use-tools'
import { cn } from '@/utils/classnames'
import { ToolTypeEnum } from '../workflow/block-selector/types'
import Marketplace from './marketplace'
import { useMarketplace } from './marketplace/hooks'
import MCPList from './mcp'

const getToolType = (type: string) => {
  switch (type) {
    case 'builtin':
      return ToolTypeEnum.BuiltIn
    case 'api':
      return ToolTypeEnum.Custom
    case 'workflow':
      return ToolTypeEnum.Workflow
    case 'mcp':
      return ToolTypeEnum.MCP
    default:
      return ToolTypeEnum.BuiltIn
  }
}

const ProviderList = () => {
  const { t } = useTranslation()
  const { getTagLabel } = useTags()
  const { isCurrentWorkspaceManager } = useAppContext()
  const { enable_marketplace } = useGlobalPublicStore(s => s.systemFeatures)
  const containerRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useQueryState('category', {
    defaultValue: 'builtin',
  })
  const tabs = [
    { value: 'builtin', text: '内置组件' },
    { value: 'workflow', text: '工作流组件' },
    { value: 'mcp', text: 'MCP' },
  ]

  const [tagFilterValue, setTagFilterValue] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string>('')
  const [showCreateCustomTool, setShowCreateCustomTool] = useState(false)

  const { data: collectionList = [], refetch } = useAllToolProviders()
  const filteredCollectionList = useMemo(() => {
    return collectionList.filter((collection) => {
      if (collection.type !== activeTab)
        return false
      if (tagFilterValue.length > 0 && (!collection.labels || collection.labels.every(label => !tagFilterValue.includes(label))))
        return false
      if (keywords)
        return Object.values(collection.label).some(value => value.toLowerCase().includes(keywords.toLowerCase()))
      return true
    })
  }, [activeTab, tagFilterValue, keywords, collectionList])

  const [currentProviderId, setCurrentProviderId] = useState<string | undefined>()
  const currentProvider = useMemo<Collection | undefined>(() => {
    return filteredCollectionList.find(collection => collection.id === currentProviderId)
  }, [currentProviderId, filteredCollectionList])

  const { data: checkedInstalledData } = useCheckInstalled({
    pluginIds: currentProvider?.plugin_id ? [currentProvider.plugin_id] : [],
    enabled: !!currentProvider?.plugin_id,
  })
  const invalidateInstalledPluginList = useInvalidateInstalledPluginList()
  const currentPluginDetail = useMemo(() => {
    return checkedInstalledData?.plugins?.[0]
  }, [checkedInstalledData])

  const toolListTailRef = useRef<HTMLDivElement>(null)
  const showMarketplacePanel = useCallback(() => {
    containerRef.current?.scrollTo({
      top: toolListTailRef.current
        ? toolListTailRef.current?.offsetTop - 80
        : 0,
      behavior: 'smooth',
    })
  }, [toolListTailRef])

  const marketplaceContext = useMarketplace(keywords, tagFilterValue)
  const { handleScroll } = marketplaceContext

  const [isMarketplaceArrowVisible, setIsMarketplaceArrowVisible] = useState(true)
  const onContainerScroll = useMemo(() => {
    return (e: Event) => {
      handleScroll(e)
      if (containerRef.current && toolListTailRef.current)
        setIsMarketplaceArrowVisible(containerRef.current.scrollTop < (toolListTailRef.current?.offsetTop - 80))
    }
  }, [handleScroll, containerRef, toolListTailRef, setIsMarketplaceArrowVisible])

  useEffect(() => {
    const container = containerRef.current
    if (container)
      container.addEventListener('scroll', onContainerScroll)
    return () => {
      if (container)
        container.removeEventListener('scroll', onContainerScroll)
    }
  }, [onContainerScroll])

  return (
    <>
      <div className="relative flex h-0 shrink-0 grow overflow-hidden">
        <div
          ref={containerRef}
          className="relative flex grow flex-col overflow-y-auto bg-[#F3F4F6] dark:bg-[#111827] text-[#111827] dark:text-[#F9FAFB]"
        >
          {/* Page Header */}
          <div className={cn(
            'px-4 md:px-8 pt-6 mb-2',
            currentProviderId && 'pr-6',
          )}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-2">
                  {t('title', { ns: 'tools', defaultValue: '组件库' })}
                </h1>
                <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                  {t('toolDescription', { ns: 'tools', defaultValue: '管理内置组件、自定义组件和工作流组件。' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] h-4 w-4" />
                  <input
                    className="pl-9 pr-4 py-2 w-56 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-sm text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF]"
                    placeholder={t('search', { ns: 'common', defaultValue: '搜索组件...' })}
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                  />
                </div>
                {/* Tag filter */}
                {activeTab !== 'mcp' && (
                  <LabelFilter value={tagFilterValue} onChange={setTagFilterValue} />
                )}
                {/* Create custom component */}
                {isCurrentWorkspaceManager && (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 h-[38px] whitespace-nowrap"
                    onClick={() => setShowCreateCustomTool(true)}
                  >
                    <RiAddLine className="h-4 w-4" />
                    创建自定义组件
                  </button>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-[#E5E7EB] dark:border-[#374151] pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value)
                    if (tab.value !== activeTab)
                      setCurrentProviderId(undefined)
                  }}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors rounded-t-lg border-b-2 -mb-[1px]',
                    activeTab === tab.value
                      ? 'text-[#2563EB] border-[#2563EB] bg-white dark:bg-[#1F2937]'
                      : 'text-[#6B7280] dark:text-[#9CA3AF] border-transparent hover:text-[#111827] dark:hover:text-[#F9FAFB] hover:border-[#D1D5DB]',
                  )}
                >
                  {tab.text}
                </button>
              ))}
            </div>
          </div>

          {/* Card Grid */}
          {activeTab !== 'mcp' && (
            <div className={cn(
              'relative grid shrink-0 grid-cols-1 content-start gap-6 px-4 md:px-8 pb-8 pt-4',
              'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
              !filteredCollectionList.length && activeTab === 'workflow' && 'grow',
            )}
            >
              {filteredCollectionList.map(collection => (
                <div
                  key={collection.id}
                  onClick={() => setCurrentProviderId(collection.id)}
                >
                  <Card
                    className={cn(
                      'cursor-pointer !bg-[#FFFFFF] dark:!bg-[#1F2937] !border-[#E5E7EB] dark:!border-[#374151] !shadow-none',
                      'hover:!border-[#93C5FD] dark:hover:!border-[#1D4ED8] hover:!shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]',
                      'transition-all',
                      currentProviderId === collection.id && '!border-[#2563EB] dark:!border-[#2563EB]',
                    )}
                    hideCornerMark
                    payload={{
                      ...collection,
                      brief: collection.description,
                      org: collection.plugin_id ? collection.plugin_id.split('/')[0] : '',
                      name: collection.plugin_id ? collection.plugin_id.split('/')[1] : collection.name,
                    } as any}
                    footer={(
                      <CardMoreInfo
                        tags={collection.labels?.map(label => getTagLabel(label)) || []}
                      />
                    )}
                  />
                </div>
              ))}
              {!filteredCollectionList.length && activeTab === 'workflow' && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <WorkflowToolEmpty type={getToolType(activeTab)} />
                </div>
              )}
            </div>
          )}

          {!filteredCollectionList.length && activeTab === 'builtin' && (
            <Empty lightCard text={t('noTools', { ns: 'tools' })} className="h-[224px] shrink-0 px-4 md:px-8" />
          )}

          {/* Custom create modal - triggered from header button (card UI hidden, modal uses portal) */}
          <div className="hidden">
            <CustomCreateCard
              onRefreshData={refetch}
              externalOpen={showCreateCustomTool}
              onExternalOpenChange={setShowCreateCustomTool}
            />
          </div>

          <div ref={toolListTailRef} />

          {enable_marketplace && activeTab === 'builtin' && (
            <Marketplace
              searchPluginText={keywords}
              filterPluginTags={tagFilterValue}
              isMarketplaceArrowVisible={isMarketplaceArrowVisible}
              showMarketplacePanel={showMarketplacePanel}
              marketplaceContext={marketplaceContext}
            />
          )}

          {activeTab === 'mcp' && (
            <MCPList searchText={keywords} />
          )}
        </div>
      </div>

      {currentProvider && !currentProvider.plugin_id && (
        <ProviderDetail
          collection={currentProvider}
          onHide={() => setCurrentProviderId(undefined)}
          onRefreshData={refetch}
        />
      )}
      <PluginDetailPanel
        detail={currentPluginDetail}
        onUpdate={() => invalidateInstalledPluginList()}
        onHide={() => setCurrentProviderId(undefined)}
      />
    </>
  )
}

ProviderList.displayName = 'ToolProviderList'
export default ProviderList
