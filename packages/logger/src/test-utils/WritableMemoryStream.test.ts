import {WritableMemoryStream} from './WritableMemoryStream'

describe('WritableMemoryStream', () => {
  it('writes and stores string chunks', () => {
    const stream = new WritableMemoryStream()

    stream.write('hello')

    expect(stream.toString()).toBe('hello')
  })

  it('writes and stores buffer chunks', () => {
    const stream = new WritableMemoryStream()

    stream.write(Buffer.from('buffer content'))

    expect(stream.toString()).toBe('buffer content')
  })

  it('handles multiple sequential writes', () => {
    const stream = new WritableMemoryStream()

    stream.write('first ')
    stream.write('second ')
    stream.write('third')

    expect(stream.toString()).toBe('first second third')
  })

  it('clear() resets the buffer', () => {
    const stream = new WritableMemoryStream()

    stream.write('some data')
    expect(stream.toString()).toBe('some data')

    stream.clear()
    expect(stream.toString()).toBe('')
  })

  it('accepts new writes after clear()', () => {
    const stream = new WritableMemoryStream()

    stream.write('before clear')
    stream.clear()
    stream.write('after clear')

    expect(stream.toString()).toBe('after clear')
  })

  it('toString() defaults to utf-8 encoding', () => {
    const stream = new WritableMemoryStream()
    const unicodeText = 'hello \u00e4\u00f6\u00fc'

    stream.write(unicodeText)

    expect(stream.toString()).toBe(unicodeText)
    expect(stream.toString('utf-8')).toBe(unicodeText)
  })

  it('toString() supports alternate encodings', () => {
    const stream = new WritableMemoryStream()
    const content = 'hello'

    stream.write(content)

    const hexResult = stream.toString('hex')
    expect(hexResult).toBe(Buffer.from(content).toString('hex'))
  })

  it('starts with an empty buffer', () => {
    const stream = new WritableMemoryStream()

    expect(stream.toString()).toBe('')
  })

  it('accepts WritableOptions in constructor', () => {
    const stream = new WritableMemoryStream({highWaterMark: 1024})

    stream.write('test')

    expect(stream.toString()).toBe('test')
  })
})
