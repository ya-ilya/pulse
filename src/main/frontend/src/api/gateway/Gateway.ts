var websocket: WebSocket | undefined;

export function isGatewayOpen() {
  return websocket && websocket.readyState != websocket.CLOSED;
}

export function sendEvent(type: string, event: any) {
  websocket?.send(JSON.stringify({ ...event, type: type }));
}

export function createGatway(
  url: string,
  setLastEvent: (event: any) => void,
  reloadOnClose: boolean = false
) {
  websocket = new WebSocket(url);

  websocket.onopen = () => {
    sendEvent("AuthenticationC2SEvent", {
      token: localStorage.getItem("accessToken")!,
    });
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data["type"]) {
      setLastEvent(data);
    }
  };

  websocket.onerror = (event) => {
    console.log(event);
  };

  websocket.onclose = () => {
    if (reloadOnClose) {
      return window.location.reload();
    }

    createGatway(url, setLastEvent, true);
  };
}
