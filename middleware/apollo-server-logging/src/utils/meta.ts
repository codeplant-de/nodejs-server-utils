export const assignMeta = (
  meta: Record<string, unknown>,
  data: Record<string, unknown>,
  propertyKey?: string | undefined | null | false
): void => {
  if (propertyKey) {
    const prevData = meta[propertyKey]
    if (prevData && typeof prevData === 'object') {
      Object.assign(prevData, data)
    } else {
      // eslint-disable-next-line no-param-reassign
      meta[propertyKey] = data
    }
  } else {
    Object.assign(meta, data)
  }
}

export const assignArrayMeta = (
  meta: Record<string, unknown>,
  data: unknown[],
  propertyKey: string
): void => {
  const prevData = meta[propertyKey]
  if (prevData && Array.isArray(prevData)) {
    prevData.push(...data)
  } else {
    // eslint-disable-next-line no-param-reassign
    meta[propertyKey] = data
  }
}
