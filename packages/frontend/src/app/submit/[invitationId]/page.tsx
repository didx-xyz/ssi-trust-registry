import { getInvitation } from '@/api'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { Invitation } from '@/common/interfaces'
import { SubmissionForm } from './components/SubmissionForm'
import { Card, CardWrapper } from '@/common/components/Card'
import { PageContainer } from '@/common/components/PageContainer'

export default async function SubmitPage({
  params,
}: {
  params: { invitationId: string }
}) {
  const { invitationId } = params
  console.log(invitationId)
  const invitation = await getInvitationFromId(invitationId)
  return (
    <PageContainer>
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/', title: 'Trusted Entities' },
          {
            href: `/submit/${invitationId}`,
            title: 'Submission Form',
          },
        ]}
      />
      <CardWrapper>
        <Card>
          {invitation ? (
            <SubmissionForm invitation={invitation} />
          ) : (
            <p>Unknown invitation link</p>
          )}
        </Card>
      </CardWrapper>
    </PageContainer>
  )
}

async function getInvitationFromId(id: string) {
  try {
    const invitation: Invitation = await getInvitation({ invitationId: id })
    return invitation
  } catch (error) {
    console.error(error)
    return null
  }
}
