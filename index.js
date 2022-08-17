import { Bootstrap } from "/commons/ui-bootstrap/dist/index.esm.js";

document.addEventListener("readystatechange", function () {
  const bootstrap = new Bootstrap({}, document.querySelector(".top"), window);

  bootstrap.registerApp({
    name: "example",
    path: "/example",
    scriptUrl: "/apps/example/dist/index.js",
  });

  bootstrap.initialize("/example");

  window.bootstrap = bootstrap;
});
