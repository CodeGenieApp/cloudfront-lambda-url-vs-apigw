export function unique<ArrayType>(array: Array<ArrayType>) {
  if (!array?.length) {
    return []
  }

  if (isObject(array[0])) {
    return getUniqueArrayOfObjects(array)
  }

  return Array.from(new Set(array))
}

function getUniqueArrayOfObjects<ArrayType>(array: Array<ArrayType>) {
  const uniqueMap = new Map()

  array.forEach((obj) => {
    const key = JSON.stringify(obj)
    uniqueMap.set(key, obj)
  })

  const uniqueArray = [...uniqueMap.values()]

  return uniqueArray
}

function isObject(input) {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}
