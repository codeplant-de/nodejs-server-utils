import type {NextHandleFunction} from 'connect'
import express from 'express'
import type {Server} from 'node:http'
import percentile from 'percentile'
import {EntryType, performance, PerformanceEntry, PerformanceObserver} from 'perf_hooks'

const getSimpleApp = (
  middleware?: NextHandleFunction,
  {resDelay}: {resDelay?: number} = {}
): express.Express => {
  const app = express()
  middleware && app.use(middleware)
  app.get('/ping', (req, res) => {
    if (resDelay) {
      setTimeout(() => {
        res.status(200).json({foo: 'bar'})
      }, resDelay)
    } else {
      res.status(200).json({foo: 'bar'})
    }
  })

  return app
}

export const withSimpleApp =
  (middleware?: NextHandleFunction, options: {resDelay?: number} = {}) =>
  async (callback: (app: express.Express) => void | Promise<void>): Promise<void> => {
    const app = getSimpleApp(middleware, options)

    const server = await new Promise<Server>(resolve => {
      const s = app.listen(9987, () => {
        resolve(s)
      })
    })

    await callback(app)

    server.close()
  }

export type PerformanceResult = {
  avg: number
  min: number
  minIter: number
  max: number
  maxIter: number
  total: number
  count: number
  percentiles: Record<number, number>
}

const getPercentiles = (buckets: number[], durations: number[]): Record<number, number> => {
  const results = percentile(buckets, durations) as number[]

  return buckets.reduce<Record<number, number>>((memo, bucket, currentIndex) => {
    // eslint-disable-next-line no-param-reassign
    memo[bucket] = results[currentIndex]
    return memo
  }, {})
}

const getPerformanceObserver = (
  options:
    | {
        entryTypes: ReadonlyArray<EntryType>
        buffered?: boolean | undefined
      }
    | {
        type: EntryType
        buffered?: boolean | undefined
      }
): {result: () => Promise<PerformanceResult>; observer: PerformanceObserver} => {
  const perfEntries: PerformanceEntry[] = []
  const observer = new PerformanceObserver(list => {
    perfEntries.push(...list.getEntries())
  })
  observer.observe(options)

  return {
    observer,
    result: async (): Promise<PerformanceResult> => {
      const result = perfEntries.reduce<PerformanceResult>(
        (res, entry, i) => {
          // @ts-ignore too lazy to add type guards
          if (typeof options.type !== 'undefined' && options.type !== entry.entryType) {
            return res
          }
          if (
            typeof (options as {entryTypes: any[]}).entryTypes !== 'undefined' &&
            (options as {entryTypes: any[]}).entryTypes.includes(entry.entryType)
          ) {
            return res
          }
          if (res.min > entry.duration) {
            res.min = entry.duration
            res.minIter = i
          }
          if (res.max < entry.duration) {
            res.max = entry.duration
            res.maxIter = i
          }
          res.total += entry.duration

          return res
        },
        {
          avg: 0,
          min: Number.MAX_SAFE_INTEGER,
          minIter: 0,
          max: 0,
          maxIter: 0,
          total: 0,
          count: perfEntries.length,
          percentiles: [],
        }
      )
      result.avg = result.total / result.count
      result.percentiles = getPercentiles(
        [50, 80, 90],
        perfEntries.map(e => e.duration)
      )
      performance.clearMarks()
      performance.clearMeasures()
      observer.disconnect()

      return result
    },
  }
}

export const measureFunctionPerformance = async (
  httpCallThunk: () => Promise<unknown>
): Promise<PerformanceResult> => {
  // warmup cache
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await httpCallThunk()
  }

  const {result} = getPerformanceObserver({type: 'function'})
  const func = performance.timerify(httpCallThunk)

  // measure
  const till = Date.now() + 5e3
  while (Date.now() < till) {
    // eslint-disable-next-line no-await-in-loop
    await func()
  }

  return result()
}
