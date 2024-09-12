import { debug } from '../debug'

export type Fault = 'client' | 'internal'
export interface BaseExceptionConstructorParams {
  name: string
  message: string
  fault: Fault
  cause?: any
}

export class BaseException extends Error {
  readonly fault: Fault
  constructor({ name, message, fault, cause }: BaseExceptionConstructorParams) {
    super(message, { cause })
    this.fault = fault
    this.name = name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseException)
    }

    debug('baseException', {
      exceptionClassName: name,
      exceptionFault: fault,
      exceptionMessage: message,
    })
  }
}
