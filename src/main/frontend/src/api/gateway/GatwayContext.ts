import React, { useEffect } from "react";

import { GatewayEvent } from "./GatewayEvent";
import { sendEvent } from "./Gateway";

export const GatewayContext = React.createContext<GatewayEvent | null>(null);

export function useGatewayContext(
  events: { [type: string]: (event: GatewayEvent) => void } = {},
  filter: (event: GatewayEvent) => boolean = () => true
) {
  const lastEvent = React.useContext(GatewayContext);

  useEffect(() => {
    if (lastEvent && lastEvent.type && events[lastEvent.type] && filter(lastEvent)) {
      events[lastEvent.type].call(undefined, lastEvent);
    }
  }, [lastEvent]);

  return { sendEvent: sendEvent };
}
