import type { PreTokenGenerationTriggerEvent } from 'aws-lambda'
import { createUser } from '@/api/controllers/user'
import { UserEntity, UserSchemaType } from '@/api/models/User'

export async function handler(event: PreTokenGenerationTriggerEvent) {
  const { sub: userId, email, name } = event.request.userAttributes
  const existingUser = await UserEntity.get({ userId })
  let user = existingUser.Item as UserSchemaType | null

  if (!user) {
    const newUser = await createUser({
      asUser: {
        role: 'Admin',
      },
      userId,
      user: {
        name,
        email,
        role: 'User',
      },
    })

    user = newUser.data
  }

  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      userId: user!.userId,
      role: user!.role,
    },
  }

  return event
}
