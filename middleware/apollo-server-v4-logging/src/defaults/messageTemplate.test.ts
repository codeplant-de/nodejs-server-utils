import {defaultMessageTemplate} from './messageTemplate'

describe('defaults', () => {
  describe('defaultMessageTemplate', () => {
    it('correctly formats the message with operationName', () => {
      const mockReq = {operationName: 'TestOp'}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed TestOp')
    })

    it('handles undefined operationName', () => {
      const mockReq = {operationName: undefined}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed undefined')
    })

    it('handles null operationName', () => {
      const mockReq = {operationName: null} as any

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed null')
    })
  })
})
