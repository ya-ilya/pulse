import { useEffect, useState } from "react";

export function useLocalStorage(key: string) {
  const [value, setValue] = useState<string | null>();

  useEffect(() => {
    function listener(event: StorageEvent) {
      if (event.storageArea == localStorage && event.key == key) {
        setValue(event.storageArea.getItem(key));
      }
    }

    window.addEventListener("storage", listener);

    return () => window.removeEventListener("storage", listener);
  }, []);

  return [
    value,
    (value: string | null) => {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    },
  ];
}
