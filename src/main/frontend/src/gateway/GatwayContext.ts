import React, { useEffect } from "react"

export const GatewayContext = React.createContext<any | null>(null)

export function useGatewayContext(
  events: { [type: string]: (event: any) => void },
  filter: (event: any) => boolean = () => true
) {
  const lastEvent = React.useContext(GatewayContext)

  useEffect(() => {
    if (lastEvent && lastEvent.type && filter(lastEvent)) {
      events[lastEvent.type]?.call(undefined, lastEvent)
    }
  }, [lastEvent])
}