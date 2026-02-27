import { RiBookOpenLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'

const InfoPanel = () => {
  const { t } = useTranslation()

  return (
    <div className="flex w-[360px] flex-col items-start pb-2 pr-8 pt-[108px]">
      <div className="flex w-full min-w-[240px] flex-col items-start gap-3 self-stretch rounded-xl bg-background-section p-6">
        <div className="flex h-10 w-10 grow items-center justify-center gap-2 self-stretch rounded-lg border-[0.5px] border-components-card-border bg-components-card-bg p-1">
          <RiBookOpenLine className="h-5 w-5 text-text-accent" />
        </div>
        <p className="flex flex-col items-start gap-2 self-stretch">
          <span className="self-stretch text-text-secondary system-xl-semibold">
            {t('connectDatasetIntro.title', { ns: 'dataset' })}
          </span>
          <span className="text-text-tertiary system-sm-regular">
            {t('connectDatasetIntro.content.front', { ns: 'dataset' })}
            {t('connectDatasetIntro.content.end', { ns: 'dataset' })}
          </span>
        </p>
      </div>
    </div>
  )
}

export default InfoPanel
