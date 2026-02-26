import type { DataSet } from '@/models/datasets'
import * as React from 'react'
import { cn } from '@/utils/classnames'

type DescriptionProps = {
  dataset: DataSet
  name?: string
}

const Description = ({ dataset }: DescriptionProps) => (
  <>
    <h3
      className={cn('font-semibold text-base text-[#111827] dark:text-[#F9FAFB] mb-1.5 px-4 group-hover:text-[#2563EB] transition-colors truncate', !dataset.embedding_available && 'opacity-30')}
      title={dataset.name}
    >
      {dataset.name}
    </h3>
    <p
      className={cn('text-sm text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2 px-4 pb-2 flex-1', !dataset.embedding_available && 'opacity-30')}
      title={dataset.description}
    >
      {dataset.description || dataset.name}
    </p>
  </>
)

export default React.memo(Description)
