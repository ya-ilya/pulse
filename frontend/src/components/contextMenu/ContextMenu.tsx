import "./ContextMenu.css";

import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import useViewportSize from "../../hooks/useViewportSize";

export type ContextMenuButton<T> = {
  icon?: ReactNode;
  text: string;
  style?: CSSProperties;
  handleClick: (element: T) => Promise<void>;
  condition?: (element: T) => boolean;
};

type ContextMenuProps<T> = {
  width: number;
  buttons: ContextMenuButton<T>[];
  contextMenu?: {
    x: number;
    y: number;
    element: T | null;
  } | null;
  setContextMenu?: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
      element: T | null;
    } | null>
  >;
};

export function useContextMenu<T>(props: ContextMenuProps<T>) {
  const [viewportWidth] = useViewportSize() ?? [];
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: T | null;
  } | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, element: T) => {
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
    },
    [props.width, viewportWidth]
  );

  return [
    handleContextMenu,
    <ContextMenu<T>
      key="context-menu"
      {...props}
      contextMenu={contextMenu}
      setContextMenu={setContextMenu}
    />,
  ] as const;
}

function ContextMenu<T>(props: ContextMenuProps<T>) {
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        props.setContextMenu?.(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.setContextMenu]);

  useEffect(() => {
    function handleResize() {
      props.setContextMenu?.(null);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [props.setContextMenu]);

  return (
    props.contextMenu && (
      <div
        className="context-menu"
        ref={contextMenuRef}
        style={{ top: props.contextMenu.y, left: props.contextMenu.x }}
      >
        {props.buttons
          .filter((it) => (it.condition ? it.condition(props.contextMenu!.element!) : true))
          .map((it, idx) => (
            <button
              className="item"
              key={it.text + idx}
              onClick={async () => {
                await it.handleClick(props.contextMenu!.element!);
                props.setContextMenu?.(null);
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
