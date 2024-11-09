import { TestForm } from "./components/Form";
import "./style.css";

document
  .querySelector<HTMLDivElement>("#app")!
  .appendChild((<TestForm />) as Node);
