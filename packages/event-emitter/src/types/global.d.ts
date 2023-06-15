import {ApplicationEvents as PkgApplicationEvents} from './event-emitter'

declare module '@codeplant-de/event-emitter' {
  export interface ApplicationEvents extends PkgApplicationEvents {}
}
