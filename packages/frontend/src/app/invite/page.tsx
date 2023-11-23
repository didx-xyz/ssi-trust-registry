import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { getAuthToken } from '@/common/helpers'
import { InviteForm } from './components/InviteForm'

export default function InvitePage() {
  const authToken = getAuthToken()

  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/', title: 'Trusted Entities' },
          { href: '/invite', title: 'Invite a company' },
        ]}
      />

      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        <InviteForm authToken={authToken} />
      </div>
    </main>
  )
}
