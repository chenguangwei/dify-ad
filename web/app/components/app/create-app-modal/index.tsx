'use client'

import type { AppIconSelection } from '../../base/app-icon-picker'
import type { RemixiconComponentType } from '@remixicon/react'
import {
  RiAddLine,
  RiArrowRightLine,
  RiCheckLine,
  RiFileEditLine,
  RiMentalHealthLine,
  RiMindMap,
  RiOrganizationChart,
  RiRobot2Line,
  RiSparklingFill,
} from '@remixicon/react'

import { useDebounceFn, useKeyPress } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import { trackEvent } from '@/app/components/base/amplitude'
import AppIcon from '@/app/components/base/app-icon'
import Button from '@/app/components/base/button'
import FullScreenModal from '@/app/components/base/fullscreen-modal'
import Input from '@/app/components/base/input'
import Textarea from '@/app/components/base/textarea'
import { ToastContext } from '@/app/components/base/toast'
import AppsFull from '@/app/components/billing/apps-full-in-dialog'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { useAppContext } from '@/context/app-context'
import { useProviderContext } from '@/context/provider-context'
import { createApp } from '@/service/apps'
import { AppModeEnum } from '@/types/app'
import { getRedirection } from '@/utils/app-redirection'
import AppIconPicker from '../../base/app-icon-picker'

// ── Per-app-type visual config ──────────────────────────────────────────
type AppTypeConfig = {
  icon: RemixiconComponentType
  /** bg colour of the icon badge */
  iconBg: string
  /** i18n key for the display title (ns: app) */
  titleKey: string
  /** i18n key for the description (ns: app) */
  descKey: string
}

const APP_TYPE_CONFIG: Record<AppModeEnum, AppTypeConfig> = {
  [AppModeEnum.WORKFLOW]: {
    icon: RiOrganizationChart,
    iconBg: 'bg-util-colors-blue-brand-blue-brand-600',
    titleKey: 'types.workflow',
    descKey: 'newApp.workflowUserDescription',
  },
  [AppModeEnum.ADVANCED_CHAT]: {
    icon: RiMindMap,
    iconBg: 'bg-util-colors-blue-brand-blue-brand-600',
    titleKey: 'types.advanced',
    descKey: 'newApp.advancedUserDescription',
  },
  [AppModeEnum.CHAT]: {
    icon: RiMentalHealthLine,
    iconBg: 'bg-[#0EA5E9]',
    titleKey: 'types.chatbot',
    descKey: 'newApp.chatbotUserDescription',
  },
  [AppModeEnum.AGENT_CHAT]: {
    icon: RiRobot2Line,
    iconBg: 'bg-[#7C3AED]',
    titleKey: 'types.agent',
    descKey: 'newApp.agentUserDescription',
  },
  [AppModeEnum.COMPLETION]: {
    icon: RiFileEditLine,
    iconBg: 'bg-[#F59E0B]',
    titleKey: 'types.completion',
    descKey: 'newApp.completionUserDescription',
  },
}

// Recommended icon presets (clicking sets the emoji quickly)
const RECOMMENDED_ICONS = [
  { src: '/recommended-icons/robot.png', alt: 'Robot' },
  { src: '/recommended-icons/brain.png', alt: 'Brain' },
  { src: '/recommended-icons/sparkle.png', alt: 'Sparkle' },
]

type CreateAppProps = {
  onSuccess: () => void
  onClose: () => void
  onCreateFromTemplate?: () => void
  defaultAppMode?: AppModeEnum
}

function CreateApp({ onClose, onSuccess, onCreateFromTemplate, defaultAppMode: _defaultAppMode }: CreateAppProps) {
  const { t } = useTranslation()
  const { push } = useRouter()
  const { notify } = useContext(ToastContext)
  const queryClient = useQueryClient()

  // Use the passed mode, fallback to ADVANCED_CHAT
  const appMode = _defaultAppMode ?? AppModeEnum.ADVANCED_CHAT

  // Resolve the visual config for the current app type
  const typeConfig = useMemo(() => APP_TYPE_CONFIG[appMode], [appMode])
  const TypeIcon = typeConfig.icon

  const [appIcon, setAppIcon] = useState<AppIconSelection>({ type: 'emoji', icon: '🤖', background: '#FFEAD5' })
  const [showAppIconPicker, setShowAppIconPicker] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { plan, enableBilling } = useProviderContext()
  const isAppsFull = (enableBilling && plan.usage.buildApps >= plan.total.buildApps)
  const { isCurrentWorkspaceEditor } = useAppContext()

  const isCreatingRef = useRef(false)

  const onCreate = useCallback(async () => {
    if (!appMode) {
      notify({ type: 'error', message: t('newApp.appTypeRequired', { ns: 'app' }) })
      return
    }
    if (!name.trim()) {
      notify({ type: 'error', message: t('newApp.nameNotEmpty', { ns: 'app' }) })
      return
    }
    if (isCreatingRef.current)
      return
    isCreatingRef.current = true
    try {
      const app = await createApp({
        name,
        description,
        icon_type: appIcon.type,
        icon: appIcon.type === 'emoji' ? appIcon.icon : appIcon.fileId,
        icon_background: appIcon.type === 'emoji' ? appIcon.background : undefined,
        mode: appMode,
      })

      trackEvent('create_app', {
        app_mode: appMode,
        description,
      })

      notify({ type: 'success', message: t('newApp.appCreated', { ns: 'app' }) })
      onSuccess()
      onClose()
      localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')
      // Invalidate explore caches so 智能体广场 picks up the new app
      queryClient.invalidateQueries({ queryKey: ['explore'] })
      getRedirection(isCurrentWorkspaceEditor, app, push)
    }
    catch (e: any) {
      notify({
        type: 'error',
        message: e.message || t('newApp.appCreateFailed', { ns: 'app' }),
      })
    }
    isCreatingRef.current = false
  }, [name, notify, t, appMode, appIcon, description, onSuccess, onClose, push, isCurrentWorkspaceEditor, queryClient])

  const { run: handleCreateApp } = useDebounceFn(onCreate, { wait: 300 })
  useKeyPress(['meta.enter', 'ctrl.enter'], () => {
    if (isAppsFull)
      return
    handleCreateApp()
  })

  return (
    <div className="flex h-full justify-center overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-[720px] px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-text-primary title-2xl-semi-bold">
            {t('newApp.startFromBlank', { ns: 'app' })}
          </h1>
          <p className="mt-2 text-text-tertiary system-sm-regular">
            {t('newApp.startFromBlankSubtitle', { ns: 'app' })}
          </p>
        </div>

        {/* Section: 选择应用类型 */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-1.5">
            <div className="h-4 w-1 rounded-sm bg-util-colors-blue-brand-blue-brand-600" />
            <span className="text-text-primary system-md-semibold">
              {t('newApp.chooseAppType', { ns: 'app' })}
            </span>
          </div>
          <div className="rounded-xl border-2 border-util-colors-blue-brand-blue-brand-600 bg-components-panel-bg p-4">
            <div className="flex items-start gap-4">
              {/* Dynamic App Type Icon */}
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${typeConfig.iconBg}`}>
                <TypeIcon className="h-7 w-7 text-white" />
              </div>
              {/* Dynamic App Type Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary system-md-semibold">
                    {t(typeConfig.titleKey, { ns: 'app' })}
                  </span>
                  <span className="rounded-md bg-util-colors-blue-brand-blue-brand-100 px-1.5 py-0.5 text-util-colors-blue-brand-blue-brand-600 system-2xs-medium-uppercase">
                    {t('newApp.recommended', { ns: 'app' })}
                  </span>
                </div>
                <p className="mt-1 text-text-tertiary system-xs-regular leading-5">
                  {t(typeConfig.descKey, { ns: 'app' })}
                </p>
              </div>
              {/* Checkmark */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-util-colors-blue-brand-blue-brand-600">
                <RiCheckLine className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: 基础信息配置 */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-1.5">
            <div className="h-4 w-1 rounded-sm bg-util-colors-blue-brand-blue-brand-600" />
            <span className="text-text-primary system-md-semibold">
              {t('newApp.basicInfoConfig', { ns: 'app' })}
            </span>
          </div>

          {/* Name & Icon Row */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-text-secondary system-sm-semibold">
                {t('newApp.captionName', { ns: 'app' })}
              </label>
              <label className="text-text-secondary system-sm-semibold">
                {t('newApp.recommendedIcons', { ns: 'app' })}
              </label>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('newApp.appNamePlaceholder', { ns: 'app' }) || ''}
                  className="h-10 flex-1"
                />
                <AppIcon
                  iconType={appIcon.type}
                  icon={appIcon.type === 'emoji' ? appIcon.icon : appIcon.fileId}
                  background={appIcon.type === 'emoji' ? appIcon.background : undefined}
                  imageUrl={appIcon.type === 'image' ? appIcon.url : undefined}
                  size="large"
                  className="cursor-pointer rounded-lg"
                  onClick={() => { setShowAppIconPicker(true) }}
                />
              </div>
              <div className="flex items-center gap-2">
                {RECOMMENDED_ICONS.map((icon, index) => (
                  <button
                    key={index}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-divider-subtle transition-all hover:border-util-colors-blue-brand-blue-brand-600 hover:shadow-sm"
                    onClick={() => {
                      setAppIcon({
                        type: 'emoji',
                        icon: ['🤖', '🧠', '✨'][index],
                        background: ['#FFEAD5', '#D1FAE5', '#EDE9FE'][index],
                      })
                    }}
                  >
                    <Image
                      src={icon.src}
                      alt={icon.alt}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-divider-regular text-text-quaternary transition-all hover:border-util-colors-blue-brand-blue-brand-600 hover:text-util-colors-blue-brand-blue-brand-600"
                  onClick={() => { setShowAppIconPicker(true) }}
                >
                  <RiAddLine className="h-4 w-4" />
                </button>
              </div>
              {showAppIconPicker && (
                <AppIconPicker
                  onSelect={(payload) => {
                    setAppIcon(payload)
                    setShowAppIconPicker(false)
                  }}
                  onClose={() => {
                    setShowAppIconPicker(false)
                  }}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center gap-1">
              <label className="text-text-secondary system-sm-semibold">
                {t('newApp.appDescription', { ns: 'app' })}
              </label>
              <span className="text-text-tertiary system-xs-regular">
                ({t('newApp.optional', { ns: 'app' })})
              </span>
            </div>
            <Textarea
              className="resize-none"
              placeholder={t('newApp.appDescriptionPlaceholder', { ns: 'app' }) || ''}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        {isAppsFull && <AppsFull className="mt-4" loc="app-create" />}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-divider-subtle pt-6">
          <div
            className="flex cursor-pointer items-center gap-1 text-text-tertiary system-xs-regular transition-colors hover:text-text-secondary"
            onClick={onCreateFromTemplate}
          >
            <span>{t('newApp.noIdeaTip', { ns: 'app' })}</span>
            <RiArrowRightLine className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>
              {t('newApp.Cancel', { ns: 'app' })}
            </Button>
            <Button
              disabled={isAppsFull || !name}
              variant="primary"
              onClick={handleCreateApp}
              className="gap-1"
            >
              <span>{t('newApp.nextStepConfig', { ns: 'app' })}</span>
              <RiArrowRightLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

type CreateAppDialogProps = CreateAppProps & {
  show: boolean
}
const CreateAppModal = ({ show, onClose, onSuccess, onCreateFromTemplate, defaultAppMode }: CreateAppDialogProps) => {
  return (
    <FullScreenModal
      overflowVisible
      closable
      open={show}
      onClose={onClose}
    >
      <CreateApp onClose={onClose} onSuccess={onSuccess} onCreateFromTemplate={onCreateFromTemplate} defaultAppMode={defaultAppMode} />
    </FullScreenModal>
  )
}

export default CreateAppModal
