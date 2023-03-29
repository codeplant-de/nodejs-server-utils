import express from 'express'
import request from 'supertest'
import httpContextMiddleware from '../middleware'
import {storeInHttpContext, getFromHttpContext} from '../read-write'
import {createChildContextStorage} from '../context'

describe('http-context-provider-middleware', () => {
  it('allows writing and later reading of context in a express session', async () => {
    const app = express()
    app.use(httpContextMiddleware)

    app.use((req, res, next) => {
      storeInHttpContext('foo', 'bar')
      next()
    })

    app.get('/test', (req, res) => {
      const fooFromCtx = getFromHttpContext('foo')
      res.json({foo: fooFromCtx})
    })

    await request(app).get('/test').expect(200).expect({foo: 'bar'})
  })

  it('does not spill context information to other call stacks', async () => {
    const app = express()
    app.use(httpContextMiddleware)

    const serviceTwo = (): unknown => getFromHttpContext('service')

    const serviceOne = (): void => {
      storeInHttpContext('service', 'one')

      console.log(serviceTwo())
    }

    const serviceThree = (): unknown => getFromHttpContext('service')

    app.get('/test', (req, res) => {
      createChildContextStorage(() => serviceOne())

      res.json({foo: serviceThree() ?? 'unknown'})
    })

    await request(app).get('/test').expect(200).expect({foo: 'unknown'})
  })
})
