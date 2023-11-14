import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { getAuthToken } from '@/common/helpers'
import { InviteForm } from './components/InviteForm'

export default function InvitePage() {
  const authToken = getAuthToken()

  return (
    <main
      style={{ color: '#2D3E47' }}
      className="flex min-h-screen flex-col w-full items-center"
    >
      <NavigationBreadcrumbs rootHref="/" rootName="Trusted Entities" />

      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        <p className="text-2xl font-bold leading-normal pb-2">
          Invite a company
        </p>
        <p className="text-sm leading-normal">
          Enter email address of the company&apos;s representative,
          <br />
          that you want to invite.
        </p>
        <InviteForm authToken={authToken} />
      </div>
    </main>
  )
}
