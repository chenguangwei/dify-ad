'use client'

import type { DuplicateAppModalProps } from '@/app/components/app/duplicate-modal'
import type { HtmlContentProps } from '@/app/components/base/popover'
import type { Tag } from '@/app/components/base/tag-management/constant'
import type { CreateAppModalProps } from '@/app/components/explore/create-app-modal'
import type { EnvironmentVariable } from '@/app/components/workflow/types'
import type { App } from '@/types/app'
import { RiBuildingLine, RiGlobalLine, RiLockLine, RiMoreFill, RiVerifiedBadgeLine, RiEyeLine } from '@remixicon/react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'
import { AppTypeIcon } from '@/app/components/app/type-selector'
import AppIcon from '@/app/components/base/app-icon'
import Divider from '@/app/components/base/divider'
import CustomPopover from '@/app/components/base/popover'
import TagSelector from '@/app/components/base/tag-management/selector'
import Toast, { ToastContext } from '@/app/components/base/toast'
import Tooltip from '@/app/components/base/tooltip'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { useAppContext } from '@/context/app-context'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useProviderContext } from '@/context/provider-context'
import { useAsyncWindowOpen } from '@/hooks/use-async-window-open'
import { AccessMode } from '@/models/access-control'
import { useGetUserCanAccessApp } from '@/service/access-control'
import { copyApp, deleteApp, exportAppConfig, updateAppInfo } from '@/service/apps'
import { fetchInstalledAppList } from '@/service/explore'
import { fetchWorkflowDraft } from '@/service/workflow'
import { AppModeEnum } from '@/types/app'
import { getRedirection } from '@/utils/app-redirection'
import { cn } from '@/utils/classnames'
import { downloadBlob } from '@/utils/download'
import { formatTime } from '@/utils/time'
import { basePath } from '@/utils/var'

const EditAppModal = dynamic(() => import('@/app/components/explore/create-app-modal'), {
  ssr: false,
})
const DuplicateAppModal = dynamic(() => import('@/app/components/app/duplicate-modal'), {
  ssr: false,
})
const SwitchAppModal = dynamic(() => import('@/app/components/app/switch-app-modal'), {
  ssr: false,
})
const Confirm = dynamic(() => import('@/app/components/base/confirm'), {
  ssr: false,
})
const DSLExportConfirmModal = dynamic(() => import('@/app/components/workflow/dsl-export-confirm-modal'), {
  ssr: false,
})
const AccessControl = dynamic(() => import('@/app/components/app/app-access-control'), {
  ssr: false,
})

export type AppCardProps = {
  app: App
  onRefresh?: () => void
}

const AppCard = ({ app, onRefresh }: AppCardProps) => {
  const { t } = useTranslation()
  const { notify } = useContext(ToastContext)
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)
  const { isCurrentWorkspaceEditor } = useAppContext()
  const { onPlanInfoChanged } = useProviderContext()
  const { push } = useRouter()
  const openAsyncWindow = useAsyncWindowOpen()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showAccessControl, setShowAccessControl] = useState(false)
  const [secretEnvList, setSecretEnvList] = useState<EnvironmentVariable[]>([])

  const onConfirmDelete = useCallback(async () => {
    try {
      await deleteApp(app.id)
      notify({ type: 'success', message: t('appDeleted', { ns: 'app' }) })
      if (onRefresh)
        onRefresh()
      onPlanInfoChanged()
    }
    catch (e: any) {
      notify({
        type: 'error',
        message: `${t('appDeleteFailed', { ns: 'app' })}${'message' in e ? `: ${e.message}` : ''}`,
      })
    }
    setShowConfirmDelete(false)
  }, [app.id, notify, onPlanInfoChanged, onRefresh, t])

  const onEdit: CreateAppModalProps['onConfirm'] = useCallback(async ({
    name,
    icon_type,
    icon,
    icon_background,
    description,
    use_icon_as_answer_icon,
    max_active_requests,
  }) => {
    try {
      await updateAppInfo({
        appID: app.id,
        name,
        icon_type,
        icon,
        icon_background,
        description,
        use_icon_as_answer_icon,
        max_active_requests,
      })
      setShowEditModal(false)
      notify({
        type: 'success',
        message: t('editDone', { ns: 'app' }),
      })
      if (onRefresh)
        onRefresh()
    }
    catch (e: any) {
      notify({
        type: 'error',
        message: e.message || t('editFailed', { ns: 'app' }),
      })
    }
  }, [app.id, notify, onRefresh, t])

  const onCopy: DuplicateAppModalProps['onConfirm'] = async ({ name, icon_type, icon, icon_background }) => {
    try {
      const newApp = await copyApp({
        appID: app.id,
        name,
        icon_type,
        icon,
        icon_background,
        mode: app.mode,
      })
      setShowDuplicateModal(false)
      notify({
        type: 'success',
        message: t('newApp.appCreated', { ns: 'app' }),
      })
      localStorage.setItem(NEED_REFRESH_APP_LIST_KEY, '1')
      if (onRefresh)
        onRefresh()
      onPlanInfoChanged()
      getRedirection(isCurrentWorkspaceEditor, newApp, push)
    }
    catch {
      notify({ type: 'error', message: t('newApp.appCreateFailed', { ns: 'app' }) })
    }
  }

  const onExport = async (include = false) => {
    try {
      const { data } = await exportAppConfig({
        appID: app.id,
        include,
      })
      const file = new Blob([data], { type: 'application/yaml' })
      downloadBlob({ data: file, fileName: `${app.name}.yml` })
    }
    catch {
      notify({ type: 'error', message: t('exportFailed', { ns: 'app' }) })
    }
  }

  const exportCheck = async () => {
    if (app.mode !== AppModeEnum.WORKFLOW && app.mode !== AppModeEnum.ADVANCED_CHAT) {
      onExport()
      return
    }
    try {
      const workflowDraft = await fetchWorkflowDraft(`/apps/${app.id}/workflows/draft`)
      const list = (workflowDraft.environment_variables || []).filter(env => env.value_type === 'secret')
      if (list.length === 0) {
        onExport()
        return
      }
      setSecretEnvList(list)
    }
    catch {
      notify({ type: 'error', message: t('exportFailed', { ns: 'app' }) })
    }
  }

  const onSwitch = () => {
    if (onRefresh)
      onRefresh()
    setShowSwitchModal(false)
  }

  const onUpdateAccessControl = useCallback(() => {
    if (onRefresh)
      onRefresh()
    setShowAccessControl(false)
  }, [onRefresh, setShowAccessControl])

  const Operations = (props: HtmlContentProps) => {
    const { data: userCanAccessApp, isLoading: isGettingUserCanAccessApp } = useGetUserCanAccessApp({ appId: app?.id, enabled: (!!props?.open && systemFeatures.webapp_auth.enabled) })
    const onMouseLeave = async () => {
      props.onClose?.()
    }
    const onClickSettings = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowEditModal(true)
    }
    const onClickDuplicate = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowDuplicateModal(true)
    }
    const onClickExport = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      exportCheck()
    }
    const onClickSwitch = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowSwitchModal(true)
    }
    const onClickDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowConfirmDelete(true)
    }
    const onClickAccessControl = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      setShowAccessControl(true)
    }
    const onClickInstalledApp = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      props.onClick?.()
      e.preventDefault()
      try {
        await openAsyncWindow(async () => {
          const { installed_apps }: any = await fetchInstalledAppList(app.id) || {}
          if (installed_apps?.length > 0)
            return `${basePath}/explore/installed/${installed_apps[0].id}`
          throw new Error('No app found in Explore')
        }, {
          onError: (err) => {
            Toast.notify({ type: 'error', message: `${err.message || err}` })
          },
        })
      }
      catch (e: any) {
        Toast.notify({ type: 'error', message: `${e.message || e}` })
      }
    }
    return (
      <div className="relative flex w-full flex-col py-1" onMouseLeave={onMouseLeave}>
        <button type="button" className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickSettings}>
          <span className="text-text-secondary system-sm-regular">{t('editApp', { ns: 'app' })}</span>
        </button>
        <Divider className="my-1" />
        <button type="button" className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickDuplicate}>
          <span className="text-text-secondary system-sm-regular">{t('duplicate', { ns: 'app' })}</span>
        </button>
        <button type="button" className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickExport}>
          <span className="text-text-secondary system-sm-regular">{t('export', { ns: 'app' })}</span>
        </button>
        {(app.mode === AppModeEnum.COMPLETION || app.mode === AppModeEnum.CHAT) && (
          <>
            <Divider className="my-1" />
            <button
              type="button"
              className="mx-1 flex h-8 cursor-pointer items-center rounded-lg px-3 hover:bg-state-base-hover"
              onClick={onClickSwitch}
            >
              <span className="text-sm leading-5 text-text-secondary">{t('switch', { ns: 'app' })}</span>
            </button>
          </>
        )}
        {
          !app.has_draft_trigger && (
            (!systemFeatures.webapp_auth.enabled)
              ? (
                <>
                  <Divider className="my-1" />
                  <button type="button" className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickInstalledApp}>
                    <span className="text-text-secondary system-sm-regular">{t('openInExplore', { ns: 'app' })}</span>
                  </button>
                </>
              )
              : !(isGettingUserCanAccessApp || !userCanAccessApp?.result) && (
                <>
                  <Divider className="my-1" />
                  <button type="button" className="mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickInstalledApp}>
                    <span className="text-text-secondary system-sm-regular">{t('openInExplore', { ns: 'app' })}</span>
                  </button>
                </>
              )
          )
        }
        <Divider className="my-1" />
        {
          systemFeatures.webapp_auth.enabled && isCurrentWorkspaceEditor && (
            <>
              <button type="button" className="mx-1 flex h-8 cursor-pointer items-center rounded-lg px-3 hover:bg-state-base-hover" onClick={onClickAccessControl}>
                <span className="text-sm leading-5 text-text-secondary">{t('accessControl', { ns: 'app' })}</span>
              </button>
              <Divider className="my-1" />
            </>
          )
        }
        <button
          type="button"
          className="group mx-1 flex h-8 cursor-pointer items-center gap-2 rounded-lg px-3 py-[6px] hover:bg-state-destructive-hover"
          onClick={onClickDelete}
        >
          <span className="text-text-secondary system-sm-regular group-hover:text-text-destructive">
            {t('operation.delete', { ns: 'common' })}
          </span>
        </button>
      </div>
    )
  }

  const [tags, setTags] = useState<Tag[]>(app.tags)
  useEffect(() => {
    setTags(app.tags)
  }, [app.tags])

  const EditTimeText = useMemo(() => {
    const timeText = formatTime({
      date: (app.updated_at || app.created_at) * 1000,
      dateFormat: `${t('segment.dateTimeFormat', { ns: 'datasetDocuments' })}`,
    })
    return `${t('segment.editedAt', { ns: 'datasetDocuments' })} ${timeText}`
  }, [app.updated_at, app.created_at, t])

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault()
          getRedirection(isCurrentWorkspaceEditor, app, push)
        }}
        className="group bg-[#FFFFFF] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-5 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:border-[#93C5FD] dark:hover:border-[#1D4ED8] transition-all cursor-pointer flex flex-col h-full relative"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-lg text-blue-600 dark:text-blue-400">
            <AppIcon
              size="tiny"
              iconType={app.icon_type}
              icon={app.icon}
              background={app.icon_background}
              imageUrl={app.icon_url}
              className="h-6 w-6"
            />
          </div>
          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 uppercase">
            {t(`types.${app.mode}`, { ns: 'app' })}
          </span>
        </div>

        <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2 group-hover:text-[#2563EB] transition-colors" title={app.name}>{app.name}</h3>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] line-clamp-3 mb-4 flex-1" title={app.description}>
          {app.description || app.name}
        </p>

        <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#374151]">
          <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <RiEyeLine className="h-4 w-4" /> {app.id ? (app.id.charCodeAt(0) % 9 + 1) : 1}.{app.id ? (app.id.charCodeAt(app.id.length - 1) % 10) : 2}k
            </span>
            <div className="flex items-center gap-2">
              <span className="hover:text-[#2563EB]">{app.author_name || '官方'}</span>

              {isCurrentWorkspaceEditor && (
                <div
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={e => e.stopPropagation()}
                >
                  <CustomPopover
                    htmlContent={<Operations />}
                    position="br"
                    trigger="click"
                    btnElement={(
                      <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-state-base-hover">
                        <RiMoreFill className="h-4 w-4 text-text-tertiary" />
                      </div>
                    )}
                    btnClassName={open =>
                      cn(
                        open ? '!bg-state-base-hover !shadow-none' : '!bg-transparent',
                        'h-6 w-6 rounded-md border-none !p-1 hover:!bg-state-base-hover',
                      )}
                    popupClassName={
                      (app.mode === AppModeEnum.COMPLETION || app.mode === AppModeEnum.CHAT)
                        ? '!w-[256px] translate-x-[-224px]'
                        : '!w-[216px] translate-x-[-128px]'
                    }
                    className="!z-20 h-fit"
                  />
                </div>
              )}
            </div>
          </div>

          {isCurrentWorkspaceEditor && (
            <div
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
              }}
            >
              <TagSelector
                position="bl"
                type="app"
                targetID={app.id}
                value={tags.map(tag => tag.id)}
                selectedTags={tags}
                onCacheUpdate={setTags}
                onChange={onRefresh}
              />
            </div>
          )}
        </div>
      </div>
      {showEditModal && (
        <EditAppModal
          isEditModal
          appName={app.name}
          appIconType={app.icon_type}
          appIcon={app.icon}
          appIconBackground={app.icon_background}
          appIconUrl={app.icon_url}
          appDescription={app.description}
          appMode={app.mode}
          appUseIconAsAnswerIcon={app.use_icon_as_answer_icon}
          max_active_requests={app.max_active_requests ?? null}
          show={showEditModal}
          onConfirm={onEdit}
          onHide={() => setShowEditModal(false)}
        />
      )}
      {showDuplicateModal && (
        <DuplicateAppModal
          appName={app.name}
          icon_type={app.icon_type}
          icon={app.icon}
          icon_background={app.icon_background}
          icon_url={app.icon_url}
          show={showDuplicateModal}
          onConfirm={onCopy}
          onHide={() => setShowDuplicateModal(false)}
        />
      )}
      {showSwitchModal && (
        <SwitchAppModal
          show={showSwitchModal}
          appDetail={app}
          onClose={() => setShowSwitchModal(false)}
          onSuccess={onSwitch}
        />
      )}
      {showConfirmDelete && (
        <Confirm
          title={t('deleteAppConfirmTitle', { ns: 'app' })}
          content={t('deleteAppConfirmContent', { ns: 'app' })}
          isShow={showConfirmDelete}
          onConfirm={onConfirmDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
      {secretEnvList.length > 0 && (
        <DSLExportConfirmModal
          envList={secretEnvList}
          onConfirm={onExport}
          onClose={() => setSecretEnvList([])}
        />
      )}
      {showAccessControl && (
        <AccessControl app={app} onConfirm={onUpdateAccessControl} onClose={() => setShowAccessControl(false)} />
      )}
    </>
  )
}

export default React.memo(AppCard)
