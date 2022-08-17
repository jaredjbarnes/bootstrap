import { Bootstrap } from "../dist/index.esm.js";

document.addEventListener("readystatechange", function () {
  const bootstrap = new Bootstrap({}, document.querySelector(".top"), window);

  bootstrap.registerApp({
    name: "application-one",
    path: "/app1",
    scriptUrl: "/example/apps/app_1.js",
  });

  bootstrap.registerApp({
    name: "application-two",
    path: "/app2",
    scriptUrl: "/example/apps/app_2.js",
    runInIsolation: true,
  });

  bootstrap.registerApp({
    name: "application-three",
    path: "/app3",
    scriptUrl: "/example/apps/app_3.js",
  });

  bootstrap.initialize("/app1");

  window.bootstrap = bootstrap;
});
