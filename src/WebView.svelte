<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let webview;
  let navigatingResolve = () => {};
  let navigatingReject = () => {};

  export let userAgent;

  export function openDevTools() {
    webview.openDevTools();
  }
  export function navigate(url) {
    webview.src = url;
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
  on:will-navigate={willNavigate}
  on:did-finish-load={didFinishLoad}
  on:did-fail-load={didFailLoad}
/>
