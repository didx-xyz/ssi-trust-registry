# https://docs.tilt.dev/
docker_build(
  'local/ssi-trust-registry',
  context='.',
  dockerfile='Dockerfile',
  live_update=[
    sync('./', '/app'),
    run('yarn install', trigger=['./package.json', './yarn.lock']),
    run('touch ./src/main.ts', trigger=['./src'])
  ],
  build_args={
    'NODE_ENV': 'development'
  }
)

docker_compose('docker-compose.yaml')
