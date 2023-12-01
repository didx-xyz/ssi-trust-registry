export const trustRegistryStub = {
  entities: [
    {
      name: 'Absa',
      dids: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb'],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: ['issuer'],
      credentials: [
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      ],
      id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
      createdAt: '2023-11-10T14:43:36.083Z',
      updatedAt: '2023-11-20T16:49:58.307Z',
    },
    {
      name: 'Absa 2',
      dids: ['did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmc'],
      logo_url:
        'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
      domain: 'www.absa.africa',
      role: ['issuer'],
      credentials: [
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmc/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      ],
      id: '8fa665b6-7fc5-4b0b-baee-6221b1844ec8',
      createdAt: '2023-11-10T14:43:36.083Z',
      updatedAt: '2023-11-20T16:49:58.307Z',
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
        'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmc/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
      name: 'Digital Identity 2',
      createdAt: '2023-11-10T14:41:49.143Z',
      updatedAt: '2023-11-20T16:49:09.838Z',
    },
  ],
}

export const submissionsStub = [
  {
    name: 'John Doe',
    dids: ['did:key:z6MkjBWPPa1njEKygyr3LR3pRKkqv714vyTkfnUdP6ToFSH5'],
    logo_url:
      'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    domain: 'http://absa.co.za',
    role: ['issuer'],
    credentials: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
    ],
    invitationId: 's3gdwtyxt8w8dn87sbisxjn0',
    id: '8f2917fa-139a-41eb-855e-245d6bed96df',
    createdAt: '2023-11-16T15:24:31.630Z',
    updatedAt: '2023-11-16T15:24:31.630Z',
    state: 'pending',
  },
  {
    name: 'Charlotte Doe',
    dids: ['did:key:z6MknhhUUtbXCLRmUVhYG7LPPWN4CTKWXTLsygHMD6Ah5uDN'],
    logo_url:
      'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    domain: 'http://absa.co.za',
    role: ['issuer'],
    credentials: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
    ],
    invitationId: 'k4o74jb1u6bto0owh9si0sux',
    id: '6a89a0fc-3e22-44d8-9d27-35c79b9f76c5',
    createdAt: '2023-11-16T15:39:09.694Z',
    updatedAt: '2023-11-16T15:39:09.694Z',
    state: 'declined',
  },
  {
    name: 'Michael Doe',
    dids: ['did:key:z6MknhhUUtbXCLRmUVhYG7LPPWN4CTKWXTLsygHMD6Ah5uDN'],
    logo_url:
      'https://s3.eu-central-1.amazonaws.com/builds.eth.company/absa.svg',
    domain: 'http://absa.co.za',
    role: ['issuer'],
    credentials: [
      'did:indy:sovrin:staging:C279iyCR8wtKiPC8o9iPmb/anoncreds/v0/SCHEMA/e-KYC/1.0.0',
    ],
    invitationId: 'k4o74jb1u6bto0owh9si0sux',
    id: '5a89a0fc-3e22-44d8-9d27-35c79b9f76c3',
    createdAt: '2023-11-16T15:39:09.694Z',
    updatedAt: '2023-11-16T15:39:09.694Z',
    state: 'approved',
  },
]

export const invitationsStub = [
  {
    emailAddress: 'john.doe@example.com',
    id: 'r5z5okertizd49ld6hzfubtq',
    createdAt: '2023-11-16T14:50:02.207Z',
  },
  {
    emailAddress: 'charlotte.doe@example.com',
    id: 's3gdwtyxt8w8dn87sbisxjn0',
    createdAt: '2023-11-16T15:15:53.438Z',
  },
  {
    emailAddress: 'michael.doe@example.com',
    id: 'ahfhmsklv7to75xy7alnivuc',
    createdAt: '2023-11-16T15:25:10.670Z',
  },
  {
    emailAddress: 'alice.doe@example.com',
    id: 'ib6o9ki9fssprzljkuth6fvj',
    createdAt: '2023-11-16T15:26:00.362Z',
  },
  {
    emailAddress: 'tom.doe@example.com',
    id: 'f7vahm7zfx5sw24rb8i589yj',
    createdAt: '2023-11-16T15:28:26.858Z',
  },
]
