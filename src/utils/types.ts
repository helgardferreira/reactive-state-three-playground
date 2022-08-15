import { EventObject, Interpreter } from "xstate";

export interface IEvent<T> {
  type: string;
  data: T;
}

export type EventLike<T = any> = Event | IEvent<T>;

export type SimpleInterpreter<TContext, TEvent extends EventObject> = Interpreter<
  TContext,
  any,
  TEvent,
  any,
  any
>;
