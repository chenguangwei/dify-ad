import type { useMarketplace } from './hooks'
import {
  RiArrowUpDoubleLine,
} from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import Loading from '@/app/components/base/loading'
import List from '@/app/components/plugins/marketplace/list'

type MarketplaceProps = {
  searchPluginText: string
  filterPluginTags: string[]
  isMarketplaceArrowVisible: boolean
  showMarketplacePanel: () => void
  marketplaceContext: ReturnType<typeof useMarketplace>
}
const Marketplace = ({
  isMarketplaceArrowVisible,
  showMarketplacePanel,
  marketplaceContext,
}: MarketplaceProps) => {
  const { t } = useTranslation()
  const {
    isLoading,
    marketplaceCollections,
    marketplaceCollectionPluginsMap,
    plugins,
    page,
  } = marketplaceContext

  return (
    <>
      <div className="sticky bottom-0 flex shrink-0 flex-col bg-background-default-subtle px-12 pb-[14px] pt-2">
        {isMarketplaceArrowVisible && (
          <RiArrowUpDoubleLine
            className="absolute left-1/2 top-2 z-10 h-4 w-4 -translate-x-1/2 cursor-pointer text-text-quaternary"
            onClick={showMarketplacePanel}
          />
        )}
      </div>
      <div className="mt-[-14px] shrink-0 grow bg-background-default-subtle px-12 pb-2">
        {
          isLoading && page === 1 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Loading />
            </div>
          )
        }
        {
          (!isLoading || page > 1) && (
            <List
              marketplaceCollections={marketplaceCollections || []}
              marketplaceCollectionPluginsMap={marketplaceCollectionPluginsMap || {}}
              plugins={plugins}
              showInstallButton
            />
          )
        }
      </div>
    </>
  )
}

export default Marketplace
