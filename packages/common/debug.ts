export interface ObjectMap {
  [name: string]: any
}

export function debug(logName, structuredLog: ObjectMap) {
  console.debug({
    ...structuredLog,
    logName,
  })
}
