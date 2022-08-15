import { createMachine, assign } from "xstate";
import { map } from "rxjs/operators";

import eventBus from "../../EventBus";
import { merge, Subject } from "rxjs";
import { SimpleInterpreter } from "../../utils/types";
import { UpdateTextureEvent } from "../../events/UpdateTextureEvent";

interface TextureMenuMachineContext {
  currentTextureUrl: string;
}

type TextureMenuMachineEvent =
  | { type: "DRAG"; data: string }
  | { type: "DROP" };

const updateTextureEvent$ = new Subject<UpdateTextureEvent>();
eventBus.trigger(updateTextureEvent$);

export const textureMenuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFswDsCuA6AlhANmAMQAiASgIIDiioADgPaw4AuODatIAHogIwBmAAxYArEIl8AbKIAsUqX1EAmKQBoQAT0TLlADiwSJw-QNnKA7HoEBfGxtSYsEAE4BDKFBxoopMgHkABS5GZjYOLl4EQT4sWVEBaVkhZXEBUQBOdS1+ZKwMgsKhKQEBAr5lO3sQNAYIOC5HbDxCEKZWdk4kHkRzDW1oqWUsaQULKXG+PnNRPTsHdGxXDy8fNrDOyMRSkWm9WVkrFKkhDIP+-ilZLAUxicVp1LnqpvWOiO6ovj0L6Oe7IA */
  createMachine(
    {
      context: { currentTextureUrl: "" },
      tsTypes: {} as import("./textureMenuMachine.typegen").Typegen0,
      schema: {
        context: {} as TextureMenuMachineContext,
        events: {} as TextureMenuMachineEvent,
      },
      predictableActionArguments: true,
      invoke: {
        src: "dragEnd$",
      },
      id: "menu",
      initial: "idle",
      states: {
        idle: {
          on: {
            DRAG: {
              actions: "setCurrentMenuItem",
              target: "dragging",
            },
          },
        },
        dragging: {
          on: {
            DROP: {
              actions: "updateSceneTexture",
              target: "idle",
            },
          },
        },
      },
    },
    {
      actions: {
        setCurrentMenuItem: assign({
          currentTextureUrl: (_ctx, event) => event.data,
        }),
        updateSceneTexture: (ctx) =>
          updateTextureEvent$.next(
            new UpdateTextureEvent(ctx.currentTextureUrl)
          ),
      },
      services: {
        dragEnd$: () =>
          merge(
            eventBus.ofType<DragEvent>("dragend"),
            eventBus.ofType<PointerEvent>("pointerup")
          ).pipe(
            map(() => ({
              type: "DROP",
            }))
          ),
      },
    }
  );

export type TextureMenuService = SimpleInterpreter<
  TextureMenuMachineContext,
  TextureMenuMachineEvent
>;
