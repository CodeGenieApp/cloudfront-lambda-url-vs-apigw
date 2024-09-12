import { ClientException } from '@/common/exceptions/ClientException'
import type { StringMap } from '@/common/types'

export default class UnsupportedIdentityProviderNameException extends ClientException {
  constructor({ providerName, validIdentityProviderNamesMap }: { providerName: string; validIdentityProviderNamesMap: StringMap }) {
    super({
      name: 'UnsupportedIdentityProviderNameException',
      message: `Unsupported Identity Provider: ${providerName}. Valid Identity Providers: ${JSON.stringify(validIdentityProviderNamesMap)}.`,
    })
  }
}
