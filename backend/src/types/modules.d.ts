declare module "express" {
  import * as core from "express-serve-static-core";
  function express(): express.Express;
  namespace express {
    export type Request = any;
    export type Response = any;
    export type NextFunction = any;
    export type Router = any;
    export function Router(options?: any): any;
    export function json(options?: any): any;
    export function urlencoded(options?: any): any;
    export interface Express {
      use(...handlers: any[]): any;
      get(path: string, ...handlers: any[]): any;
      post(path: string, ...handlers: any[]): any;
      put(path: string, ...handlers: any[]): any;
      delete(path: string, ...handlers: any[]): any;
      listen(port: number | string, callback?: () => void): any;
    }
  }
  export = express;
}

declare module "cors" {
  function cors(options?: any): any;
  export = cors;
}

declare module "dotenv" {
  export function config(options?: any): any;
}

declare module "@paypal/agent-toolkit" {
  export class PayPalAgentToolkit {
    constructor(config?: any);
    getTools(): any[];
  }
}

