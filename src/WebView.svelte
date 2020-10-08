<script>
  let webview;

  export let userAgent;

  export function openDevTools() {
    webview.openDevTools();
  }
  export function navigate(url) {
    webview.src = url;
  }
</script>

<webview 
  bind:this={webview}
  class={$$props.class}
  useragent={userAgent}
  partition="persist:webview"
  nodeintegration={false}
  enableremotemodule={false}
/>
