import { useMemo } from 'react'
import type { App, AppCategory } from '@/models/explore'
import type { App as UserApp } from '@/types/app'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGlobalPublicStore } from '@/context/global-public-context'
import { useLocale } from '@/context/i18n'
import { AccessMode } from '@/models/access-control'
import { fetchAppList, fetchBanners, fetchInstalledAppList, fetchUserPublishedApps, getAppAccessModeByAppId, uninstallApp, updatePinStatus } from './explore'
import { AppSourceType, fetchAppMeta, fetchAppParams } from './share'

const NAME_SPACE = 'explore'

type ExploreAppListData = {
  categories: AppCategory[]
  allList: App[]
}

// 将用户应用转换为探索页面应用格式
const convertUserAppToExploreApp = (app: UserApp, installed: boolean = false): App => {
  return {
    app: {
      id: app.id,
      mode: app.mode,
      icon_type: app.icon_type,
      icon: app.icon,
      icon_background: app.icon_background,
      icon_url: app.icon_url,
      name: app.name,
      description: app.description,
      use_icon_as_answer_icon: app.use_icon_as_answer_icon,
    },
    app_id: app.id,
    description: app.description,
    copyright: '',
    privacy_policy: null,
    custom_disclaimer: null,
    category: 'Assistant',
    position: 0,
    is_listed: true,
    install_count: 0,
    installed,
    editable: true,
    is_agent: false,
    can_trial: false,
  }
}

export const useExploreAppList = () => {
  const locale = useLocale()

  // 获取预置模板
  const { data: exploreData, ...exploreQuery } = useQuery({
    queryKey: [NAME_SPACE, 'appList', locale],
    queryFn: async () => {
      const { categories, recommended_apps } = await fetchAppList()
      return {
        categories,
        allList: [...recommended_apps].sort((a, b) => a.position - b.position),
      }
    },
  })

  // 获取用户已发布的应用（enable_site: true）
  const { data: userAppsData, ...userAppsQuery } = useQuery({
    queryKey: [NAME_SPACE, 'userPublishedApps'],
    queryFn: async () => {
      const response = await fetchUserPublishedApps()
      return response.data
    },
  })

  // 合并数据
  const data = useMemo(() => {
    if (!exploreData)
      return undefined

    const exploreApps = exploreData.allList
    const userApps = (userAppsData || []).map(app => convertUserAppToExploreApp(app))

    // 合并：用户应用放在前面（按创建时间降序），然后是预置模板
    const allApps = [...userApps, ...exploreApps]

    return {
      categories: exploreData.categories,
      allList: allApps,
    }
  }, [exploreData, userAppsData])

  return {
    data,
    isLoading: exploreQuery.isLoading || userAppsQuery.isLoading,
    isError: exploreQuery.isError || userAppsQuery.isError,
  }
}

export const useGetInstalledApps = () => {
  return useQuery({
    queryKey: [NAME_SPACE, 'installedApps'],
    queryFn: () => {
      return fetchInstalledAppList()
    },
  })
}

export const useUninstallApp = () => {
  const client = useQueryClient()
  return useMutation({
    mutationKey: [NAME_SPACE, 'uninstallApp'],
    mutationFn: (appId: string) => uninstallApp(appId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [NAME_SPACE, 'installedApps'] })
    },
  })
}

export const useUpdateAppPinStatus = () => {
  const client = useQueryClient()
  return useMutation({
    mutationKey: [NAME_SPACE, 'updateAppPinStatus'],
    mutationFn: ({ appId, isPinned }: { appId: string, isPinned: boolean }) => updatePinStatus(appId, isPinned),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [NAME_SPACE, 'installedApps'] })
    },
  })
}

export const useGetInstalledAppAccessModeByAppId = (appId: string | null) => {
  const systemFeatures = useGlobalPublicStore(s => s.systemFeatures)
  return useQuery({
    queryKey: [NAME_SPACE, 'appAccessMode', appId, systemFeatures.webapp_auth.enabled],
    queryFn: () => {
      if (systemFeatures.webapp_auth.enabled === false) {
        return {
          accessMode: AccessMode.PUBLIC,
        }
      }
      if (!appId || appId.length === 0)
        return Promise.reject(new Error('App code is required to get access mode'))

      return getAppAccessModeByAppId(appId)
    },
    enabled: !!appId,
  })
}

export const useGetInstalledAppParams = (appId: string | null) => {
  return useQuery({
    queryKey: [NAME_SPACE, 'appParams', appId],
    queryFn: () => {
      if (!appId || appId.length === 0)
        return Promise.reject(new Error('App ID is required to get app params'))
      return fetchAppParams(AppSourceType.installedApp, appId)
    },
    enabled: !!appId,
  })
}

export const useGetInstalledAppMeta = (appId: string | null) => {
  return useQuery({
    queryKey: [NAME_SPACE, 'appMeta', appId],
    queryFn: () => {
      if (!appId || appId.length === 0)
        return Promise.reject(new Error('App ID is required to get app meta'))
      return fetchAppMeta(AppSourceType.installedApp, appId)
    },
    enabled: !!appId,
  })
}

export const useGetBanners = (locale?: string) => {
  return useQuery({
    queryKey: [NAME_SPACE, 'banners', locale],
    queryFn: () => {
      return fetchBanners(locale)
    },
  })
}
