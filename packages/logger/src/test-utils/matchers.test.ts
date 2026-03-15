import {toHaveLogged} from './matchers'

// Create a minimal Jest matcher context for testing the matcher directly
function runMatcher(
  received: {toString: () => string} | {_output: {toString: () => string}},
  expected: object[]
): {pass: boolean; message: () => string} {
  const context = {
    utils: {
      printReceived: (val: unknown) => JSON.stringify(val),
      printExpected: (val: unknown) => JSON.stringify(val),
      matcherHint: (hint: string) => hint,
    },
    equals: (a: unknown, b: unknown) => {
      try {
        expect(a).toStrictEqual(b)
        return true
      } catch {
        return false
      }
    },
  }

  return toHaveLogged.call(context as any, received, expected)
}

function makeStream(lines: object[]): {toString: () => string} {
  const content = `${lines.map(l => JSON.stringify(l)).join('\n')}\n`
  return {toString: () => content}
}

describe('toHaveLogged matcher', () => {
  it('returns pass: true when messages match', () => {
    const stream = makeStream([{level: 'info', message: 'hello'}])

    const result = runMatcher(stream, [{level: 'info', message: 'hello'}])

    expect(result.pass).toBe(true)
  })

  it('returns pass: false when a message does not match', () => {
    const stream = makeStream([{level: 'info', message: 'hello'}])

    const result = runMatcher(stream, [{level: 'error', message: 'goodbye'}])

    expect(result.pass).toBe(false)
    expect(result.message()).toContain('error')
  })

  it('returns pass: false when there are extra received messages', () => {
    const stream = makeStream([
      {level: 'info', message: 'first'},
      {level: 'info', message: 'second'},
    ])

    const result = runMatcher(stream, [{level: 'info', message: 'first'}])

    expect(result.pass).toBe(false)
    expect(result.message()).toContain('extra')
  })

  it('returns pass: false when fewer messages received than expected', () => {
    const stream = makeStream([{level: 'info', message: 'only one'}])

    const result = runMatcher(stream, [
      {level: 'info', message: 'only one'},
      {level: 'info', message: 'missing'},
    ])

    expect(result.pass).toBe(false)
  })

  it('accepts a Logger-like object with _output property', () => {
    const innerStream = makeStream([{level: 'warn', message: 'test'}])
    const loggerLike = {_output: innerStream}

    const result = runMatcher(loggerLike, [{level: 'warn', message: 'test'}])

    expect(result.pass).toBe(true)
  })
})
