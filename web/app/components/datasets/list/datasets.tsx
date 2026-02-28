'use client'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Loading from '@/app/components/base/loading'
import { useDatasetList, useInvalidDatasetList } from '@/service/knowledge/use-dataset'
import DatasetCard from './dataset-card'

type Props = {
  tags: string[]
  keywords: string
  includeAll: boolean
}

const Datasets = ({
  tags,
  keywords,
  includeAll,
}: Props) => {
  const { t } = useTranslation()
  const {
    data: datasetList,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useDatasetList({
    initialPage: 1,
    tag_ids: tags,
    limit: 30,
    include_all: includeAll,
    keyword: keywords,
  })
  const invalidDatasetList = useInvalidDatasetList()
  const anchorRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  useEffect(() => {
    document.title = `${t('knowledge', { ns: 'dataset' })} - 兽牙`
  }, [t])

  useEffect(() => {
    if (anchorRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching)
          fetchNextPage()
      }, {
        rootMargin: '100px',
      })
      observerRef.current.observe(anchorRef.current)
    }
    return () => observerRef.current?.disconnect()
  }, [anchorRef, hasNextPage, isFetching, fetchNextPage])

  const allDatasets = datasetList?.pages.flatMap(({ data: datasets }) => datasets) ?? []

  return (
    <>
      <nav className="grid grow grid-cols-1 content-start gap-6 px-4 md:px-8 pb-8 pt-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allDatasets.map(dataset => (
          <DatasetCard key={dataset.id} dataset={dataset} onSuccess={invalidDatasetList} />
        ))}
        {isFetchingNextPage && <Loading />}
        <div ref={anchorRef} className="h-0" />
      </nav>
    </>
  )
}

export default Datasets
