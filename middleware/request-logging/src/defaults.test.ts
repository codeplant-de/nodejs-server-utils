import {createRequest} from 'node-mocks-http'

import {defaultRequestToMeta} from './defaults'

describe('defaults', () => {
  describe('defaultRequestToMeta', () => {
    it('handles a minimal request correctly', () => {
      const req = createRequest()
      // @ts-ignore
      req.originalUrl = undefined

      expect(defaultRequestToMeta(req)).toStrictEqual({
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        originalUrl: '',
        query: {},
        url: '',
      })
    })

    it('handles a request with search params correctly', () => {
      const req = createRequest({
        url: '/ping?foo=bar',
      })
      // @ts-ignore
      req.originalUrl = undefined

      expect(defaultRequestToMeta(req)).toStrictEqual({
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        originalUrl: '/ping?foo=bar',
        query: {
          foo: 'bar',
        },
        url: '/ping?foo=bar',
      })
    })

    it('filters authorization headers', () => {
      const req = createRequest({headers: {authorization: 'ultra-secure'}})

      expect(defaultRequestToMeta(req)).toStrictEqual({
        headers: {
          authorization: '[FILTERED]',
        },
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        originalUrl: '',
        query: {},
        url: '',
      })
    })

    it('uses pre-populated url parsing data (expressjs case)', () => {
      const req = createRequest({
        url: '/ping?foo=bar',
      })

      expect(defaultRequestToMeta(req)).toStrictEqual({
        headers: {},
        httpVersion: '[UNKNOWN]',
        method: 'GET',
        originalUrl: '/ping?foo=bar',
        query: {
          foo: 'bar',
        },
        url: '/ping?foo=bar',
      })
    })
  })
})
