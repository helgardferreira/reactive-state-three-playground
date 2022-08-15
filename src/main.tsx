import React from "react";
import ReactDOM from "react-dom/client";
import { fromEvent } from "rxjs";
import App from "./App";
import eventBus from "./EventBus";
import "./index.css";

// register events
/**
 * drag
 * dragend
 * dragenter
 * dragleave
 * dragover
 * dragstart
 */

eventBus.trigger(fromEvent(window, "resize"));
eventBus.trigger(fromEvent(window, "pointermove"));
eventBus.trigger(fromEvent(window, "pointerup"));
eventBus.trigger(fromEvent(window, "pointerdown"));
eventBus.trigger(fromEvent(window, "drag"));
eventBus.trigger(fromEvent(window, "dragend"));
eventBus.trigger(fromEvent(window, "dragstart"));
const handleDragOver = (e: DragEvent) => e.preventDefault();
window.addEventListener("dragover", handleDragOver);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
