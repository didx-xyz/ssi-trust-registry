import { hideSecrets } from './config'

describe('hideSecrets', () => {
  test('hides password in db connection string', () => {
    expect(
      // @ts-expect-error we just need part of the config to test the function
      hideSecrets({
        server: {
          port: 123,
          url: 'someurl',
        },
        db: {
          connectionString:
            'mongodb://myDBReader:D1fficultP%40ssw0rd@mongodb0.example.com:27017,mongodb1.example.com:27017,mongodb2.example.com:27017/?replicaSet=myRepl&authSource=admin',
          name: 'somename',
        },
      }),
    ).toEqual({
      server: {
        port: 123,
        url: 'someurl',
      },
      db: {
        connectionString:
          'mongodb://myDBReader:*****@mongodb0.example.com:27017,mongodb1.example.com:27017,mongodb2.example.com:27017/?replicaSet=myRepl&authSource=admin',
        name: 'somename',
      },
    })
  })
})
