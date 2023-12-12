import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { InviteForm } from './components/InviteForm'
import { Protected } from '@/common/components/auth/Protected'
import { Card } from '@/common/components/Card'
import { PageContainer } from '@/common/components/PageContainer'
import { CardWrapper } from '@/common/components/CardWrapper'

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
