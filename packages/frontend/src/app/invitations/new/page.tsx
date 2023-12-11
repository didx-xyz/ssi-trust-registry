import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { InviteForm } from './components/InviteForm'
import { Protected } from '@/common/components/auth/Protected'
import { Card } from '@/common/components/Card'
import { PageContainer } from '@/common/components/PageContainer'
import { AlignCardCenter } from '@/common/components/AlignCardCenter'

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
        <AlignCardCenter>
          <Card>
            <InviteForm />
          </Card>
        </AlignCardCenter>
      </PageContainer>
    </Protected>
  )
}
