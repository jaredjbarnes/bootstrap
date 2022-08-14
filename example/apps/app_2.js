export function onMount(element, config) {
  element.innerHTML = "App 2";
}

export function onUnmount(element, config) {
  console.log("Unmount app 2");
}
