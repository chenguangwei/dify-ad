'use client'

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataSourceType } from '@/models/datasets'
import { cn } from '@/utils/classnames'
import s from '../index.module.css'

type DataSourceTypeSelectorProps = {
  currentType: DataSourceType
  disabled: boolean
  onChange: (type: DataSourceType) => void
  onClearPreviews: (type: DataSourceType) => void
}

type DataSourceLabelKey
  = | 'stepOne.dataSourceType.file'
    | 'stepOne.dataSourceType.notion'
    | 'stepOne.dataSourceType.web'

type DataSourceOption = {
  type: DataSourceType
  iconClass?: string
  labelKey: DataSourceLabelKey
}

const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    type: DataSourceType.FILE,
    labelKey: 'stepOne.dataSourceType.file',
  },
]

/**
 * Data source type selector component for choosing file source.
 */
function DataSourceTypeSelector({
  currentType,
  disabled,
  onChange,
  onClearPreviews,
}: DataSourceTypeSelectorProps) {
  const { t } = useTranslation()

  const handleTypeChange = useCallback((type: DataSourceType) => {
    if (disabled)
      return
    onChange(type)
    onClearPreviews(type)
  }, [disabled, onChange, onClearPreviews])

  const visibleOptions = useMemo(() => DATA_SOURCE_OPTIONS, [])

  return (
    <div className="mb-8 grid grid-cols-1 gap-4">
      {visibleOptions.map(option => (
        <div
          key={option.type}
          className={cn(
            s.dataSourceItem,
            'system-sm-medium',
            currentType === option.type && s.active,
            disabled && currentType !== option.type && s.disabled,
          )}
          onClick={() => handleTypeChange(option.type)}
        >
          <span className={cn(s.datasetIcon, option.iconClass)} />
          <span
            title={t(option.labelKey, { ns: 'datasetCreation' }) || undefined}
            className="truncate"
          >
            {t(option.labelKey, { ns: 'datasetCreation' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default DataSourceTypeSelector
