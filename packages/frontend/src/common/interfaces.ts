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
}

export interface Schema {
  schemaId: string
  name: string
}

export interface TrustRegistry {
  entities: Entity[]
  schemas: Schema[]
}
