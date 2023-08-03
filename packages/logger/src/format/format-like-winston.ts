import {format} from 'logform'

const splatter = format.splat()

export const formatLikeWinston = (
  message: string,
  ...meta: any[]
): [string, Record<string, any>] => {
  const fakeInfoObj = {
    level: 'fake',
    message,
    splat: meta,
  }

  const res = splatter.transform(fakeInfoObj)

  if (typeof res === 'boolean') {
    // eslint-disable-next-line no-console
    console.error('unexpected transform result')
    return [message, {}]
  }

  const {message: splattedMessage, level: _1, splat: _2, ...restMeta} = res

  return [splattedMessage, restMeta]
}

export default formatLikeWinston
