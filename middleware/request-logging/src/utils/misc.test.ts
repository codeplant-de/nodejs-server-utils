import {createRequest, createResponse} from 'node-mocks-http'
import type {IncomingMessage} from 'node:http'
import {mergeFormatters} from './index'
import {RequestToMetaFormatter, ResponseToMetaFormatter} from '../types/options'

describe('utils', () => {
  describe('mergeFormatters', () => {
    it('can merge RequestToMeta formatters', () => {
      const f1: RequestToMetaFormatter = (req: IncomingMessage) => ({method: req.method})
      const f2: RequestToMetaFormatter = (req: IncomingMessage) => ({url: req.url})

      const testRequest = createRequest({url: '/ping'})

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testRequest)).toStrictEqual({
        method: 'GET',
        url: '/ping',
      })
    })

    it('can merge ResponseToMeta formatters', () => {
      const f1: ResponseToMetaFormatter = res => ({statusCode: res.statusCode})
      const f2: ResponseToMetaFormatter = res => ({statusMessage: res.statusMessage})

      const testResponse = createResponse()

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testResponse)).toStrictEqual({
        statusCode: 200,
        statusMessage: 'OK',
      })
    })
  })
})
