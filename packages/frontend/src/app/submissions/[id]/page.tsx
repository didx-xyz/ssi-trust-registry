'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { backendUrl, betterFetch } from '@/api'
import { Submission } from '@/common/interfaces'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { Button } from '@/common/components/Button'
import { LazySubmissionDetail } from './components/LazySubmissionDetail'
import { ApproveContents } from './components/ApproveContents'
import { RejectContents } from './components/RejectContents'

export default function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const [submission, setSubmission] = useState<
    Submission & { emailAddress: string }
  >()
  const {
    handleSubmit: handleApprove,
    formState: {
      isSubmitting: isApproving,
      isSubmitSuccessful: isApproveSuccessful,
    },
  } = useForm()
  const {
    handleSubmit: handleReject,
    formState: {
      isSubmitting: isRejecting,
      isSubmitSuccessful: isRejectSuccessful,
    },
  } = useForm()

  async function onApproveSubmission() {
    if (submission) {
      const { submission: approvedSubmission } = await approveSubmission(
        submission.id,
      )
      setSubmission({ ...submission, ...approvedSubmission })
    }
  }

  async function onRejectSubmission() {
    if (submission) {
      const rejectedSubmission = await rejectSubmission(submission.id)
      setSubmission({ ...submission, ...rejectedSubmission })
    }
  }

  useEffect(() => {
    getSubmission(id).then(setSubmission)
  }, [id])
  return (
    <main className="flex flex-col w-full items-center">
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/submissions', title: 'Submissions' },
          ...(submission
            ? [
                {
                  href: `/submissions/${id}`,
                  title: submission.name ?? 'Loading...',
                },
              ]
            : []),
        ]}
      />
      <div className="card rounded-2xl p-16 bg-white text-center w-1/2 min-w-[40rem] max-w-4xl">
        <div className="flex flex-col items-center gap-8">
          {isApproveSuccessful ? (
            <ApproveContents submission={submission} />
          ) : isRejectSuccessful ? (
            <RejectContents submission={submission} />
          ) : (
            <>
              <LazySubmissionDetail submission={submission} />
              {submission?.state === 'pending' && (
                <div className="card-actions gap-4">
                  <Button
                    disabled={isApproving || isRejecting}
                    type="secondary"
                    loading={isRejecting}
                    onClick={handleReject(onRejectSubmission)}
                    title="Reject"
                  />
                  <Button
                    disabled={isApproving || isRejecting}
                    loading={isApproving}
                    onClick={handleApprove(onApproveSubmission)}
                    title="Approve"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

async function getSubmission(
  id: string,
  authToken?: string,
): Promise<Submission & { emailAddress: string }> {
  const submission = await betterFetch(
    'GET',
    `${backendUrl}/api/submissions/${id}`,
  )
  const invitation = await betterFetch(
    'GET',
    `${backendUrl}/api/invitations/${submission.invitationId}`,
  )
  return { ...submission, emailAddress: invitation.emailAddress }
}

function approveSubmission(submissionId: string) {
  return betterFetch(
    'PUT',
    `${backendUrl}/api/submissions/${submissionId}`,
    {},
    { state: 'approved' },
  )
}

function rejectSubmission(submissionId: string) {
  return betterFetch(
    'PUT',
    `${backendUrl}/api/submissions/${submissionId}`,
    {},
    { state: 'rejected' },
  )
}
