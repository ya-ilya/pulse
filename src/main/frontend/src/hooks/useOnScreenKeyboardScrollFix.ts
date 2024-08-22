import { useEffect } from "react";

const useOnScreenKeyboardScrollFix = () => {
  useEffect(() => {
    const handleScroll = () => {
      (
        document.getElementsByClassName("home")[0] as HTMLElement
      ).scrollIntoView({
        block: "start",
      });
    };


    document.body.addEventListener("touchmove", handleScroll);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.body.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
};

export default useOnScreenKeyboardScrollFix;
