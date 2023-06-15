export interface ContainerType {
  get(someClass: any): any | Promise<any>
}
export type ContainerGetter = () => ContainerType
