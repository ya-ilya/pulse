import "./Background.css";

type BackgroundProps = {
  variables: boolean[];
  setters: ((value: boolean) => void)[];
  children: any[];
};

function Background(props: BackgroundProps) {
  const visible = props.variables.find((variable) => variable);

  return (
    <div
      className="background"
      onClick={(event) => {
        if ((event.target as Element).classList.contains("background")) {
          props.setters.forEach((setter) => setter.call(undefined, false))
        }
      }}
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      {props.children}
    </div>
  );
}

export default Background