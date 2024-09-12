import { ClientException } from '@/common/exceptions/ClientException'

export class UnauthenticatedException extends ClientException {
  constructor({ message = 'Unauthenticated' }: { message?: string } = {}) {
    super({
      name: 'UnauthenticatedException',
      message,
    })
  }
}
