import {createRequest} from 'node-mocks-http'

import {defaultRequestToMetaFormatter} from './requestToMetaFormatter'

describe('defaults', () => {
  describe('defaultRequestToMetaFormatter', () => {
    it('handles a minimal request correctly', () => {
      const req = createRequest({ip: '1.1.1.1'})
      // @ts-ignore
      req.originalUrl = undefined

      expect(defaultRequestToMetaFormatter(req)).toStrictEqual({
        clientIp: '1.1.1.1',
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        query: {},
        url: '',
      })
    })

    it('handles a request with search params correctly', () => {
      const req = createRequest({
        url: '/ping?foo=bar',
        ip: '1.1.1.1',
      })
      // @ts-ignore
      req.originalUrl = undefined

      expect(defaultRequestToMetaFormatter(req)).toStrictEqual({
        clientIp: '1.1.1.1',
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        query: {
          foo: 'bar',
        },
        url: '/ping?foo=bar',
      })
    })

    it('filters authorization headers', () => {
      const req = createRequest({headers: {authorization: 'ultra-secure'}, ip: '1.1.1.1'})

      expect(defaultRequestToMetaFormatter(req)).toStrictEqual({
        clientIp: '1.1.1.1',
        headers: {
          authorization: '[FILTERED]',
        },
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        query: {},
        url: '',
      })
    })

    it('uses pre-populated url parsing data (expressjs case)', () => {
      const req = createRequest({
        url: '/ping?foo=bar',
        ip: '1.1.1.1',
      })

      expect(defaultRequestToMetaFormatter(req)).toStrictEqual({
        clientIp: '1.1.1.1',
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        query: {
          foo: 'bar',
        },
        url: '/ping?foo=bar',
      })
    })
  })
})
