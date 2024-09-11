import * as readline from 'readline'
import { getUserByEmail } from '@/api/controllers/user'
import { UserEntity } from '@/api/models/User'

export async function getEmailInputFromOperator(): Promise<{ email: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const email = await new Promise<string>((resolve) => rl.question('Enter user email: ', resolve))

  rl.close()
  return { email }
}

interface SetUserAdminParams {
  email: string
}

async function setUserAdmin({ email }: SetUserAdminParams) {
  const user = await getUserByEmail({ email })

  // NOTE: can't use updateUser since role is marked as immutable
  const updatedUser = await UserEntity.update(
    {
      userId: user.userId,
      role: 'Admin',
    },
    { returnValues: 'ALL_NEW' },
  )
  console.info(`User ${email} is now an Admin.`)
  return updatedUser
}

async function main() {
  const { email } = await getEmailInputFromOperator()
  await setUserAdmin({ email })
}

main()
