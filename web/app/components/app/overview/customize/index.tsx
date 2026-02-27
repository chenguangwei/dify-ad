'use client'
import type { FC } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/app/components/base/button'
import Modal from '@/app/components/base/modal'
import Tag from '@/app/components/base/tag'

type IShareLinkProps = {
  isShow: boolean
  onClose: () => void
  api_base_url: string
  appId: string
  mode: string
}

const StepNum: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-util-colors-blue-blue-50 text-text-accent">
    {children}
  </div>
)

const prefixCustomize = 'overview.appInfo.customize'

const CustomizeModal: FC<IShareLinkProps> = ({
  isShow,
  onClose,
  appId,
  api_base_url,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title={t(`${prefixCustomize}.title`, { ns: 'appOverview' })}
      description={t(`${prefixCustomize}.explanation`, { ns: 'appOverview' })}
      isShow={isShow}
      onClose={onClose}
      className="w-[640px] !max-w-2xl"
      closable={true}
    >
      <div className="mt-4 w-full rounded-lg border-[0.5px] border-components-panel-border px-6 py-5">
        <Tag bordered={true} hideBg={true} className="border-text-accent-secondary uppercase text-text-accent-secondary">
          {t(`${prefixCustomize}.way`, { ns: 'appOverview' })}
          {' '}
          1
        </Tag>
        <p className="my-2 text-text-secondary system-sm-medium">{t(`${prefixCustomize}.way1.name`, { ns: 'appOverview' })}</p>
        <div className="flex py-4">
          <StepNum>1</StepNum>
          <div className="flex flex-col">
            <div className="text-text-primary">{t(`${prefixCustomize}.way1.step1`, { ns: 'appOverview' })}</div>
            <div className="mb-2 mt-1 text-xs text-text-tertiary">{t(`${prefixCustomize}.way1.step1Tip`, { ns: 'appOverview' })}</div>
            <Button disabled>
              {t(`${prefixCustomize}.way1.step1Operation`, { ns: 'appOverview' })}
            </Button>
          </div>
        </div>
        <div className="flex pt-4">
          <StepNum>2</StepNum>
          <div className="flex flex-col">
            <div className="text-text-primary">{t(`${prefixCustomize}.way1.step2`, { ns: 'appOverview' })}</div>
            <div className="mb-2 mt-1 text-xs text-text-tertiary">{t(`${prefixCustomize}.way1.step2Tip`, { ns: 'appOverview' })}</div>
            <a href="https://vercel.com/docs/concepts/deployments/git/vercel-for-github" target="_blank" rel="noopener noreferrer">
              <Button>
                <div className="mr-1.5 border-b-[12px] border-l-[7px] border-r-[7px] border-t-0 border-solid border-text-primary border-l-transparent border-r-transparent border-t-transparent"></div>
                <span>{t(`${prefixCustomize}.way1.step2Operation`, { ns: 'appOverview' })}</span>
              </Button>
            </a>
          </div>
        </div>
        <div className="flex py-4">
          <StepNum>3</StepNum>
          <div className="flex w-full flex-col overflow-hidden">
            <div className="text-text-primary">{t(`${prefixCustomize}.way1.step3`, { ns: 'appOverview' })}</div>
            <div className="mb-2 mt-1 text-xs text-text-tertiary">{t(`${prefixCustomize}.way1.step3Tip`, { ns: 'appOverview' })}</div>
            <pre className="box-border select-text overflow-x-scroll rounded-lg border-[0.5px] border-components-panel-border bg-background-section px-4 py-3 text-xs font-medium text-text-secondary">
              NEXT_PUBLIC_APP_ID=
              {`'${appId}'`}
              {' '}
              <br />
              NEXT_PUBLIC_APP_KEY=
              {'\'<Web API Key>\''}
              {' '}
              <br />
              NEXT_PUBLIC_API_URL=
              {`'${api_base_url}'`}
            </pre>
          </div>
        </div>

      </div>
      <div className="mt-4 w-full rounded-lg border-[0.5px] border-components-panel-border px-6 py-5">
        <Tag bordered={true} hideBg={true} className="border-text-accent-secondary uppercase text-text-accent-secondary">
          {t(`${prefixCustomize}.way`, { ns: 'appOverview' })}
          {' '}
          2
        </Tag>
        <p className="my-2 text-text-secondary system-sm-medium">{t(`${prefixCustomize}.way2.name`, { ns: 'appOverview' })}</p>
        <Button className="mt-2" disabled>
          <span className="text-sm text-text-secondary">{t(`${prefixCustomize}.way2.operation`, { ns: 'appOverview' })}</span>
          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4 shrink-0 text-text-secondary" />
        </Button>
      </div>
    </Modal>
  )
}

export default CustomizeModal
