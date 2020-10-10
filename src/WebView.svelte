<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let webview;
  let navigatingResolve = () => {};
  let navigatingReject = () => {};
  let domReady = false;

  export let userAgent;

  export function openDevTools() {
    webview.openDevTools();
  }
  export function paste() {
    webview.paste();
  }
  export function reload() {
    webview.reloadIgnoringCache();
  }
  export function focus() {
    webview.focus();
  }
  export function runJS(js) {
    return webview.executeJavaScript(js, true);
  }
  export function insertCSS(css) {
    return webview.insertCSS(css);
  }
  export function removeCSS(cssKey) {
    return webview.removeInsertedCSS(cssKey);
  }
  export function collapseElementsWithCSS(...queries) {
    return insertCSS(`
      ${queries.join(",")} {
        display: none;
      }
    `);
  }
  export function hideElementsWithCSS(...queries) {
    return insertCSS(`
      ${queries.join(",")} {
        width: 0 !important;
        height: 0 !important;
      }
    `);
  }
  export function removeElementsWithJS(...queries) {
    return runJS(`
		  document
			  .querySelectorAll("${queries.join(",").replaceAll(`"`, `\\"`)}")
			  .forEach(el => el.remove());
		`);
  }
  export async function waitElementWithJS(query, timeout=10000) {
    const promise = await runJS(`
      new Promise(
        (resolve, reject) => {
          const timeout = setTimeout(reject, ${timeout});
          setInterval(() => {
            const elem = document.querySelector("${query.replaceAll(`"`,`\\"`)}");
            if (elem) {
              clearTimeout(timeout);
              resolve(0);
            }
          }, 30);
        }
      );
    `);
    if (await promise !== 0) {
      throw new Error(`Failed to wait "${query}"`);
    }
  }
  export async function clickElement(query) {
    await runJS(`
      document
        .querySelector("${query.replaceAll(`"`,`\\"`)}")
        ?.click();
    `);
  }
  export async function mouseDownAndUpElement(query) {
    const { x, y, width, height } = await runJS(`
      (function() {
        const el = document.querySelector("${query.replaceAll(`"`,`\\"`)}");
        const { x, y, width, height } = el.getBoundingClientRect();
        return { x, y, width, height };
      })();
    `);
    const coord = {
      x: x + ~~(width / 2),
      y: y + ~~(height / 2),
    }
    await webview.sendInputEvent({
      type:"mouseDown",
      button:"left",
      ...coord,
    });
    await new Promise(r => setTimeout(r, 50));
    await webview.sendInputEvent({
      type:"mouseUp",
      button:"left",
      clickCount: 1,
      ...coord,
    });
  }
  export async function pressKey(keyCode) {
    await webview.sendInputEvent({
      type:"char",
      keyCode,
    })
  }
  export async function setElementProperty(query, key, value) {
    await runJS(`
      document
        .querySelector("${query.replaceAll(`"`,`\\"`)}")
        .${key} = ${JSON.stringify(value)};
    `);
  }
  export async function getElementProperty(query, key) {
    return await runJS(`
      document
        .querySelector("${query.replaceAll(`"`,`\\"`)}")
        ?.${key};
    `);
  }
  
  export function navigate(url) {
    if (domReady) {
      webview.stop();
      webview.loadURL(url);
    } else {
      webview.src = url;
    }
    dispatchNavigate(url);
  }

  function dispatchNavigate(navigatingUrl) {
    didFailLoad();
    const promise = new Promise((resolve, reject) => {
      navigatingResolve = resolve;
      navigatingReject = reject;
    });
    dispatch(
      "navigate",
      { url: navigatingUrl, navigating: promise }
    );
  }
  
  function willNavigate(e) { 
    dispatchNavigate(e.url);
  }
  function didFinishLoad() {
    navigatingResolve();
    navigatingResolve = () => {};
  }
  function didFailLoad() {
    navigatingReject();
    navigatingReject = () => {};
  }
</script>

<webview 
  bind:this={webview}
  class={$$props.class}
  useragent={userAgent}
  partition="persist:webview"
  nodeintegration={false}
  enableremotemodule={false}
  on:dom-ready|once={() => domReady = true}
  on:will-navigate={willNavigate}
  on:did-finish-load={didFinishLoad}
  on:did-fail-load={didFailLoad}
/>
