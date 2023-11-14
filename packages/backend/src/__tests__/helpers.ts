// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createFakeDidResolver(correctDids: Record<string, any>) {
  return {
    resolveDid: (did: string) => {
      return correctDids[did]
    },
  }
}
