# https://docs.tilt.dev/
docker_build(
  'local/ssi-trust-registry',
  context='.',
  dockerfile='Dockerfile',
  live_update=[
    sync('./', '/app'),
    run('yarn install', trigger=['./package.json', './yarn.lock']),
    run('yarn build', trigger=['./src']),
    restart_container()
  ],
  build_args={
    'NODE_ENV': 'production'
  }
)

docker_compose('docker-compose.yaml')
