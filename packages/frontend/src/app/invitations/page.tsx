import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { PageContainer } from '@/common/components/PageContainer'
import { Button } from '@/common/components/Button'
import { Protected } from '@/common/components/auth/Protected'
import { InvitationsTable } from '@/app/invitations/components/InvitationsTable'

export default async function InvitationsPage() {
  return (
    <Protected>
      <PageContainer>
        <PageHeading>
          <Text2xlBold>Invitations</Text2xlBold>
          <Button href="/invitations/new" title="Invite a company" />
        </PageHeading>
        <InvitationsTable />
      </PageContainer>
    </Protected>
  )
}
