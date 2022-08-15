import { FC, memo } from "react";
import { TextureMenuService } from "./textureMenuMachine";

interface IProps {
  textureUrl: string;
  textureMenuService: TextureMenuService;
}

const TextureMenuItem: FC<IProps> = ({ textureUrl, textureMenuService }) => {
  return (
    <div
      draggable
      className="menu-item"
      onPointerDown={() =>
        textureMenuService.send({ type: "DRAG", data: textureUrl })
      }
    >
      <img src={textureUrl} />
    </div>
  );
};

export default memo(TextureMenuItem);
