import {IncomingMessage, ServerResponse} from 'node:http'
import type {Request, Response} from 'express'

export type CompatibleRequest = IncomingMessage | Request

export type CompatibleResponse = ServerResponse | Response

export type CompatibleLogger = {
  log: (
    // @todo somehow infer level type from level function
    logEntry: {level: any; message: string; [optionName: string]: any},
    ...meta: any[]
  ) => unknown
}

export type LogLevel = string
