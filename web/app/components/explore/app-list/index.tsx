'use client'

import type { CreateAppModalProps } from '@/app/components/explore/create-app-modal'
import type { App } from '@/models/explore'
import {
  RiApps2Line,
  RiOrganizationChart,
  RiMindMap,
  RiMentalHealthLine,
  RiRobot2Line,
  RiFileEditLine,
  RiSearchLine,
  RiAddLine,
} from '@remixicon/react'
import { useDebounceFn } from 'ahooks'
import { useQueryState } from 'nuqs'
import * as React from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContext, useContextSelector } from 'use-context-selector'
import DSLConfirmModal from '@/app/components/app/create-from-dsl-modal/dsl-confirm-modal'
import Button from '@/app/components/base/button'
import Loading from '@/app/components/base/loading'
import AppCard from '@/app/components/explore/app-card'
import Banner from '@/app/components/explore/banner/banner'
import CreateAppModal from '@/app/components/explore/create-app-modal'
import ExploreContext from '@/context/explore-context'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useImportDSL } from '@/hooks/use-import-dsl'
import { AppModeEnum } from '@/types/app'
import {
  DSLImportMode,
} from '@/models/app'
import { fetchAppDetail } from '@/service/explore'
import { useExploreAppList } from '@/service/use-explore'
import { cn } from '@/utils/classnames'
import TryApp from '../try-app'
import s from './style.module.css'

type AppsProps = {
  onSuccess?: () => void
}

const Apps = ({
  onSuccess,
}: AppsProps) => {
  const { t } = useTranslation()
  const { systemFeatures } = useGlobalPublicStore()
  const { hasEditPermission } = useContext(ExploreContext)
  const allCategoriesEn = t('apps.allCategories', { ns: 'explore', lng: 'en' })

  const [keywords, setKeywords] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')

  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })

  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }

  const [currCategory, setCurrCategory] = useQueryState('category', {
    defaultValue: allCategoriesEn,
  })

  const {
    data,
    isLoading,
    isError,
  } = useExploreAppList()

  const filteredList = useMemo(() => {
    if (!data)
      return []
    return data.allList.filter(item => currCategory === allCategoriesEn || item.category === currCategory)
  }, [data, currCategory, allCategoriesEn])

  const searchFilteredList = useMemo(() => {
    if (!searchKeywords || !filteredList || filteredList.length === 0)
      return filteredList

    const lowerCaseSearchKeywords = searchKeywords.toLowerCase()

    return filteredList.filter(item =>
      item.app && item.app.name && item.app.name.toLowerCase().includes(lowerCaseSearchKeywords),
    )
  }, [searchKeywords, filteredList])

  const [currApp, setCurrApp] = React.useState<App | null>(null)
  const [isShowCreateModal, setIsShowCreateModal] = React.useState(false)

  const {
    handleImportDSL,
    handleImportDSLConfirm,
    versions,
    isFetching,
  } = useImportDSL()
  const [showDSLConfirmModal, setShowDSLConfirmModal] = useState(false)

  const isShowTryAppPanel = useContextSelector(ExploreContext, ctx => ctx.isShowTryAppPanel)
  const setShowTryAppPanel = useContextSelector(ExploreContext, ctx => ctx.setShowTryAppPanel)
  const hideTryAppPanel = useCallback(() => {
    setShowTryAppPanel(false)
  }, [setShowTryAppPanel])
  const appParams = useContextSelector(ExploreContext, ctx => ctx.currentApp)
  const handleShowFromTryApp = useCallback(() => {
    setCurrApp(appParams?.app || null)
    setIsShowCreateModal(true)
  }, [appParams?.app])

  const onCreate: CreateAppModalProps['onConfirm'] = async ({
    name,
    icon_type,
    icon,
    icon_background,
    description,
  }) => {
    hideTryAppPanel()

    const { export_data } = await fetchAppDetail(
      currApp?.app.id as string,
    )
    const payload = {
      mode: DSLImportMode.YAML_CONTENT,
      yaml_content: export_data,
      name,
      icon_type,
      icon,
      icon_background,
      description,
    }
    await handleImportDSL(payload, {
      onSuccess: () => {
        setIsShowCreateModal(false)
      },
      onPending: () => {
        setShowDSLConfirmModal(true)
      },
    })
  }

  const onConfirmDSL = useCallback(async () => {
    await handleImportDSLConfirm({
      onSuccess,
    })
  }, [handleImportDSLConfirm, onSuccess])

  if (isLoading) {
    return (
      <div className="flex h-full items-center">
        <Loading type="area" />
      </div>
    )
  }

  if (isError || !data)
    return null

  const { categories } = data

  // Options for sidebar
  const options = [
    { value: allCategoriesEn, text: t('types.all', { ns: 'app' }), icon: <RiApps2Line className="h-[14px] w-[14px]" /> },
    { value: 'Workflow', text: t('types.workflow', { ns: 'app' }), icon: <RiOrganizationChart className="h-[14px] w-[14px]" /> },
    { value: 'advanced', text: t('types.advanced', { ns: 'app' }), icon: <RiMindMap className="h-[14px] w-[14px]" /> },
    { value: 'chat', text: t('types.chatbot', { ns: 'app' }), icon: <RiMentalHealthLine className="h-[14px] w-[14px]" /> },
    { value: 'agent', text: t('types.agent', { ns: 'app' }), icon: <RiRobot2Line className="h-[14px] w-[14px]" /> },
    { value: 'completion', text: t('types.completion', { ns: 'app' }), icon: <RiFileEditLine className="h-[14px] w-[14px]" /> },
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

  return (
    <div className={cn(
      'flex h-full min-h-0 flex-col overflow-hidden',
    )}
    >
      {systemFeatures.enable_explore_banner && (
        <div className="mt-4 px-8">
          <Banner />
        </div>
      )}

      {/* Header Section */}
      <div className="px-8 pt-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-2">{t('apps.title', { ns: 'explore' })}</h1>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]">体验为您的业务需求量身定制的精选应用案例。</p>
          </div>
          <div className="relative w-full md:w-96 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] h-5 w-5" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-sm dark:placeholder-gray-500 text-[#111827] dark:text-[#F9FAFB]"
                placeholder="搜索应用..."
                type="text"
                value={keywords}
                onChange={e => handleKeywordsChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-[#E5E7EB] dark:border-[#374151]">
          {options.map((option) => {
            const isActive = currCategory === option.value
            return (
              <button
                key={option.value}
                onClick={() => setCurrCategory(option.value)}
                className={cn(
                  'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm hover:bg-blue-700'
                    : 'bg-[#FFFFFF] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]',
                )}
              >
                <span className={cn(isActive ? 'text-white' : 'text-text-tertiary')}>
                  {option.icon}
                </span>
                {option.text}
              </button>
            )
          })}
        </div>
      </div>

      {/* App Grid */}
      <div className={cn(
        'relative flex flex-1 shrink-0 grow flex-col px-8 pb-6',
      )}
      >
        <nav
          className={cn(
            s.appList,
            'grid shrink-0 content-start gap-4',
          )}
        >
          {searchFilteredList.map(app => (
            <AppCard
              key={app.app_id}
              isExplore
              app={app}
              canCreate={hasEditPermission}
              onCreate={() => {
                setCurrApp(app)
                setIsShowCreateModal(true)
              }}
            />
          ))}
        </nav>
      </div>

      {isShowCreateModal && (
        <CreateAppModal
          appIconType={currApp?.app.icon_type || 'emoji'}
          appIcon={currApp?.app.icon || ''}
          appIconBackground={currApp?.app.icon_background || ''}
          appIconUrl={currApp?.app.icon_url}
          appName={currApp?.app.name || ''}
          appDescription={currApp?.app.description || ''}
          show={isShowCreateModal}
          onConfirm={onCreate}
          confirmDisabled={isFetching}
          onHide={() => setIsShowCreateModal(false)}
        />
      )}
      {
        showDSLConfirmModal && (
          <DSLConfirmModal
            versions={versions}
            onCancel={() => setShowDSLConfirmModal(false)}
            onConfirm={onConfirmDSL}
            confirmDisabled={isFetching}
          />
        )
      }

      {isShowTryAppPanel && (
        <TryApp
          appId={appParams?.appId || ''}
          app={appParams?.app}
          category={appParams?.app?.category}
          onClose={hideTryAppPanel}
          onCreate={handleShowFromTryApp}
        />
      )}
    </div>
  )
}

export default React.memo(Apps)
