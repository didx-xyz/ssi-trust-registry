import {
  Agent,
  ConsoleLogger,
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

export async function initAgent() {
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

  await resolveDid(agent, 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3')
  await resolveDid(agent, 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb')
}

async function resolveDid(agent: Agent, did: string) {
  logger.info(`Resolving did ${did}`)
  const didResolutionResult = await agent.dids.resolve(did)
  logger.info('Did resolution result', didResolutionResult)
  if (!didResolutionResult.didDocument) {
    throw new Error(`DID ${did} is not resolvable`)
  }
}
