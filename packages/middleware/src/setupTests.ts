// @ts-expect-error weird "file ... is not a module error"
import * as matchers from 'jest-extended'

expect.extend(matchers)
