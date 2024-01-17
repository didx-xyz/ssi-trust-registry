import { Submission } from '@ssi-trust-registry/common'

export interface SubmissionWithEmail extends Submission {
  emailAddress: string
}

export interface GenericError {
  generic?: never
}
