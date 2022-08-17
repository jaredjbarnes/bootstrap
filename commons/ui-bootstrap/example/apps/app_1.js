export function onMount(element, config) {
  element.innerHTML = `
  App 1 
  <br />
  <button onclick="document.location='#/app2'">App 2</button>
  `;
}

export function onUnmount(element, config) {
}
