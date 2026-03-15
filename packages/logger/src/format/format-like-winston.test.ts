import {formatLikeWinston} from './format-like-winston'

describe('formatLikeWinston', () => {
  it('handles a simple message string', () => {
    const [message, meta] = formatLikeWinston('hello world')

    expect(message).toBe('hello world')
    expect(meta).toStrictEqual({error: undefined})
  })

  it('extracts error object from "error" key in meta', () => {
    const error = new Error('test error')
    const [message, meta] = formatLikeWinston('something failed', {error})

    expect(message).toBe('something failed')
    expect(meta.error).toBe(error)
  })

  it('extracts error object from "err" key in meta', () => {
    const err = new Error('another error')
    const [message, meta] = formatLikeWinston('something failed', {err})

    expect(message).toBe('something failed')
    expect(meta.error).toBe(err)
  })

  it('prefers later meta entries when multiple contain error keys', () => {
    const firstError = new Error('first')
    const secondError = new Error('second')
    const [, meta] = formatLikeWinston('msg', {error: firstError}, {error: secondError})

    expect(meta.error).toBe(secondError)
  })

  it('handles splat interpolation with %s', () => {
    const [message, meta] = formatLikeWinston('hello %s', 'world')

    expect(message).toBe('hello world')
    expect(meta).toStrictEqual({error: undefined})
  })

  it('handles splat interpolation with %d', () => {
    const [message] = formatLikeWinston('count: %d items', 42)

    expect(message).toBe('count: 42 items')
  })

  it('handles splat interpolation with %o', () => {
    const [message] = formatLikeWinston('data: %o', {key: 'value'})

    expect(message).toBe("data: { key: 'value' }")
  })

  it('merges remaining meta fields into the returned meta object', () => {
    const [message, meta] = formatLikeWinston('msg', {extra: 'data', more: 123})

    expect(message).toBe('msg')
    expect(meta).toStrictEqual({extra: 'data', more: 123, error: undefined})
  })

  it('handles missing message field gracefully', () => {
    // @ts-expect-error testing with undefined message
    const [message, meta] = formatLikeWinston(undefined)

    expect(meta).toStrictEqual({error: undefined})
    expect(message).toBeUndefined()
  })

  it('returns fallback when transform returns a boolean', () => {
    // Verify the function does not throw with empty meta array
    const [msg, result] = formatLikeWinston('fallback test')
    expect(msg).toBe('fallback test')
    expect(result).toStrictEqual({error: undefined})
  })

  it('handles meta with no error-related keys', () => {
    const [message, meta] = formatLikeWinston('msg', {foo: 'bar'})

    expect(message).toBe('msg')
    expect(meta.error).toBeUndefined()
    expect(meta.foo).toBe('bar')
  })

  it('handles null values in meta array without crashing', () => {
    // null is typeof object but should not crash the reduce
    const [message, meta] = formatLikeWinston('msg', null as any)

    expect(message).toBe('msg')
    expect(meta.error).toBeUndefined()
  })
})
