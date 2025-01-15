import { GatewayEvent } from "./GatewayEvent";
import { useEffect } from "react";

export function subscribeToGateway(
  events: { [type: string]: (event: GatewayEvent) => void } = {},
  filter: (event: GatewayEvent) => boolean = () => true
) {
  useEffect(() => {
    function listener(customEvent: CustomEvent) {
      const event = customEvent.detail;

      if (event && event.type && events[event.type] && filter(event)) {
        events[event.type].call(undefined, event);
      }
    }

    window.addEventListener("gatewayevent", listener as EventListener);

    return () => {
      window.removeEventListener("gatewayevent", listener as EventListener);
    };
  });
}
