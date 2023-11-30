import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { InviteForm } from './components/InviteForm'
import { Protected } from '@/common/components/auth/Protected'

export default function InvitePage() {
  return (
    <Protected>
      <main className="flex flex-col w-full items-center">
        <NavigationBreadcrumbs
          breadcrumbs={[
            { href: '/invitations', title: 'Invitations' },
            { href: '/invitations/new', title: 'Invite a company' },
          ]}
        />

        <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
          <InviteForm />
        </div>
      </main>
    </Protected>
  )
}
