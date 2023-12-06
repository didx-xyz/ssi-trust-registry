export const trustRegistryStub = {
  entities: [
    {
      name: 'Absa',
      dids: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb'],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: ['issuer', 'verifier'],
      credentials: [
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC-mobile/1.0.0',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC-residence/7.0.0',
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/test-absa-bank-account/1.0.0',
      ],
      id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
      createdAt: '2023-11-10T14:43:36.083Z',
      updatedAt: '2023-11-20T16:49:58.307Z',
    },
    {
      name: 'DIDx',
      dids: ['did:indy:sovrin:staging:L9YosTGp7hDUcHLmTC8dE9'],
      logo_url: 'https://didx.net/static/media/logo.d4f6a758.png',
      domain: 'https://didx.net',
      role: ['issuer', 'verifier'],
      credentials: [],
      id: '9lagh5b6-7fc5-5b0b-bart-6561b9432eg5',
      createdAt: '2023-10-10T14:43:36.083Z',
      updatedAt: '2023-10-20T16:49:58.307Z',
    },
  ],
  schemas: [
    {
      schemaId:
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      name: 'Digital Identity',
      createdAt: '2023-11-10T14:41:49.143Z',
      updatedAt: '2023-11-20T16:49:09.838Z',
    },
    {
      schemaId:
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC-mobile/1.0.0',
      name: 'Phone Number',
      createdAt: '2023-12-10T14:41:49.143Z',
      updatedAt: '2023-12-20T16:49:09.838Z',
    },
    {
      schemaId:
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC-residence/7.0.0',
      name: 'Digital Identity',
      createdAt: '2023-12-11T14:41:49.143Z',
      updatedAt: '2023-12-21T16:49:09.838Z',
    },
    {
      schemaId:
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/test-absa-bank-account/1.0.0',
      name: 'Bank Account',
      createdAt: '2023-10-11T14:41:49.143Z',
      updatedAt: '2023-10-21T16:49:09.838Z',
    },
  ],
}

export const submissionsStub = [
  {
    name: 'Absa',
    dids: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb'],
    logo_url:
      'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    domain: 'http://absa.co.za',
    role: ['issuer', 'verifier'],
    credentials: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
    ],
    invitationId: 's3gdwtyxt8w8dn87sbisxjn0',
    id: '8f2917fa-139a-41eb-855e-245d6bed96df',
    createdAt: '2023-11-16T15:24:31.630Z',
    updatedAt: '2023-11-16T15:24:31.630Z',
    state: 'approved',
  },
  {
    name: 'DIDx',
    dids: ['did:indy:sovrin:staging:L9YosTGp7hDUcHLmTC8dE9'],
    logo_url: 'https://didx.net/static/media/logo.d4f6a758.png',
    domain: 'https://didx.net',
    role: ['issuer', 'verifier'],
    credentials: [],
    invitationId: '86fdhuyxG7w6dnk7sirmxen1',
    id: '8f2917fa-139a-41eb-855e-245d6bed96df',
    createdAt: '2023-10-16T15:24:31.630Z',
    updatedAt: '2023-10-16T15:24:31.630Z',
    state: 'approved',
  },
]

export const invitationsStub = [
  {
    emailAddress: 'admin@absa.africa',
    id: 's3gdwtyxt8w8dn87sbisxjn0',
    createdAt: '2023-11-16T14:50:02.207Z',
    entityId: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
  },
  {
    emailAddress: 'admin@didx.net',
    id: '86fdhuyxG7w6dnk7sirmxen1',
    createdAt: '2023-10-16T14:50:02.207Z',
    entityId: '9lagh5b6-7fc5-5b0b-bart-6561b9432eg5',
  },
]
