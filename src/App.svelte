<script>
  import { onMount } from "svelte";
  import Icon from "fa-svelte";
  import { faBug } from "@fortawesome/free-solid-svg-icons/faBug";
  import WebView from "./WebView.svelte";
  import { userAgent, loginUrl, logoutUrl, writeUrl } from "./constants";

  let webview;
  let currentPage = "";
  
  onMount(async () => {
    webview.navigate(writeUrl);
  });


</script>

<svelte:head>
  <title>중나오토</title>
</svelte:head>
<div class="layout">
  <nav>
    <div>
      <button
        title="개발자도구 열기"
        on:click={() => webview.openDevTools()}
      ><Icon icon={faBug}></Icon></button>
      <button
        title="로그아웃"
        on:click={() => webview.navigate(logoutUrl)}
      >로그아웃</button>
    </div>
  </nav>
  <main>
    <WebView
      bind:this={webview}
      class="webview"
      userAgent={userAgent}
    />
  </main>
</div>

<style>
  .layout {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  nav {
    height: fit-content;
    background-color: #444;
    border-bottom: 2px solid #222;
    display: flex;
    align-items: center;
  }
  main {
    position: relative;
    flex: 1;
  }
  nav > :last-child {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
  main > :global(*) {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  main :global(.webview) {
    z-index: 1;
  }
</style>