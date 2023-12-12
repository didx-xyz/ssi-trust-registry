import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { InviteForm } from './components/InviteForm'
import { Protected } from '@/common/components/auth/Protected'
import { Card, CardWrapper } from '@/common/components/Card'
import { PageContainer } from '@/common/components/PageContainer'

export default function InvitePage() {
  return (
    <Protected>
      <PageContainer>
        <NavigationBreadcrumbs
          breadcrumbs={[
            { href: '/invitations', title: 'Invitations' },
            { href: '/invitations/new', title: 'Invite a company' },
          ]}
        />
        <CardWrapper>
          <Card>
            <InviteForm />
          </Card>
        </CardWrapper>
      </PageContainer>
    </Protected>
  )
}
