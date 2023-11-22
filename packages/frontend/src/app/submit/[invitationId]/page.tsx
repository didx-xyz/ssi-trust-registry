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

export default async function ApplyPage({
  params,
}: {
  params: { invitationId: string }
}) {
  const { invitationId } = params
  console.log(invitationId)
  const invitation = await getInvitationFromId(invitationId)
  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/', title: 'Trusted Entities' },
          {
            href: `/submit/${invitationId}`,
            title: 'Submission Form',
          },
        ]}
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
