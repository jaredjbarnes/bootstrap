export function onMount(element, config) {
  element.innerHTML = "App 3";
}

export function onUnmount(element, config) {
  console.log("Unmount app 3");
}
