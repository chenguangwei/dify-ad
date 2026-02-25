'use client'
import type { LangGeniusVersionResponse } from '@/models/common'
import { RiCloseLine } from '@remixicon/react'
import dayjs from 'dayjs'
import DifyLogo from '@/app/components/base/logo/dify-logo'
import Modal from '@/app/components/base/modal'

import { useGlobalPublicStore } from '@/context/global-public-context'

type IAccountSettingProps = {
  langGeniusVersionInfo: LangGeniusVersionResponse
  onCancel: () => void
}

export default function AccountAbout({
  langGeniusVersionInfo,
  onCancel,
}: IAccountSettingProps) {
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)

  return (
    <Modal
      isShow
      onClose={onCancel}
      className="!w-[480px] !max-w-[480px] !px-6 !py-4"
    >
      <div className="relative">
        <div className="absolute right-0 top-0 flex h-8 w-8 cursor-pointer items-center justify-center" onClick={onCancel}>
          <RiCloseLine className="h-4 w-4 text-text-tertiary" />
        </div>
        <div className="flex flex-col items-center gap-4 py-8">
          {systemFeatures.branding.enabled && systemFeatures.branding.workspace_logo
            ? (
                <img
                  src={systemFeatures.branding.workspace_logo}
                  className="block h-7 w-auto object-contain"
                  alt="logo"
                />
              )
            : <DifyLogo size="large" className="mx-auto" />}

          <div className="text-center text-xs font-normal text-text-tertiary">
            Version
            {langGeniusVersionInfo?.current_version}
          </div>
          <div className="flex flex-col items-center gap-2 text-center text-xs font-normal text-text-secondary">
            <div>
              ©
              {dayjs().year()}
              {' '}
              云知声智能科技股份有限公司
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
