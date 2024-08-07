var websocket: WebSocket | undefined

export function isGatewayOpen() {
  return websocket && websocket.readyState != websocket.CLOSED
}

export function createGatway(url: string, setLastEvent: (event: any) => void) {
  websocket = new WebSocket(url)

  websocket.onopen = () => {
    websocket?.send(localStorage.getItem('accessToken')!)
  }

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data["type"]) {
      setLastEvent(data)
    }
  }
}