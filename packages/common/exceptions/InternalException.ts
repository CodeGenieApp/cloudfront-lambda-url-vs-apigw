import { BaseException } from './BaseException'

export interface InternalExceptionParams {
  name?: string
  message?: string
  cause?: any
}
export class InternalException extends BaseException {
  constructor({ name = 'InternalException', message = 'Internal error', cause }: InternalExceptionParams) {
    super({ message, cause, fault: 'internal', name })
  }
}
