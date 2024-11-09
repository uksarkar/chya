import { App } from "./App";
import "./style.scss";

document.querySelector<HTMLDivElement>("#app")!.appendChild((<App />) as Node);
