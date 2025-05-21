import "./ContextMenu.css";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

import useViewportSize from "../../hooks/useViewportSize";

type ContextMenuButton<T> = {
  icon?: ReactNode;
  text: string;
  style?: CSSProperties;
  handleClick: (element: T) => Promise<void>;
  condition?: (element: T) => boolean;
};

type ContextMenuProps<T> = {
  width: number;
  buttons: ContextMenuButton<T>[];
  contextMenu?: any;
  setContextMenu?: any;
};

export function useContextMenu<T>(props: ContextMenuProps<T>) {
  const [viewportWidth] = useViewportSize() ?? [];
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: T | null;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, element: T) => {
    event.preventDefault();

    let x = event.clientX;
    let y = event.clientY;

    if (x + props.width > viewportWidth!) {
      x = viewportWidth! - props.width;
    }

    setContextMenu({
      x,
      y,
      element,
    });
  };

  return [
    handleContextMenu,
    ContextMenu({
      ...props,
      contextMenu: contextMenu,
      setContextMenu: setContextMenu,
    }),
  ];
}

function ContextMenu<T>(props: ContextMenuProps<T>) {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        props.setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      props.setContextMenu(null);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    props.contextMenu && (
      <div
        className="context-menu"
        ref={contextMenuRef}
        style={{ top: props.contextMenu.y, left: props.contextMenu.x }}
      >
        {props.buttons
          .filter((it) => (it.condition ? it.condition(props.contextMenu.element) : true))
          .map((it) => (
            <button
              className="item"
              onClick={() => {
                it.handleClick(props.contextMenu.element!);
                props.setContextMenu(null);
              }}
              style={{ ...it.style }}
            >
              {it.icon}
              {it.text}
            </button>
          ))}
      </div>
    )
  );
}

export default ContextMenu;
