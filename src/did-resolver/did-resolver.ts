import { performance } from 'node:perf_hooks'
import partial from 'lodash.partial'
import {
  Agent,
  ConsoleLogger,
  DidDocument,
  DidsModule,
  LogLevel,
} from '@aries-framework/core'
import {
  IndyVdrIndyDidResolver,
  IndyVdrModule,
} from '@aries-framework/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'
import { agentDependencies } from '@aries-framework/node'
import { mainnetGenesis, testnetGenesis } from './txns'
import { AskarModule } from '@aries-framework/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import { createLogger } from '../logger'

const logger = createLogger(__filename)

export { DidDocument } from '@aries-framework/core'

export interface DidResolver {
  resolveDid: (did: string) => Promise<DidDocument | null>
}

export async function createDidResolver() {
  const agent = await initAgent()
  return {
    resolveDid: partial(resolveDid, agent),
  }
}

async function initAgent() {
  const agent = new Agent({
    config: {
      label: 'Trust Registry',
      walletConfig: { id: '123', key: 'somesecretkey' },
      logger: new ConsoleLogger(LogLevel.debug),
    },
    dependencies: agentDependencies,
    modules: {
      indyVdr: new IndyVdrModule({
        indyVdr,
        networks: [
          {
            isProduction: false,
            indyNamespace: 'sovrin:staging',
            genesisTransactions: testnetGenesis,
            connectOnStartup: true,
          },
          {
            isProduction: true,
            indyNamespace: 'sovrin',
            genesisTransactions: mainnetGenesis,
            connectOnStartup: true,
          },
        ],
      }),
      askar: new AskarModule({
        ariesAskar,
      }),
      dids: new DidsModule({
        resolvers: [new IndyVdrIndyDidResolver()],
      }),
    },
  })
  logger.info('Initializng agent')
  await agent.initialize()
  logger.info('Agent initialized')

  return agent
  // await resolveDid(agent, 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3')
  // await resolveDid(agent, 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb')
}

async function resolveDid(agent: Agent, did: string) {
  logger.info(`Resolving did ${did}`)
  performance.mark(`resolve-${did}-start`)
  const didResolutionResult = await agent.dids.resolve(did)
  performance.mark(`resolve-${did}-end`)
  performance.measure(
    `resolve-${did}`,
    `resolve-${did}-start`,
    `resolve-${did}-end`,
  )
  logger.info('Did resolution result', didResolutionResult)
  if (didResolutionResult.didDocument) {
    return didResolutionResult.didDocument
  }
  return null
}
