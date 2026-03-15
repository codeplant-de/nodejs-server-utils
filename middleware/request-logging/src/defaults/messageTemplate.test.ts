import {createRequest} from 'node-mocks-http'

import {defaultMessageTemplate} from './messageTemplate'

describe('defaults', () => {
  describe('defaultMessageTemplate', () => {
    it('returns a message with the HTTP method and URL', () => {
      const req = createRequest({method: 'GET', url: '/health'})

      expect(defaultMessageTemplate(req)).toBe('HTTP GET /health')
    })

    it('handles POST requests', () => {
      const req = createRequest({method: 'POST', url: '/api/users'})

      expect(defaultMessageTemplate(req)).toBe('HTTP POST /api/users')
    })

    it('includes query string in the URL', () => {
      const req = createRequest({method: 'GET', url: '/search?q=test'})

      expect(defaultMessageTemplate(req)).toBe('HTTP GET /search?q=test')
    })
  })
})
