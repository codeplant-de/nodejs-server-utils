import type {MatcherContext} from '@jest/expect'
import {Logger} from '../types/logger'

interface LoggerMatchers<R = unknown> extends Record<string, any> {
  toHaveLogged(expectedMessages: object[]): R
}

declare global {
  namespace jest {
    interface Expect extends LoggerMatchers<any> {}
    interface Matchers<R> extends LoggerMatchers<R> {}
    interface InverseAsymmetricMatchers extends LoggerMatchers {}
  }
}

export function toHaveLogged(
  this: MatcherContext,
  testStream: {toString: () => string} | Logger,
  expectedMessages: object[]
): {pass: boolean; message: () => string} {
  const {printReceived, printExpected, matcherHint} = this.utils

  if ('_output' in testStream) {
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    testStream = testStream._output
  }

  const receivedMessages = testStream
    .toString()
    .split('\n')
    .slice(0, -1)
    .map(line => JSON.parse(line))

  for (let i = 0; i < expectedMessages.length; i += 1) {
    const expectedMessage = expectedMessages[i]
    const receivedMessage = receivedMessages[i]

    const linePass = this.equals(expectedMessage, receivedMessage)

    if (!linePass) {
      return {
        pass: false,
        message: () =>
          `${matcherHint('.toHaveLogged')}\n\nExpected logger to have printed:\n  ${printExpected(
            expectedMessage
          )}\n as ${i + 1} Message. Received:\n  ${printReceived(receivedMessage ?? '')}`,
      }
    }
  }

  if (receivedMessages.length > expectedMessages.length) {
    return {
      pass: false,
      message: () =>
        `${matcherHint('.toHaveLogged')}\n\nExpected logger to only print ${printExpected(
          expectedMessages.length
        )} Messages. Received extra messages:\n${receivedMessages
          .slice(expectedMessages.length)
          .map(extraMessage => `  ${printReceived(extraMessage)}`)
          .join('\n')}`,
    }
  }

  return {pass: true, message: () => ''}
}
