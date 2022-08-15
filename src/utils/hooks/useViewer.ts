import { useRef, useEffect } from "react";
import viewer from "../../three/Viewer";

export const useViewer = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.appendChild(viewer.canvas);
    }

    return () => {
      if (canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(viewer.canvas);
      }
    };
  }, [canvasContainerRef]);

  return canvasContainerRef;
};
