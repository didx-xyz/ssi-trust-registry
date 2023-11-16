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
}

export interface Submission {
  name: string
  dids: string[]
  logo_url: string
  domain: string
  role: string[]
  credentials: string[]
  createdAt: string
  updatedAt: string
  state: string
  email: string
}

export interface Invitation {
  id: string
  emailAddress: string
  createdAt: string
  entityId?: string
}
