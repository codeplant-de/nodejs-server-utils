import {IncomingMessage, ServerResponse} from 'node:http'
import type {Request, Response} from 'express'

export type CompatibleRequest = IncomingMessage | Request

export type CompatibleResponse = ServerResponse | Response

export type CompatibleLogger = {
  log: (logEntry: {level: string; message: string; [optionName: string]: any}) => unknown
}

export type LogLevel = string
