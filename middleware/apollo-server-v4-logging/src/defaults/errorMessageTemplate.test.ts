import {GraphQLError} from 'graphql'
import {defaultErrorMessageTemplate} from './errorMessageTemplate'

describe('defaults', () => {
  describe('defaultErrorMessageTemplate', () => {
    it('correctly handles default error case', () => {
      const mockReq = {operationName: 'TestOp'}

      const err = new GraphQLError('test-error')

      expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err])).toEqual(
        '-X GQL: error while processing TestOp'
      )
    })

    it('includes the error code if given', () => {
      const mockReq = {operationName: 'TestOp'}

      const err = new GraphQLError('test-error', {extensions: {code: 'MY_ERROR_CODE'}})

      expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err])).toEqual(
        '-X GQL: "MY_ERROR_CODE" error while processing TestOp'
      )
    })

    it('uses plural "errors" when multiple error codes are present', () => {
      const mockReq = {operationName: 'TestOp'}

      const err1 = new GraphQLError('err1', {extensions: {code: 'CODE_A'}})
      const err2 = new GraphQLError('err2', {extensions: {code: 'CODE_B'}})

      expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err1, err2])).toEqual(
        '-X GQL: "CODE_A", "CODE_B" errors while processing TestOp'
      )
    })

    it('only includes errors that have codes', () => {
      const mockReq = {operationName: 'TestOp'}

      const err1 = new GraphQLError('err1', {extensions: {code: 'HAS_CODE'}})
      const err2 = new GraphQLError('err2')

      expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err1, err2])).toEqual(
        '-X GQL: "HAS_CODE" error while processing TestOp'
      )
    })
  })
})
