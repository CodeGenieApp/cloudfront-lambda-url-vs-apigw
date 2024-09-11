import { BaseException } from './BaseException'

export interface ClientExceptionParams {
  name?: string
  message?: string
  cause?: any
}
export class ClientException extends BaseException {
  constructor({ name = 'ClientException', message = 'Client error', cause }: ClientExceptionParams) {
    super({ message, cause, fault: 'client', name })
  }
}
