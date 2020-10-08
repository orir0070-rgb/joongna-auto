<script>
  import { onMount } from "svelte";
  import Icon from "fa-svelte";
  import { faBug } from "@fortawesome/free-solid-svg-icons/faBug";
  import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
  import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
  import WebView from "./WebView.svelte";
  import { userAgent, loginUrl, logoutUrl, writeUrl } from "./constants";
  import { presets, selectedPresetIndex, boardList } from "./stores";

  let webview;
  let currentPage = "";
  let showPresetList = false;
  
  onMount(async () => {
    webview.navigate(writeUrl);
  });

  async function handleNavigate({ detail: { url, navigating } }) {
    if (url.includes("nid.naver.com")) {
      currentPage = "login";
      if (url.includes(".logout") || url.includes(writeUrl)) {
        webview.navigate(loginUrl);
      }
    } else if (url.includes(writeUrl)) {
      currentPage = "write";
    } else {
      webview.navigate(writeUrl);
    }

    try {
      await navigating;
    } catch {
      return;
    }

    switch (currentPage) {
      case "login":
        break;
      case "write":
        break;
      default:
        webview.navigate(writeUrl);
        break;
    }
  }
</script>

<svelte:head>
  <title>중나오토</title>
</svelte:head>
<div class="layout">
  <nav>
    <button
      class="preset"
    >
    <span>{$selectedPresetIndex < 0 ? "프리셋을 선택하세요" : $presets[$selectedPresetIndex].presetTitle}</span>
      <Icon icon={showPresetList ? faChevronUp : faChevronDown} />
    </button>
    <div>
      <button
        title="개발자도구 열기"
        on:click={() => webview.openDevTools()}
      ><Icon icon={faBug}></Icon></button>
      <button
        title="로그아웃"
        disabled={currentPage !== "write" || showPresetList}
        on:click={() => webview.navigate(logoutUrl)}
      >로그아웃</button>
    </div>
  </nav>
  <main>
    <WebView
      bind:this={webview}
      class="webview"
      userAgent={userAgent}
      on:navigate={handleNavigate}
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
  button {
    margin: 4px 4px;
    user-select: none;
    display: flex;
    align-items: center;
    background-color: #777;
    color: #eee;
    appearance: none;
    border: 1px solid #888;
    border-radius: 6px;
  }
  button:hover {
    background-color: #888;
  }
  button:disabled {
    color: #9f9f9f;
    background-color: #777;
  }
  button:active {
    background-color: #777;
  }
  button.preset {
    width: 200px;
    display: flex;
    justify-content: flex-end;
    border: none;
    border-right: 2px solid #222;
    border-radius: 0;
    height: 100%;
    background-color: #666;
    margin: 0;
    color: #bbb;
  }
  button.preset:hover {
    background-color: #888;
  }
  button.preset:active {
    background-color: #666;
  }
  button.preset > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #eee;
  }
  button.preset > :global(svg) {
    padding-left: 4px;
    flex-shrink: 0;
  }
</style>