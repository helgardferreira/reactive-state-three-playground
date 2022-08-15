import { useInterpret } from "@xstate/react";
import { distinct, map, bufferTime, filter } from "rxjs/operators";
import { bind } from "@react-rxjs/core";

import TextureMenuItem from "./TextureMenuItem";

import eventBus from "../../EventBus";
import { TextureLoadEvent } from "../../events/TextureLoadEvent";
import { textureMenuMachine } from "./textureMenuMachine";

import "./styles.css";

const textureLoad$ = eventBus.ofType<TextureLoadEvent>("textureLoad").pipe(
  distinct((event) => (event.data.map.image as HTMLImageElement).src),
  bufferTime(1000),
  filter((events) => events.length > 0),
  map((events) => events.map((event) => event.data))
);

const [useTextures] = bind(textureLoad$);

const TextureMenu = () => {
  const service = useInterpret(textureMenuMachine);
  const textures = useTextures();

  return (
    <div className="menu-container">
      {/* Loop through all the textures and create an image for each texture */}
      {textures.map((texture, index) => (
        <TextureMenuItem
          textureUrl={texture.map.image.src}
          key={index}
          textureMenuService={service}
        />
      ))}
    </div>
  );
};

export default TextureMenu;
