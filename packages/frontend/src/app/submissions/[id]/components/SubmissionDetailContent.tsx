'use client'
import React, { useEffect, useState } from 'react'
import { Submission } from '@/common/interfaces'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import { ApproveContents } from '@/app/submissions/[id]/components/ApproveContents'
import { RejectContents } from '@/app/submissions/[id]/components/RejectContents'
import { SubmissionDetail } from '@/app/submissions/[id]/components/SubmissionDetail'
import { Button } from '@/common/components/Button'
import { backendUrl, betterFetch } from '@/api'
import { Card, CardWrapper } from '@/common/components/Card'
import { useFormWithServerError } from '@/common/hooks'

export function SubmissionDetailContent({ id }: { id: string }) {
  const [submission, setSubmission] = useState<
    Submission & { emailAddress: string }
  >()
  const {
    handleSubmit: handleApprove,
    formState: {
      isSubmitting: isApproving,
      isSubmitSuccessful: isApproveSuccessful,
    },
    setError: setApproveError,
  } = useFormWithServerError()
  const {
    handleSubmit: handleReject,
    formState: {
      isSubmitting: isRejecting,
      isSubmitSuccessful: isRejectSuccessful,
    },
    setError: setRejectError,
  } = useFormWithServerError()

  async function onApproveSubmission() {
    try {
      if (submission) {
        const { submission: approvedSubmission } = await approveSubmission(
          submission.id,
        )
        setSubmission({ ...submission, ...approvedSubmission })
      }
    } catch (e) {
      setApproveError('server', {
        type: 'manual',
        message: 'Something went wrong',
      })
    }
  }

  async function onRejectSubmission() {
    try {
      if (submission) {
        const rejectedSubmission = await rejectSubmission(submission.id)
        setSubmission({ ...submission, ...rejectedSubmission })
      }
    } catch (e) {
      setRejectError('server', {
        type: 'manual',
        message: 'Something went wrong',
      })
    }
  }

  useEffect(() => {
    getSubmission(id).then(setSubmission)
  }, [id])
  return (
    <>
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
      <CardWrapper>
        <Card>
          <div className="flex flex-col items-center gap-8">
            {isApproveSuccessful ? (
              <ApproveContents submission={submission} />
            ) : isRejectSuccessful ? (
              <RejectContents submission={submission} />
            ) : (
              <>
                <SubmissionDetail submission={submission} />
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
        </Card>
      </CardWrapper>
    </>
  )
}

async function getSubmission(
  id: string,
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
