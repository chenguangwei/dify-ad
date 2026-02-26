import type { DataSet } from '@/models/datasets'
import * as React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import AppIcon from '@/app/components/base/app-icon'
import { useKnowledge } from '@/hooks/use-knowledge'
import { DOC_FORM_TEXT } from '@/models/datasets'
import { cn } from '@/utils/classnames'

const EXTERNAL_PROVIDER = 'external'

type DatasetCardHeaderProps = {
  dataset: DataSet
}

const DatasetCardHeader = ({ dataset }: DatasetCardHeaderProps) => {
  const { t } = useTranslation()
  const { formatIndexingTechniqueAndMethod } = useKnowledge()

  const isExternalProvider = dataset.provider === EXTERNAL_PROVIDER

  const badgeText = useMemo(() => {
    if (isExternalProvider)
      return t('externalKnowledgeBase', { ns: 'dataset', defaultValue: '外部知识库' })
    if (dataset.doc_form)
      return t(`chunkingMode.${DOC_FORM_TEXT[dataset.doc_form]}`, { ns: 'dataset' })
    return null
  }, [isExternalProvider, dataset.doc_form, t])

  const iconInfo = useMemo(() => dataset.icon_info || {
    icon: '📙',
    icon_type: 'emoji' as const,
    icon_background: '#FFF4ED',
    icon_url: '',
  }, [dataset.icon_info])

  return (
    <div className={cn('flex items-start justify-between px-4 pt-4 pb-3', !dataset.embedding_available && 'opacity-30')}>
      <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg">
        <AppIcon
          size="tiny"
          iconType={iconInfo.icon_type}
          icon={iconInfo.icon}
          background={iconInfo.icon_type === 'image' ? undefined : iconInfo.icon_background}
          imageUrl={iconInfo.icon_type === 'image' ? iconInfo.icon_url : undefined}
          className="h-6 w-6"
        />
      </div>
      {badgeText && (
        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 uppercase">
          {badgeText}
        </span>
      )}
    </div>
  )
}

export default React.memo(DatasetCardHeader)
