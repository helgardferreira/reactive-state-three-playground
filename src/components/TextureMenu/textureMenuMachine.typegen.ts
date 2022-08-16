// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    dragEnd$: "done.invoke.menu:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingActions: {
    setCurrentMenuItem: "DRAG";
    updateSceneTexture: "DROP";
  };
  eventsCausingServices: {
    dragEnd$: "xstate.init";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "dragging" | "idle";
  tags: never;
}
