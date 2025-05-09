import { GatewayEvent } from "./GatewayEvent";
import { useEffect } from "react";

var websocket: WebSocket | undefined;

export function isGatewayOpen() {
  return websocket && websocket.readyState != websocket.CLOSED;
}

export function closeGateway() {
  websocket?.close();
}

export function sendGatewayEvent(type: string, event: any) {
  websocket?.send(JSON.stringify({ ...event, type: type }));
}

export function onGatewayEvent(
  listeners: { [type: string]: (event: GatewayEvent) => void } = {},
  filter: (event: GatewayEvent) => boolean = () => true
) {
  useEffect(() => {
    function gatewayEventListener(customEvent: CustomEvent) {
      const event = customEvent.detail;
      const listener = listeners[event.type];

      if (event && event.type && listener && filter(event)) {
        listener.call(undefined, event);
      }
    }

    window.addEventListener("gatewayevent", gatewayEventListener as EventListener);

    return () => {
      window.removeEventListener("gatewayevent", gatewayEventListener as EventListener);
    };
  });
}

export function onGatewayClose(listener: (event: CloseEvent) => void) {
  useEffect(() => {
    function gatewayCloseListener(customEvent: CustomEvent) {
      listener.call(undefined, customEvent.detail);
    }

    window.addEventListener("gatewayclose", gatewayCloseListener as EventListener);

    return () => {
      window.removeEventListener("gatewayclose", gatewayCloseListener as EventListener);
    };
  });
}

export function connectToGateway(url: string, token: string) {
  websocket = new WebSocket(url);

  websocket.onopen = () => {
    sendGatewayEvent("AuthenticationC2SEvent", {
      token: token,
    });
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data["type"]) {
      window.dispatchEvent(
        new CustomEvent("gatewayevent", {
          detail: data,
        })
      );
    }
  };

  websocket.onerror = (event) => {
    console.log(event);
  };

  websocket.onclose = (event) => {
    window.dispatchEvent(
      new CustomEvent("gatewayclose", {
        detail: event,
      })
    );
  };
}
