import partial from 'lodash.partial'
import { DidResolver } from '../did-resolver/did-resolver'
import { SchemaRepository } from '../schema/service'

export interface ValidationService {
  validateDids: (dids: string[]) => Promise<void>
  validateSchemas: (schemaIds: string[]) => Promise<void>
}

export async function createValidationService(
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
): Promise<ValidationService> {
  return {
    validateDids: partial(validateResolvableDids, didResolver),
    validateSchemas: partial(validateSchemas, schemaRepository),
  }
}

async function validateResolvableDids(
  didResolver: DidResolver,
  dids: string[],
) {
  for (const did of dids) {
    const didDocument = await didResolver.resolveDid(did)
    if (!didDocument) {
      throw new Error(`DID ${did} is not resolvable`)
    }
  }
}

async function validateSchemas(
  schemaRepository: SchemaRepository,
  schemaIds: string[],
) {
  for (const schemaId of schemaIds) {
    const schema = await schemaRepository.findBySchemaId(schemaId)
    if (!schema) {
      throw new Error(
        `Schema ID '${schemaId}' is not present in the trust registry`,
      )
    }
  }
}
