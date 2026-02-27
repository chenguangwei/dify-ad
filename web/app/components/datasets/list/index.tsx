'use client'

import { useBoolean, useDebounceFn } from 'ahooks'
import { useRouter } from 'next/navigation'
// Libraries
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  RiAddLine,
  RiFileTextLine,
  RiGlobalLine,
  RiSearchLine,
  RiFileZipLine,
  RiFilePaperLine,
} from '@remixicon/react'
import TagManagementModal from '@/app/components/base/tag-management'
import TagFilter from '@/app/components/base/tag-management/filter'
// Hooks
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import CheckboxWithLabel from '@/app/components/datasets/create/website/base/checkbox-with-label'
import { useAppContext, useSelector as useAppContextSelector } from '@/context/app-context'
import { useExternalApiPanel } from '@/context/external-api-panel-context'
import useDocumentTitle from '@/hooks/use-document-title'
import { useDatasetApiBaseUrl } from '@/service/knowledge/use-dataset'
// Components
import ExternalAPIPanel from '../external-api/external-api-panel'
import ServiceApi from '../extra-info/service-api'
import Datasets from './datasets'

const List = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { currentWorkspace, isCurrentWorkspaceOwner } = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const { showExternalApiPanel, setShowExternalApiPanel } = useExternalApiPanel()
  const [includeAll, { toggle: toggleIncludeAll }] = useBoolean(false)
  useDocumentTitle(t('knowledge', { ns: 'dataset' }))

  const [keywords, setKeywords] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
  const { run: handleSearch } = useDebounceFn(() => {
    setSearchKeywords(keywords)
  }, { wait: 500 })
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }
  const [tagFilterValue, setTagFilterValue] = useState<string[]>([])
  const [tagIDs, setTagIDs] = useState<string[]>([])
  const { run: handleTagsUpdate } = useDebounceFn(() => {
    setTagIDs(tagFilterValue)
  }, { wait: 500 })
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  useEffect(() => {
    if (currentWorkspace.role === 'normal')
      return router.replace('/apps')
  }, [currentWorkspace, router])

  const isCurrentWorkspaceManager = useAppContextSelector(state => state.isCurrentWorkspaceManager)
  const { data: apiBaseInfo } = useDatasetApiBaseUrl()

  return (
    <div className="relative flex h-full shrink-0 grow flex-col overflow-hidden bg-[#F3F4F6] dark:bg-[#111827] text-[#111827] dark:text-[#F9FAFB] transition-colors duration-200 antialiased">

      {/* Main Content */}
      <div className="relative flex h-full grow flex-col overflow-y-auto bg-transparent">

        {/* Top Header */}
        <div className="px-4 md:px-8 pt-6 mb-6 mt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F9FAFB] mb-2">
                {t('knowledge', { ns: 'dataset', defaultValue: '知识库' })}
              </h1>
              <p className="text-[#6B7280] dark:text-[#9CA3AF]">
                {t('createDatasetIntro', { ns: 'dataset', defaultValue: '管理您的企业知识源和向量嵌入。' })}
              </p>
            </div>
            <div className="relative w-full md:w-96 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative w-full">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] h-5 w-5" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent shadow-sm dark:placeholder-gray-500 text-[#111827] dark:text-[#F9FAFB]"
                  placeholder={t('search', { ns: 'common', defaultValue: '搜索知识库...' })}
                  type="text"
                  value={keywords}
                  onChange={e => handleKeywordsChange(e.target.value)}
                />
              </div>
              {isCurrentWorkspaceManager && (
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/datasets/create')}
                    className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 h-[38px]"
                  >
                    <RiAddLine className="h-5 w-5" />
                    {t('createDataset', { ns: 'dataset', defaultValue: '创建知识库' })}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB] dark:border-[#374151] overflow-x-auto no-scrollbar">
            <TagFilter type="knowledge" value={tagFilterValue} onChange={handleTagsChange} />
            {isCurrentWorkspaceOwner && (
              <CheckboxWithLabel
                isChecked={includeAll}
                onChange={toggleIncludeAll}
                label={t('allKnowledge', { ns: 'dataset' })}
                labelClassName="system-md-regular text-text-secondary"
                tooltip={t('allKnowledgeDescription', { ns: 'dataset' }) as string}
              />
            )}
            {isCurrentWorkspaceManager && (
              <ServiceApi apiBaseUrl={apiBaseInfo?.api_base_url ?? ''} />
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => router.push('/datasets/create')}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                <RiFileTextLine className="h-4 w-4" />
                {t('chunkingMode.general', { ns: 'dataset', defaultValue: '从文档创建' })}
              </button>
              <button
                onClick={() => setShowExternalApiPanel(true)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                <RiGlobalLine className="h-4 w-4" />
                {t('connectDataset', { ns: 'dataset', defaultValue: '连接数据源' })}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 md:px-8 mb-6">
          <div className="bg-white dark:bg-[#1F2937] rounded-xl border border-[#E5E7EB] dark:border-[#374151] p-6">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">快速操作</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blank Knowledge Base */}
              <button
                onClick={() => router.push('/datasets/create')}
                className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#E5E7EB] dark:hover:border-[#374151] transition text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <RiFilePaperLine className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">空白知识库</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">从零开始创建</div>
                </div>
              </button>

              {/* From Document */}
              <button
                onClick={() => router.push('/datasets/create')}
                className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-[#E5E7EB] dark:hover:border-[#374151] transition text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <RiFileZipLine className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">从文档创建</div>
                  <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">支持 PDF, Word, CSV, MD</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Dataset Grid */}
        <Datasets tags={tagIDs} keywords={searchKeywords} includeAll={includeAll} />

        {showTagManagementModal && (
          <TagManagementModal type="knowledge" show={showTagManagementModal} />
        )}
        {showExternalApiPanel && <ExternalAPIPanel onClose={() => setShowExternalApiPanel(false)} />}
      </div>
    </div>
  )
}

export default List
