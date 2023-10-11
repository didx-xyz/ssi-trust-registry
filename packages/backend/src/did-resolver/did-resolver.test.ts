import { correctDids } from '../__tests__/fixtures'
import { DidResolver, createDidResolver } from './did-resolver'

jest.setTimeout(60000)

describe('resolveDid', () => {
  let didResolver: DidResolver

  beforeAll(async () => {
    didResolver = await createDidResolver()
  })

  test('resolves did and returns did document', async () => {
    const did = 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb'
    const didDocument = await didResolver.resolveDid(did)
    expect(JSON.stringify(didDocument)).toEqual(
      JSON.stringify(correctDids[did]),
    )
  })

  test('when did is not resolvable returns null', async () => {
    const didDocument = await didResolver.resolveDid('did:indy:sovrin:abcdefgh')
    expect(didDocument).toBeNull()
  })
})
