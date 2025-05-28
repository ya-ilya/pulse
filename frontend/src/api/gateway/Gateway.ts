import {
  AuthenticationS2CEvent,
  CreateChannelS2CEvent,
  CreateMessageS2CEvent,
  DeleteChannelS2CEvent,
  DeleteMessageS2CEvent,
  ErrorS2CEvent,
  GatewayEvent,
  TypingS2CEvent,
  UpdateChannelMembersS2CEvent,
  UpdateChannelNameS2CEvent,
  UpdateMessageContentS2CEvent,
} from "./GatewayEvent";

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
  listeners: Partial<{
    AuthenticationS2CEvent: (event: AuthenticationS2CEvent) => void;
    TypingS2CEvent: (event: TypingS2CEvent) => void;
    ErrorS2CEvent: (event: ErrorS2CEvent) => void;
    CreateChannelS2CEvent: (event: CreateChannelS2CEvent) => void;
    DeleteChannelS2CEvent: (event: DeleteChannelS2CEvent) => void;
    UpdateChannelNameS2CEvent: (event: UpdateChannelNameS2CEvent) => void;
    UpdateChannelMembersS2CEvent: (event: UpdateChannelMembersS2CEvent) => void;
    CreateMessageS2CEvent: (event: CreateMessageS2CEvent) => void;
    DeleteMessageS2CEvent: (event: DeleteMessageS2CEvent) => void;
    UpdateMessageContentS2CEvent: (event: UpdateMessageContentS2CEvent) => void;
  }> = {},
  filter: (event: GatewayEvent) => boolean = () => true
) {
  useEffect(() => {
    function gatewayEventListener(customEvent: CustomEvent) {
      const event = customEvent.detail;
      const listener = listeners[event.type as keyof typeof listeners];

      if (event && event.type && listener && filter(event)) {
        try {
          listener.call(undefined, event);
        } catch (e) {
          console.error("Gateway event listener error:", e);
        }
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

// Example usage (in your React component):
// onGatewayEvent({
//   TypingS2CEvent: (event) => { /* handle typing event */ },
//   CreateChannelS2CEvent: (event) => { /* handle new channel */ },
//   // ...etc
// });
