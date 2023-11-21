import { getInvitation, getUser } from '@/api'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { Invitation } from '@/common/interfaces'
import { SubmissionForm } from './components/SubmissionForm'
import { getAuthToken } from '@/common/helpers'

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
  params: { invitationId: string }
}) {
  const token = getAuthToken()
  const user = await getUser(token)

  const invitation = await getInvitationFromId(params.invitationId)
  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs
        rootHref="/"
        rootName="Trusted Entities"
        admin={user.id}
      />
      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        {invitation ? (
          <SubmissionForm invitation={invitation} />
        ) : (
          <p>Unknown invitation link</p>
        )}
      </div>
    </main>
  )
}
