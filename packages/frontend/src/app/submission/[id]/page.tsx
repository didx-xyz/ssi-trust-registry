import { getInvitation } from '@/api'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { Invitation } from '@/common/interfaces'
import { SubmissionForm } from './components/SubmissionForm'

async function getInvitationFromId(id: string) {
  try {
    const invitation: Invitation = await getInvitation({ invitationId: id })
    return invitation
  } catch (error) {
    console.error(error)
    return null
  }
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  console.log('id', params.id)
  const invitation = await getInvitationFromId(params.id)
  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs rootHref="/" rootName="Trusted Entities" />
      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        {invitation ? (
          <SubmissionForm invitation={invitation} />
        ) : (
          <p>Unknown invitationId</p>
        )}
      </div>
    </main>
  )
}