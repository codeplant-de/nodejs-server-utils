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

      serviceTwo()
    }

    const serviceThree = (): unknown => getFromHttpContext('service')

    app.get('/test', (req, res) => {
      createChildContextStorage(() => serviceOne())

      res.json({foo: serviceThree() ?? 'unknown'})
    })

    await request(app).get('/test').expect(200).expect({foo: 'unknown'})
  })

  it('preserves context across async route handlers', async () => {
    const app = express()
    app.use(httpContextMiddleware)

    app.use((req, res, next) => {
      storeInHttpContext('userId', 'user-123')
      next()
    })

    app.get('/test', async (req, res) => {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 10)
      })
      const userId = getFromHttpContext('userId')
      res.json({userId})
    })

    await request(app).get('/test').expect(200).expect({userId: 'user-123'})
  })

  it('isolates context between concurrent requests', async () => {
    const app = express()
    app.use(httpContextMiddleware)

    app.get('/test', async (req, res) => {
      const id = req.query.id as string
      storeInHttpContext('requestId', id)

      // Stagger responses to ensure overlapping execution
      const delay = id === '1' ? 50 : 10
      await new Promise<void>(resolve => {
        setTimeout(resolve, delay)
      })

      const storedId = getFromHttpContext('requestId')
      res.json({requestId: storedId})
    })

    const [res1, res2] = await Promise.all([
      request(app).get('/test?id=1'),
      request(app).get('/test?id=2'),
    ])

    expect(res1.body).toEqual({requestId: '1'})
    expect(res2.body).toEqual({requestId: '2'})
  })
})
