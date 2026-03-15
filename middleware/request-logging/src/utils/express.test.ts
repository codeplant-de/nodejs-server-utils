import {createRequest} from 'node-mocks-http'
import {IncomingMessage} from 'node:http'
import {Socket} from 'node:net'
import {hasOriginalUrl, getIpFromExpressRequest} from './express'

describe('utils', () => {
  describe('hasOriginalUrl', () => {
    it('returns true for an express request with originalUrl', () => {
      const req = createRequest({url: '/test'})
      expect(hasOriginalUrl(req)).toBe(true)
    })

    it('returns false for a plain IncomingMessage without originalUrl', () => {
      const req = new IncomingMessage(new Socket())
      expect(hasOriginalUrl(req)).toBe(false)
    })

    it('returns false for a plain object without originalUrl', () => {
      expect(hasOriginalUrl({url: '/test'})).toBe(false)
    })

    it('returns true for a plain object with originalUrl', () => {
      expect(hasOriginalUrl({originalUrl: '/test'})).toBe(true)
    })

    it('returns true when originalUrl is an empty string', () => {
      expect(hasOriginalUrl({originalUrl: ''})).toBe(true)
    })
  })

  describe('getIpFromExpressRequest', () => {
    it('returns req.ip if available', () => {
      const req = createRequest({ip: '192.168.1.1'})
      expect(getIpFromExpressRequest(req)).toBe('192.168.1.1')
    })

    it('returns the first x-forwarded-for ip when req.ip is falsy and header function exists', () => {
      const req = createRequest({
        headers: {'x-forwarded-for': '10.0.0.1, 10.0.0.2'},
      })
      // Override ip to be falsy so it falls through to header check
      Object.defineProperty(req, 'ip', {value: '', writable: true})
      expect(getIpFromExpressRequest(req)).toBe('10.0.0.1')
    })

    it('returns a single x-forwarded-for ip correctly', () => {
      const req = createRequest({
        headers: {'x-forwarded-for': '10.0.0.1'},
      })
      Object.defineProperty(req, 'ip', {value: '', writable: true})
      expect(getIpFromExpressRequest(req)).toBe('10.0.0.1')
    })

    it('falls back to socket.remoteAddress when header function exists but x-forwarded-for is absent', () => {
      const req = createRequest()
      Object.defineProperty(req, 'ip', {value: '', writable: true})
      req.socket = {remoteAddress: '172.16.0.1'} as any
      expect(getIpFromExpressRequest(req)).toBe('172.16.0.1')
    })

    it('returns socket.remoteAddress when req has no header function', () => {
      const req = {socket: {remoteAddress: '127.0.0.1'}} as any
      expect(getIpFromExpressRequest(req)).toBe('127.0.0.1')
    })

    it('returns null when no ip source is available', () => {
      const req = {socket: {}} as any
      expect(getIpFromExpressRequest(req)).toBeNull()
    })

    it('returns null when there is no socket at all', () => {
      const req = {} as any
      expect(getIpFromExpressRequest(req)).toBeNull()
    })
  })
})
