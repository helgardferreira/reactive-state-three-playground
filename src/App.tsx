import { Subscribe } from "@react-rxjs/core";

import TextureMenu from "./components/TextureMenu/TextureMenu";
import { useViewer } from "./utils/hooks";

import "./App.css";

function App() {
  const canvasContainerRef = useViewer();

  return (
    <div className="app-container">
      <div ref={canvasContainerRef}></div>
      <Subscribe fallback={<div></div>}>
        <TextureMenu />
      </Subscribe>
    </div>
  );
}

export default App;
