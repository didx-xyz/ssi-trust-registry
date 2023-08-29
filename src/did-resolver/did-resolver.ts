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
}

async function resolveDid(agent: Agent, did: string) {
  logger.info(`Resolving DID ${did}`)
  const start = performance.now()
  const didResolutionResult = await agent.dids.resolve(did)
  const end = performance.now()
  logger.info('DID resolution result', didResolutionResult)
  logger.info(`DID ${did} resolved in ${Math.round(end - start)} ms`)
  if (didResolutionResult.didDocument) {
    return didResolutionResult.didDocument
  }
  return null
}
