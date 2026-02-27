'use client'
import type { ToolWithProvider } from '@/app/components/workflow/types'
import { RiAddCircleFill } from '@remixicon/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '@/context/app-context'
import { useCreateMCP } from '@/service/use-tools'
import MCPModal from './modal'

type Props = {
  handleCreate: (provider: ToolWithProvider) => void
}

const NewMCPCard = ({ handleCreate }: Props) => {
  const { t } = useTranslation()
  const { isCurrentWorkspaceManager } = useAppContext()

  const { mutateAsync: createMCP } = useCreateMCP()

  const create = async (info: any) => {
    const provider = await createMCP(info)
    handleCreate(provider)
  }

  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {isCurrentWorkspaceManager && (
        <div className="col-span-1 flex min-h-[108px] cursor-pointer flex-col rounded-xl bg-background-default-dimmed transition-all duration-200 ease-in-out">
          <div className="group grow rounded-t-xl" onClick={() => setShowModal(true)}>
            <div className="flex shrink-0 items-center p-4 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-divider-deep group-hover:border-solid group-hover:border-state-accent-hover-alt group-hover:bg-state-accent-hover">
                <RiAddCircleFill className="h-4 w-4 text-text-quaternary group-hover:text-text-accent" />
              </div>
              <div className="ml-3 text-text-secondary system-md-semibold group-hover:text-text-accent">{t('mcp.create.cardTitle', { ns: 'tools' })}</div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <MCPModal
          show={showModal}
          onConfirm={create}
          onHide={() => setShowModal(false)}
        />
      )}
    </>
  )
}
export default NewMCPCard
