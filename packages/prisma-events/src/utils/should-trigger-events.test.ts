import shouldTriggerEventFactory from './should-trigger-event'

describe('utils > shouldTriggerEventFactory', () => {
  it('properly handles complex allow list', () => {
    const shouldTriggerEvent = shouldTriggerEventFactory([
      {operations: ['o1', 'o2']},
      {operation: 'o3'},
      {model: 'm1'},
      {model: 'm2', operation: 'o4'},
    ])

    // undefined model
    expect(shouldTriggerEvent(undefined, 'o4')).toBeFalsy()
    expect(shouldTriggerEvent(undefined, 'o2')).toBeTruthy()

    // defined model with all operations allowed
    expect(shouldTriggerEvent('m1', 'o99')).toBeTruthy()

    // defined model with some operations allowed
    expect(shouldTriggerEvent('m2', 'o99')).toBeFalsy()
    expect(shouldTriggerEvent('m2', 'o4')).toBeTruthy() // explicitly allowed
    expect(shouldTriggerEvent('m2', 'o1')).toBeTruthy() // globally allowed

    // defined model, nothing expl allowed
    expect(shouldTriggerEvent('m99', 'o99')).toBeFalsy()
    expect(shouldTriggerEvent('m99', 'o4')).toBeFalsy()
    expect(shouldTriggerEvent('m99', 'o1')).toBeTruthy() // globally allowed
  })

  it('properly handles complex block list', () => {
    const shouldTriggerEvent = shouldTriggerEventFactory(
      [],
      [{operations: ['o1', 'o2']}, {operation: 'o3'}, {model: 'm1'}, {model: 'm2', operation: 'o4'}]
    )

    // undefined model
    expect(shouldTriggerEvent(undefined, 'o4')).toBeTruthy() // only blocked for m2
    expect(shouldTriggerEvent(undefined, 'o2')).toBeFalsy() // globally blocked

    // defined model with all operations blocked
    expect(shouldTriggerEvent('m1', 'o99')).toBeFalsy()

    // defined model with some operations blocked
    expect(shouldTriggerEvent('m2', 'o99')).toBeTruthy()
    expect(shouldTriggerEvent('m2', 'o4')).toBeFalsy() // explicitly blocked
    expect(shouldTriggerEvent('m2', 'o1')).toBeFalsy() // globally blocked

    // defined model, nothing expl allowed
    expect(shouldTriggerEvent('m99', 'o99')).toBeTruthy()
    expect(shouldTriggerEvent('m99', 'o4')).toBeTruthy() // only blocked for m2
    expect(shouldTriggerEvent('m99', 'o1')).toBeFalsy() // globally blocked
  })
})
