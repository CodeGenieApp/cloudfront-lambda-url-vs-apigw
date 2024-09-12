import { getIsUserAdmin } from '../controllers/user'
import { RecordNotFoundException } from '../exceptions/RecordNotFoundException'
import { UnauthorizedException } from '../exceptions/UnauthorizedException'

export function checkPermission({ asUser, createdByUserId, recordId, entityName }) {
  if (!createdByUserId) {
    throw new RecordNotFoundException({ recordType: entityName, recordId })
  }

  const isUserAdmin = getIsUserAdmin({ user: asUser })
  const isCreatedByUser = createdByUserId === asUser.userId

  if (!isCreatedByUser && !isUserAdmin) {
    throw new UnauthorizedException({ entityName, recordId })
    /*
      NOTE: You may not want to leak the fact that the record exists at all. Alternative:
      throw new RecordNotFoundException({ recordType: entityName, recordId })
    */
  }
}

export function checkIsAdmin({ user, entityName }: { user: any; entityName?: string }) {
  if (!getIsUserAdmin({ user })) {
    throw new UnauthorizedException({ entityName })
  }
}

export function checkOrgPermission({ asUser, orgId }) {
  if (!orgId) {
    throw new RecordNotFoundException({ recordType: 'Organization', recordId: orgId })
  }

  const isUserOrg = orgId === asUser.orgId

  if (!isUserOrg) {
    throw new UnauthorizedException({ entityName: 'Organization' })
  }
}
