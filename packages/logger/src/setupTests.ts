import * as matchers from 'jest-extended'
import {toHaveLogged} from './test-utils/matchers'

expect.extend(matchers)
expect.extend({toHaveLogged})
