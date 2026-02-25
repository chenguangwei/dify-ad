import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons'
import tailwindTypography from '@tailwindcss/typography'
import { importSvgCollections } from 'iconify-import-svg'
// @ts-expect-error workaround for turbopack issue
import { cssAsPlugin } from './tailwind-css-plugin.ts'
// @ts-expect-error workaround for turbopack issue
import tailwindThemeVarDefine from './themes/tailwind-theme-var-define.ts'
import typography from './typography.js'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url))

const config = {
  theme: {
    typography,
    extend: {
      colors: {
        gray: {
          25: '#fafafa',
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#d2d2d7',
          300: '#a1a1a6',
          400: '#6e6e73',
          500: '#48484a',
          600: '#3a3a3c',
          700: '#2c2c2e',
          800: '#1c1c1e',
          900: '#000000',
        },
        primary: {
          25: '#f0f5ff',
          50: '#e5f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#007AFF',
          600: '#0066d6',
          700: '#0052ad',
          800: '#003d82',
          900: '#002957',
        },
        blue: {
          500: '#E1EFFE',
        },
        green: {
          50: '#F3FAF7',
          100: '#DEF7EC',
          800: '#03543F',

        },
        yellow: {
          100: '#FDF6B2',
          800: '#723B13',
        },
        purple: {
          50: '#F6F5FF',
          200: '#DCD7FE',
        },
        indigo: {
          25: '#F5F8FF',
          50: '#EEF4FF',
          100: '#E0EAFF',
          300: '#A4BCFD',
          400: '#8098F9',
          600: '#444CE7',
          800: '#2D31A6',
        },
        ...tailwindThemeVarDefine,
      },
      screens: {
        'mobile': '100px',
        // => @media (min-width: 100px) { ... }
        'tablet': '640px', // 391
        // => @media (min-width: 600px) { ... }
        'pc': '769px',
        // => @media (min-width: 769px) { ... }
        '2k': '2560px',
      },
      boxShadow: {
        'xs': '0px 0.5px 1px 0px rgba(0, 0, 0, 0.04)',
        'sm': '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 0px 1px rgba(0, 0, 0, 0.04)',
        'sm-no-bottom': '0px -1px 2px 0px rgba(0, 0, 0, 0.06), 0px -1px 3px 0px rgba(0, 0, 0, 0.10)',
        'md': '0px 2px 8px -2px rgba(0, 0, 0, 0.06), 0px 4px 12px -4px rgba(0, 0, 0, 0.06)',
        'lg': '0px 8px 24px -4px rgba(0, 0, 0, 0.08), 0px 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'xl': '0px 12px 32px -4px rgba(0, 0, 0, 0.1), 0px 4px 12px -4px rgba(0, 0, 0, 0.05)',
        '2xl': '0px 24px 48px -12px rgba(0, 0, 0, 0.15)',
        '3xl': '0px 32px 64px -12px rgba(0, 0, 0, 0.12)',
        'status-indicator-green-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-success-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-warning-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-warning-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-red-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-error-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-blue-shadow': '0px 2px 6px 0px var(--color-components-badge-status-light-normal-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
        'status-indicator-gray-shadow': '0px 1px 2px 0px var(--color-components-badge-status-light-disabled-halo), 0px 0px 0px 1px var(--color-components-badge-status-light-border-outer)',
      },
      opacity: {
        2: '0.02',
        8: '0.08',
      },
      fontFamily: {
        instrument: ['var(--font-instrument-serif)', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Plus Jakarta Sans', 'Inter', 'Helvetica Neue', 'Arial', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      backgroundColor: {
        'background-gradient-bg-fill-chat-bubble-bg-3': 'var(--color-background-gradient-bg-fill-chat-bubble-bg-3)',
      },
      backgroundImage: {
        'chatbot-bg': 'var(--color-chatbot-bg)',
        'chat-bubble-bg': 'var(--color-chat-bubble-bg)',
        'chat-input-mask': 'var(--color-chat-input-mask)',
        'workflow-process-bg': 'var(--color-workflow-process-bg)',
        'workflow-process-paused-bg': 'var(--color-workflow-process-paused-bg)',
        'workflow-run-failed-bg': 'var(--color-workflow-run-failed-bg)',
        'workflow-batch-failed-bg': 'var(--color-workflow-batch-failed-bg)',
        'mask-top2bottom-gray-50-to-transparent': 'var(--mask-top2bottom-gray-50-to-transparent)',
        'marketplace-divider-bg': 'var(--color-marketplace-divider-bg)',
        'marketplace-plugin-empty': 'var(--color-marketplace-plugin-empty)',
        'toast-success-bg': 'var(--color-toast-success-bg)',
        'toast-warning-bg': 'var(--color-toast-warning-bg)',
        'toast-error-bg': 'var(--color-toast-error-bg)',
        'toast-info-bg': 'var(--color-toast-info-bg)',
        'app-detail-bg': 'var(--color-app-detail-bg)',
        'app-detail-overlay-bg': 'var(--color-app-detail-overlay-bg)',
        'dataset-chunk-process-success-bg': 'var(--color-dataset-chunk-process-success-bg)',
        'dataset-chunk-process-error-bg': 'var(--color-dataset-chunk-process-error-bg)',
        'dataset-chunk-detail-card-hover-bg': 'var(--color-dataset-chunk-detail-card-hover-bg)',
        'dataset-child-chunk-expand-btn-bg': 'var(--color-dataset-child-chunk-expand-btn-bg)',
        'dataset-option-card-blue-gradient': 'var(--color-dataset-option-card-blue-gradient)',
        'dataset-option-card-purple-gradient': 'var(--color-dataset-option-card-purple-gradient)',
        'dataset-option-card-orange-gradient': 'var(--color-dataset-option-card-orange-gradient)',
        'dataset-chunk-list-mask-bg': 'var(--color-dataset-chunk-list-mask-bg)',
        'line-divider-bg': 'var(--color-line-divider-bg)',
        'dataset-warning-message-bg': 'var(--color-dataset-warning-message-bg)',
        'price-premium-badge-background': 'var(--color-premium-badge-background)',
        'premium-yearly-tip-text-background': 'var(--color-premium-yearly-tip-text-background)',
        'price-premium-text-background': 'var(--color-premium-text-background)',
        'price-enterprise-background': 'var(--color-price-enterprise-background)',
        'grid-mask-background': 'var(--color-grid-mask-background)',
        'node-data-source-bg': 'var(--color-node-data-source-bg)',
        'tag-selector-mask-bg': 'var(--color-tag-selector-mask-bg)',
        'tag-selector-mask-hover-bg': 'var(--color-tag-selector-mask-hover-bg)',
        'pipeline-template-card-hover-bg': 'var(--color-pipeline-template-card-hover-bg)',
        'pipeline-add-documents-title-bg': 'var(--color-pipeline-add-documents-title-bg)',
        'billing-plan-title-bg': 'var(--color-billing-plan-title-bg)',
        'billing-plan-card-premium-bg': 'var(--color-billing-plan-card-premium-bg)',
        'billing-plan-card-enterprise-bg': 'var(--color-billing-plan-card-enterprise-bg)',
        'knowledge-pipeline-creation-footer-bg': 'var(--color-knowledge-pipeline-creation-footer-bg)',
        'progress-bar-indeterminate-stripe': 'var(--color-progress-bar-indeterminate-stripe)',
        'chat-answer-human-input-form-divider-bg': 'var(--color-chat-answer-human-input-form-divider-bg)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [
    tailwindTypography,
    iconsPlugin({
      collections: {
        ...getIconCollections(['heroicons', 'ri']),
        ...importSvgCollections({
          source: path.resolve(_dirname, 'app/components/base/icons/assets/public'),
          prefix: 'custom-public',
          ignoreImportErrors: true,
        }),
        ...importSvgCollections({
          source: path.resolve(_dirname, 'app/components/base/icons/assets/vender'),
          prefix: 'custom-vender',
          ignoreImportErrors: true,
        }),
      },
      extraProperties: {
        width: '1rem',
        height: '1rem',
        display: 'block',
      },
    }),
    cssAsPlugin([
      path.resolve(_dirname, './app/styles/globals.css'),
      path.resolve(_dirname, './app/components/base/action-button/index.css'),
      path.resolve(_dirname, './app/components/base/badge/index.css'),
      path.resolve(_dirname, './app/components/base/button/index.css'),
      path.resolve(_dirname, './app/components/base/modal/index.css'),
      path.resolve(_dirname, './app/components/base/premium-badge/index.css'),
    ]),
  ],
  // https://github.com/tailwindlabs/tailwindcss/discussions/5969
  corePlugins: {
    preflight: false,
  },
}

export default config
