// This is a hack to make rollup include just interface files.
import "./app";
import { App, AppModule } from "./app";
import { Bootstrap } from "./bootstrap";

export { Bootstrap, App, AppModule };
