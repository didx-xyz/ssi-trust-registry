import { hideSecrets } from './config'

describe('hideSecrets', () => {
  test('hides password in db connection string and smtp auth', () => {
    expect(
      // @ts-expect-error we just need part of the config to test the function
      hideSecrets({
        server: {
          port: 123,
          url: 'someurl',
          frontendUrl: 'http://localhost:3001',
        },
        db: {
          connectionString:
            'mongodb://myDBReader:D1fficultP%40ssw0rd@mongodb0.example.com:27017,mongodb1.example.com:27017,mongodb2.example.com:27017/?replicaSet=myRepl&authSource=admin',
          name: 'somename',
        },
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          auth: {
            user: 'admin',
            pass: 'D1fficultP%40ssw0rd',
          },
        },
      }),
    ).toEqual({
      server: {
        port: 123,
        url: 'someurl',
        frontendUrl: 'http://localhost:3001',
      },
      db: {
        connectionString:
          'mongodb://myDBReader:*****@mongodb0.example.com:27017,mongodb1.example.com:27017,mongodb2.example.com:27017/?replicaSet=myRepl&authSource=admin',
        name: 'somename',
      },
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'admin',
          pass: '*****',
        },
      },
    })
  })
})
