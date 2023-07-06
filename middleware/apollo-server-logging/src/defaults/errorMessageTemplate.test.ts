import {GraphQLError} from 'graphql'
import {ApolloError} from 'apollo-server-errors'
import {defaultErrorMessageTemplate} from './errorMessageTemplate'

describe('defaults', () => {
  describe('defaultErrorMessageTemplate', () => {
    describe('GraphQLError', () => {
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
    })

    describe('ApolloError', () => {
      it('correctly handles default error case', () => {
        const mockReq = {operationName: 'TestOp'}

        const err = new ApolloError('test-error')

        expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err])).toEqual(
          '-X GQL: error while processing TestOp'
        )
      })

      it('includes the error code if given', () => {
        const mockReq = {operationName: 'TestOp'}

        const err = new ApolloError('test-error', 'MY_ERROR_CODE')

        expect(defaultErrorMessageTemplate(mockReq, {}, {}, [err])).toEqual(
          '-X GQL: "MY_ERROR_CODE" error while processing TestOp'
        )
      })
    })
  })
})
