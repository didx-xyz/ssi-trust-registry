export const correctDids: Record<string, any> = {
  'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3': {
    '@context': [
      'https://w3id.org/did/v1',
      'https://w3id.org/security/suites/ed25519-2018/v1',
      'https://w3id.org/security/suites/x25519-2019/v1',
    ],
    id: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
    verificationMethod: [
      {
        id: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#verkey',
        type: 'Ed25519VerificationKey2018',
        controller: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
        publicKeyBase58: 'kGmEWEf1j14YXMtPHYvZEwgZgnw1sfEdCNegLkuFeyX',
      },
      {
        id: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#key-agreement-1',
        type: 'X25519KeyAgreementKey2019',
        controller: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3',
        publicKeyBase58: '2aiMtpscmrKD9VFKo3XYm3ZxczxgUCDBoXDjkCYh14fH',
      },
    ],
    service: [
      {
        id: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#endpoint',
        serviceEndpoint: 'https://ea.prod.absa.africa/didcomm',
        type: 'endpoint',
      },
      {
        id: 'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#did-communication',
        serviceEndpoint: 'https://ea.prod.absa.africa/didcomm',
        type: 'did-communication',
        priority: 0,
        recipientKeys: [
          'did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#key-agreement-1',
        ],
        routingKeys: [],
        accept: ['didcomm/aip2;env=rfc19'],
      },
    ],
    authentication: ['did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#verkey'],
    keyAgreement: ['did:indy:sovrin:2NPnMDv5Lh57gVZ3p3SYu3#key-agreement-1'],
  },
  'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb': {
    '@context': [
      'https://w3id.org/did/v1',
      'https://w3id.org/security/suites/ed25519-2018/v1',
      'https://w3id.org/security/suites/x25519-2019/v1',
    ],
    id: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
    verificationMethod: [
      {
        id: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#verkey',
        type: 'Ed25519VerificationKey2018',
        controller: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
        publicKeyBase58: 'EmWXcq1AMxBoojDgLPfoDnbR3DnBD1tVaSUKicUM9Fiv',
      },
      {
        id: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#key-agreement-1',
        type: 'X25519KeyAgreementKey2019',
        controller: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb',
        publicKeyBase58: '7MjKScLmFEFkTBnQgVQudKiuDWQ7QsZZuAhDFS7YnL3e',
      },
    ],
    service: [
      {
        id: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#endpoint',
        serviceEndpoint: 'https://ea.uat.absa.africa/didcomm',
        type: 'endpoint',
      },
      {
        id: 'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#did-communication',
        serviceEndpoint: 'https://ea.uat.absa.africa/didcomm',
        type: 'did-communication',
        priority: 0,
        recipientKeys: [
          'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#key-agreement-1',
        ],
        routingKeys: [],
        accept: ['didcomm/aip2;env=rfc19'],
      },
    ],
    authentication: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#verkey'],
    keyAgreement: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb#key-agreement-1',
    ],
  },
}
