import {format} from 'logform'

export type DynamicContextMetaFormatOptions = {
  key?: false | string
  metaThunk: () => object
}

/**
 * Winston Format to add dynamic metadata to the info object based on context data
 */
export default format((info, opts: DynamicContextMetaFormatOptions) => {
  if (opts.key) {
    // eslint-disable-next-line no-param-reassign
    info[opts.key] = opts.metaThunk()
  } else {
    Object.assign(info, opts.metaThunk())
  }

  return info
})
