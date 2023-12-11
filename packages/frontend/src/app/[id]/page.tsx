import React from 'react'
import { Entity } from '@/common/interfaces'
import { backendUrl, betterFetch } from '@/api'
import { NavigationBreadcrumbs } from '@/common/components/navigation/Breadcrumbs'
import Image from 'next/image'
import { Text2xlBold, TextSm, TextSmBold } from '@/common/components/Typography'
import { Card } from '@/common/components/Card'
import { PageContainer } from '@/common/components/PageContainer'
import { AlignCardCenter } from '@/common/components/AlignCardCenter'

export default async function EntityDetailsPage(params: {
  params: { id: string }
}) {
  const { id } = params.params
  const entity: Entity = await getEntityById(id)

  return (
    <PageContainer>
      <NavigationBreadcrumbs
        breadcrumbs={[
          { href: '/', title: 'Trusted Entities' },
          ...(entity
            ? [
                {
                  href: `/${id}`,
                  title: entity.name ?? id,
                },
              ]
            : []),
        ]}
      />
      <AlignCardCenter>
        <Card>
          <div className="flex flex-col gap-8">
            {entity.id ? (
              <>
                <div className="flex items-center flex-col gap-4">
                  <Image
                    src={entity.logo_url}
                    width={101}
                    height={101}
                    alt={entity.name}
                  />
                  <Text2xlBold>{entity.name}</Text2xlBold>
                </div>
                <div className="flex flex-col gap-4 items-left text-left">
                  <div className="flex flex-col gap-1">
                    <TextSm>Entity Name</TextSm>
                    <TextSmBold>{entity.name}</TextSmBold>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextSm>DIDs</TextSm>
                    <TextSmBold>
                      {entity.dids.map((did) => `${did}\n`)}
                    </TextSmBold>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextSm>Domain</TextSm>
                    <TextSmBold>{entity.domain}</TextSmBold>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextSm>Role</TextSm>
                    <div className="capitalize">
                      <TextSmBold>
                        {entity.role.map((roleItem) => `${roleItem}\n`)}
                      </TextSmBold>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextSm>Schema IDs</TextSm>
                    <TextSmBold>
                      {entity.credentials.map(
                        (credentialSchema) => `${credentialSchema}\n`,
                      )}
                    </TextSmBold>
                  </div>
                  <div className="flex flex-col gap-1">
                    <TextSm>Logo URL (SVG format)</TextSm>
                    <TextSmBold>{entity.logo_url}</TextSmBold>
                  </div>
                </div>
              </>
            ) : (
              <TextSm>
                Trusted Entity with id <strong>{id}</strong> does not exist
              </TextSm>
            )}
          </div>
        </Card>
      </AlignCardCenter>
    </PageContainer>
  )
}

async function getEntityById(id: string) {
  try {
    const trustRegistry = await betterFetch('GET', `${backendUrl}/api/registry`)
    const entity = trustRegistry.entities.find(
      (entity: Entity) => entity.id === id,
    )
    return entity || { id: null }
  } catch (error) {
    return { id: null }
  }
}
