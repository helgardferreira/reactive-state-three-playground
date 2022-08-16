// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    dragEnd$: "done.invoke.menu:invocation[0]";
    undo$: "done.invoke.menu:invocation[1]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    redo: "REDO";
    setCurrentMenuItem: "DRAG";
    undo: "UNDO";
    updatePast: "DROP";
    updateSceneTexture: "DROP" | "REDO" | "UNDO";
  };
  eventsCausingServices: {
    dragEnd$: "xstate.init";
    undo$: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "dragging" | "idle";
  tags: never;
}
