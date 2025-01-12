import { GatewayEvent } from "./GatewayEvent";

var websocket: WebSocket | undefined;

export function isGatewayOpen() {
  return websocket && websocket.readyState != websocket.CLOSED;
}

export function sendEvent(type: string, event: any) {
  websocket?.send(JSON.stringify({ ...event, type: type }));
}

export function createGatway(
  url: string,
  token: string,
  setLastEvent: (event: GatewayEvent) => void
) {
  websocket = new WebSocket(url);

  websocket.onopen = () => {
    sendEvent("AuthenticationC2SEvent", {
      token: token,
    });
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data["type"]) {
      setLastEvent(data as GatewayEvent);
    }
  };

  websocket.onerror = (event) => {
    console.log(event);
  };

  websocket.onclose = () => {
    window.location.reload();
  };
}
