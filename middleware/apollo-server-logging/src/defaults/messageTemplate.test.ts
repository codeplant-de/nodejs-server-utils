import {defaultMessageTemplate} from './messageTemplate'

describe('defaults', () => {
  describe('defaultMessageTemplate', () => {
    it('returns a message containing the operation name', () => {
      const mockReq = {operationName: 'TestOp'}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed TestOp')
    })

    it('handles undefined operation name', () => {
      const mockReq = {operationName: undefined}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed undefined')
    })

    it('handles empty string operation name', () => {
      const mockReq = {operationName: ''}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed ')
    })

    it('handles null operation name', () => {
      const mockReq = {operationName: null as any}

      expect(defaultMessageTemplate(mockReq, {}, {})).toEqual('-> GQL: processed null')
    })
  })
})
