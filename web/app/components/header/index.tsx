'use client'
import Link from 'next/link'
import { useCallback } from 'react'
import DifyLogo from '@/app/components/base/logo/dify-logo'
import WorkplaceSelector from '@/app/components/header/account-dropdown/workplace-selector'
import { ACCOUNT_SETTING_TAB } from '@/app/components/header/account-setting/constants'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useModalContext } from '@/context/modal-context'
import { useProviderContext } from '@/context/provider-context'
import { WorkspaceProvider } from '@/context/workspace-context'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { Plan } from '../billing/type'
import AccountDropdown from './account-dropdown'
import EnvNav from './env-nav'
import LicenseNav from './license-env'
import PlanBadge from './plan-badge'

const Header = () => {
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const { enableBilling, plan } = useProviderContext()
  const { setShowPricingModal, setShowAccountSettingModal } = useModalContext()
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)
  const isFreePlan = plan.type === Plan.sandbox
  const isBrandingEnabled = systemFeatures.branding.enabled
  const handlePlanClick = useCallback(() => {
    if (isFreePlan)
      setShowPricingModal()
    else
      setShowAccountSettingModal({ payload: ACCOUNT_SETTING_TAB.BILLING })
  }, [isFreePlan, setShowAccountSettingModal, setShowPricingModal])

  const renderLogo = () => (
    <h1>
      <Link href="/apps" className="flex h-8 shrink-0 items-center justify-center overflow-hidden whitespace-nowrap px-0.5 indent-[-9999px]">
        {isBrandingEnabled && systemFeatures.branding.application_title ? systemFeatures.branding.application_title : '兽牙智能体平台'}
        {systemFeatures.branding.enabled && systemFeatures.branding.workspace_logo
          ? (
            <img
              src={systemFeatures.branding.workspace_logo}
              className="block h-[22px] w-auto object-contain"
              alt="logo"
            />
          )
          : <DifyLogo />}
      </Link>
    </h1>
  )

  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-2 h-16">
        <div className="flex items-center">
          {renderLogo()}
          <div className="mx-1.5 shrink-0 font-light text-divider-deep">/</div>
          <WorkspaceProvider>
            <WorkplaceSelector />
          </WorkspaceProvider>
          {enableBilling ? <PlanBadge allowHover sandboxAsUpgrade plan={plan.type} onClick={handlePlanClick} /> : <LicenseNav />}
        </div>
        <div className="flex items-center">
          <AccountDropdown />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-16 items-center">
      <div className="flex min-w-0 flex-[1] items-center pl-3 pr-2 min-[1280px]:pr-3">
        {renderLogo()}
        <div className="mx-1.5 shrink-0 font-light text-divider-deep">/</div>
        <WorkspaceProvider>
          <WorkplaceSelector />
        </WorkspaceProvider>
        {enableBilling ? <PlanBadge allowHover sandboxAsUpgrade plan={plan.type} onClick={handlePlanClick} /> : <LicenseNav />}
      </div>
      <div className="flex min-w-0 flex-[1] items-center justify-end pl-2 pr-3 min-[1280px]:pl-3">
        <EnvNav />
        <AccountDropdown />
      </div>
    </div>
  )
}
export default Header
