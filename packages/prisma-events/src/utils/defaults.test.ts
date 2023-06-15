import {filterUndefined} from './defaults'

describe('utils > defaults', () => {
  describe('filterUndefined', () => {
    it('filters out keys with undefined properties', () => {
      expect(filterUndefined({a: 1, b: undefined})).toStrictEqual({a: 1})
    })
  })
})
