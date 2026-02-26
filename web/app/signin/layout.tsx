'use client'
import { useGlobalPublicStore } from '@/context/global-public-context'

import useDocumentTitle from '@/hooks/use-document-title'
import { cn } from '@/utils/classnames'
import Header from './_header'

export default function SignInLayout({ children }: any) {
  const { systemFeatures } = useGlobalPublicStore()
  useDocumentTitle('')
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Light mode styles */
        html[data-theme="light"] .signin-bg {
          background: url("https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=3000&auto=format&fit=crop") center/cover no-repeat;
        }
        html[data-theme="light"] .signin-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.1);
        }
        html[data-theme="light"] .signin-text-title { color: #111827; }
        html[data-theme="light"] .signin-text-body { color: #4B5563; }
        html[data-theme="light"] .signin-text-caption { color: #6B7280; }
        html[data-theme="light"] .signin-divider { background: #D1D5DB; }
        html[data-theme="light"] .signin-input {
          background: rgba(255, 255, 255, 0.5) !important;
          border-color: #E5E7EB !important;
          color: #111827 !important;
        }
        html[data-theme="light"] .signin-input::placeholder { color: #9CA3AF !important; }
        html[data-theme="light"] .signin-input:focus { background: #FFFFFF !important; }
        html[data-theme="light"] .signin-link { color: #2563EB !important; }
        html[data-theme="light"] .signin-link:hover { color: #1D4ED8 !important; text-decoration: underline; }
        
        /* Dark mode styles */
        html[data-theme="dark"] .signin-bg {
          background: url("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop") center/cover no-repeat, radial-gradient(circle at center, #1a2342 0%, #0d111c 50%, #05070a 100%);
          background-blend-mode: overlay;
        }
        html[data-theme="dark"] .signin-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
        }
        html[data-theme="dark"] .signin-text-title { color: #FFFFFF !important; }
        html[data-theme="dark"] .signin-text-body { color: rgba(255, 255, 255, 0.8) !important; }
        html[data-theme="dark"] .signin-text-caption { color: rgba(255, 255, 255, 0.5) !important; }
        html[data-theme="dark"] .signin-divider { background: rgba(255, 255, 255, 0.2) !important; }
        html[data-theme="dark"] .signin-input {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #FFFFFF !important;
        }
        html[data-theme="dark"] .signin-input::placeholder { color: rgba(255, 255, 255, 0.5) !important; }
        html[data-theme="dark"] .signin-input:focus { background: rgba(255, 255, 255, 0.2) !important; }
        html[data-theme="dark"] .signin-link { color: rgba(255, 255, 255, 0.8) !important; }
        html[data-theme="dark"] .signin-link:hover { color: #FFFFFF !important; }
      ` }} />
      <div className={cn('signin-bg relative flex min-h-screen w-full items-center justify-center p-6 overflow-hidden')}>
        <div className={cn('signin-card relative z-10 flex w-full max-w-[800px] shrink-0 flex-col items-center rounded-[32px]')}>
          <Header />
          <div className={cn('flex w-full grow flex-col items-center justify-center px-6 md:px-[108px]')}>
            <div className="flex flex-col md:w-[400px]">
              {children}
            </div>
          </div>
          {systemFeatures.branding.enabled === false && (
            <div className="px-8 py-6 signin-text-body system-xs-regular">
              ©
              {' '}
              {new Date().getFullYear()}
              {' '}
              云知声智能科技股份有限公司 版权所有
            </div>
          )}
        </div>
      </div>
    </>
  )
}
