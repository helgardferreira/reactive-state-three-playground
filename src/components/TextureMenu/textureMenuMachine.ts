import { createMachine, assign } from "xstate";
import { filter, map } from "rxjs/operators";

import eventBus from "../../EventBus";
import { merge, Subject } from "rxjs";
import { SimpleInterpreter } from "../../utils/types";
import { UpdateTextureEvent } from "../../events/UpdateTextureEvent";

interface TextureMenuMachineContext {
  pastTextureUrls: string[];
  currentTextureUrl: string;
  futureTextureUrls: string[];
}

type TextureMenuMachineEvent =
  | { type: "DRAG"; data: string }
  | { type: "DROP" }
  | { type: "UNDO" }
  | { type: "REDO" };

const updateTextureEvent$ = new Subject<UpdateTextureEvent>();
eventBus.trigger(updateTextureEvent$);

export const textureMenuMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFswDsCuA6AlhANmAMQAiASgIIDiioADgPaw4AuODatIAHogIwBmAAxYArEIl8AbKIAsUqX1EAmKQBoQAT0TLlADiwSJw-QNnKA7HoEBfGxtSYsEAE4BDKFBxoopMgHkABS5GZjYOLl4EQT4sWVEBaVkhZXEBUQBOdS1+ZKwMgsKhKQEBAr5lO3sQNAYIOC5HbDxCEKZWdk4kHkRzDW1oqWUsaQULKXG+PnNRPTsHdGxXDy8fNrDOyMRSkWm9WVkrFKkhDIP+-ilZLAUxicVp1LnqpvWOiO6ovj0L6Oe7IA */
  createMachine(
    {
      context: {
        pastTextureUrls: [],
        currentTextureUrl: "",
        futureTextureUrls: [],
      },
      tsTypes: {} as import("./textureMenuMachine.typegen").Typegen0,
      schema: {
        context: {} as TextureMenuMachineContext,
        events: {} as TextureMenuMachineEvent,
      },
      predictableActionArguments: true,
      invoke: [
        {
          src: "dragEnd$",
        },
        {
          src: "undo$",
        },
      ],
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
              actions: ["updatePast", "updateSceneTexture"],
              target: "idle",
            },
          },
        },
      },
      on: {
        UNDO: {
          actions: ["undo", "updateSceneTexture"],
        },
        REDO: {
          actions: ["redo", "updateSceneTexture"],
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
        updatePast: assign({
          pastTextureUrls: (ctx: TextureMenuMachineContext, event) => {
            return [...ctx.pastTextureUrls, ctx.currentTextureUrl];
          },
          futureTextureUrls: [],
        }),
        undo: assign((ctx, event) => {
          const newPastUrls = [...ctx.pastTextureUrls];
          const newCurrentUrl = newPastUrls.pop();
          const newFutureUrls = [
            ctx.currentTextureUrl,
            ...ctx.futureTextureUrls,
          ];

          return {
            currentTextureUrl: newCurrentUrl,
            pastTextureUrls: newPastUrls,
            futureTextureUrls: newFutureUrls,
          };
        }),
        redo: assign((ctx, event) => {
          const newFutureUrls = [...ctx.futureTextureUrls];
          const newCurrentUrl = newFutureUrls.shift();
          const newPastUrls = [...ctx.pastTextureUrls, ctx.currentTextureUrl];

          return {
            currentTextureUrl: newCurrentUrl,
            pastTextureUrls: newPastUrls,
            futureTextureUrls: newFutureUrls,
          };
        }),
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
        undo$: () =>
          eventBus.ofType<KeyboardEvent>("keyup").pipe(
            filter(
              (event) =>
                (event.key === "z" && event.ctrlKey) ||
                event.getModifierState("Meta")
            ),
            map(() => ({
              type: "UNDO",
            }))
          ),
      },
    }
  );

export type TextureMenuService = SimpleInterpreter<
  TextureMenuMachineContext,
  TextureMenuMachineEvent
>;
