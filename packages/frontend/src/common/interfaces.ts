export interface Entity {
  id: string
  name: string
  dids: string[]
  logo_url: string
  domain: string
  role: string[]
  credentials: string[]
  createdAt: string
  updatedAt: string
  status: string
}

export interface Schema {
  schemaId: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Submission {
  id: string
  invitationId: string
  name: string
  dids: string[]
  logo_url: string
  domain: string
  role: string[]
  credentials: string[]
  createdAt: string
  updatedAt: string
  state: string
}

export interface SubmissionWithEmail extends Submission {
  emailAddress: string
}

export interface Invitation {
  id: string
  emailAddress: string
  createdAt: string
  entityId?: string
}
