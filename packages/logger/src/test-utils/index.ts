import {toHaveLogged} from './matchers'

export * from './createTestOutput'
export * from './matchers'

if (typeof expect !== 'undefined') {
  expect.extend({toHaveLogged})
}
