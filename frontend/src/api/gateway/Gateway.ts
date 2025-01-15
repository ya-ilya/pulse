var websocket: WebSocket | undefined;

export function isGatewayOpen() {
  return websocket && websocket.readyState != websocket.CLOSED;
}

export function sendEvent(type: string, event: any) {
  websocket?.send(JSON.stringify({ ...event, type: type }));
}

export function connectToGateway(url: string, token: string) {
  websocket = new WebSocket(url);

  websocket.onopen = () => {
    sendEvent("AuthenticationC2SEvent", {
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

  websocket.onclose = () => {
    window.location.reload();
  };
}
