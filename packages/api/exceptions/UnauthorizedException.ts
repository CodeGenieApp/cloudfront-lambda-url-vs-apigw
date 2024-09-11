import { ClientException } from '@/common/exceptions/ClientException'

export class UnauthorizedException extends ClientException {
  constructor({
    entityName,
    recordId,
    message = entityName || recordId ? `User doesn't have permission to ${entityName}: ${recordId}` : 'Unauthorized',
  }: { entityName?: string; recordId?: string; message?: string } = {}) {
    super({
      name: 'UnauthorizedException',
      message,
    })
  }
}
