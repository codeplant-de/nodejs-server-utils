import {format} from 'logform'

const splatter = format.splat()

export const formatLikeWinston = (
  message: string,
  ...meta: any[]
): [unknown, Record<string, any>] => {
  const fakeInfoObj = {
    level: 'fake',
    message,
    splat: meta,
  }

  // collect error object at key "error" and "err"
  const error = meta.reduce<unknown>((res, metaElement: unknown) => {
    if (typeof metaElement === 'object' && metaElement !== null) {
      if ('error' in metaElement) {
        return metaElement.error
      }
      if ('err' in metaElement) {
        return metaElement.err
      }
    }
    return res
  }, undefined)

  const res = splatter.transform(fakeInfoObj)

  if (typeof res === 'boolean') {
    // eslint-disable-next-line no-console
    console.error('unexpected transform result')
    return [message, {}]
  }

  const {message: splattedMessage, level: _1, splat: _2, ...restMeta} = res

  return [splattedMessage, {...restMeta, error}]
}

export default formatLikeWinston
