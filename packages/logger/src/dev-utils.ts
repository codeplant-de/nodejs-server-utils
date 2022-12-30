import chalk from 'chalk'
import type {TransformableInfo} from 'logform'
import {MESSAGE} from 'triple-beam'
import {format} from 'winston'

const prettyPrintForDevelopment = (info: TransformableInfo): string => {
  const {message, level, timestamp, ...rest} = info

  let niceLevel = level.toUpperCase()
  switch (niceLevel) {
    case 'DEBUG':
      niceLevel = chalk.blue(chalk.bold(niceLevel))
      break
    case 'INFO':
      niceLevel = chalk.green(chalk.bold(niceLevel))
      break
    case 'WARN':
      niceLevel = chalk.yellow(chalk.bold(niceLevel))
      break
    case 'ERROR':
      niceLevel = chalk.red(chalk.bold(niceLevel))
      break
    default:
      niceLevel = chalk.bold(niceLevel)
      break
  }

  let restString = ''
  if (Object.keys(rest).length > 0) {
    restString = `\n${JSON.stringify(rest)}`
  }

  const requestId = info?.requestId ?? info?.meta?.requestId
  if (requestId) {
    return `${niceLevel} ${chalk.white(chalk.bold(message))} ${chalk.white(
      chalk.italic(requestId)
    )} ${restString}`
  }
  return `${niceLevel} ${chalk.white(chalk.bold(message))} ${restString}`
}

export const devFormat = format(message => ({
  ...message,
  [MESSAGE]: prettyPrintForDevelopment(message),
}))
