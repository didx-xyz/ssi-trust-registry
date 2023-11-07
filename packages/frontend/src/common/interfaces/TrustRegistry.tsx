import { Entity } from '@/common/interfaces/Entity'
import { Schema } from '@/common/interfaces/Schema'

export interface TrustRegistry {
  entities: Entity[]
  schemas: Schema[]
}