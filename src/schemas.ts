import type { JSONSchemaType } from 'ajv'

export type Organization = {
  organization: string
  profile: {
    avatar: string | null
    name: string
    about: string | null
    website: string | null
    tos: string | null
  }
}

export const organizationSchema: JSONSchemaType<Organization> = {
  type: 'object',
  properties: {
    organization: { type: 'string' },
    profile: {
      type: 'object',
      properties: {
        avatar: { type: 'string' },
        name: { type: 'string', minLength: 1 },
        about: { type: 'string' },
        website: { type: 'string' },
        tos: { type: 'string' },
      },
      required: ['name'],
    },
  },
  required: ['organization', 'profile'],
  additionalProperties: false,
}

export const workgroupSchema: JSONSchemaType<{}> = {
  type: 'object',
  properties: {},
  additionalProperties: false,
}

export const proposalSchema: JSONSchemaType<{}> = {
  type: 'object',
  properties: {},
  additionalProperties: false,
}

export const voteSchema: JSONSchemaType<{}> = {
  type: 'object',
  properties: {},
  additionalProperties: false,
}
