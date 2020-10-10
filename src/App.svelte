<script>
  import { onMount, tick } from "svelte";
  import Icon from "fa-svelte";
  import { faBug } from "@fortawesome/free-solid-svg-icons/faBug";
  import { faRedo } from "@fortawesome/free-solid-svg-icons/faRedo";
  import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
  import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
  import WebView from "./WebView.svelte";
  import PresetList from "./PresetList.svelte";
  import PresetDetail from "./PresetDetail.svelte";
  import { userAgent, loginUrl, logoutUrl, writeUrl } from "./constants";
  import {
    cleanUpLoginPage,
    cleanUpWritePage,
    waitWritePageReady,
    getBoardList,
    selectBoard,
  } from "./automation";
  import { presets, selectedPresetIndex, boardList } from "./stores";
  const { ipcRenderer, shell } = require("electron");

  let webview;
  let contentView;
  let currentPage = "";
  let showPresetList = false;
  let showPresetDetail = false;
  let showContentView = false;
  let currentEditingPresetIndex = -1;
  let injectingStatus = "unavailable";
  let remainingPhotosToInject = 0;

  onMount(() => {
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
        injectingStatus = "unavailable";
        await cleanUpLoginPage(webview);
        break;
      case "write":
        try {
          await cleanUpWritePage(webview);
          await waitWritePageReady(webview);
          $boardList = await getBoardList(webview);
          injectingStatus = "available";
        } catch (error) {
          console.error(error);
        }
        break;
      default:
        webview.navigate(writeUrl);
        break;
    }
  }
  
  async function injectPreset() {
    // 제목 입력
    injectingStatus = "injecting";
    webview.focus();
    const preset = $presets[$selectedPresetIndex];
    await selectBoard(webview, preset.boardName);
    await webview.setElementProperty(
      ".ArticleWriteFormSubject textarea",
      "value",
      preset.postTitle
    );
    await webview.setElementProperty(
      ".ArticleWriteFormSubject textarea",
      "_value",
      preset.postTitle
    );

    // 가격 입력
    await webview.clickElement(".ArticleWriteCommercialFormPrice .input_price");
    await webview.setElementProperty(
      "input.input_price",
      "value",
      preset.price
    );
    await webview.pressKey("Tab");

    // 상태 선택
    await webview.clickElement(`label[for=product_condition_${preset.quality}]`);

    // 결제 선택
    await webview.clickElement(`.deal_button button:${preset.payment == 0 ? "first" : "last"}-child`);
    if (preset.payment == 0) {
      await webview.clickElement(`label[for=commerce_agree]`);
    } else {
      await webview.clickElement(`.pay_check .ToggleButton button`);
    }

    // 배송 선택
    await webview.clickElement(`label[for=delivery_type_${preset.delivery}]`);

    // 전화번호 선택
    await webview.clickElement(`label[for=openPhoneNo]`);
    if (preset.openContact == 1) {
      await webview.clickElement(`label[for=useOtn]`);
    }
    if (preset.watermark === "false") {
      await webview.clickElement(`.WatermarkAdd .ToggleButton button`);
    }

    // 태그 입력
    webview.focus();
    await webview.runJS(`
      document.querySelector(".TagContainer textarea").focus();
      (function() {
        window.alert = console.log;
      })();
    `);
    await webview.setElementProperty(
      ".TagContainer textarea",
      "value",
      preset.tags
    );
    await webview.pressKey("#");

    // 사진 입력 (기술적으로 불가, 클립보드 붙여넣기시 고해상도파일 불가)
    if (preset.photoDir){
      shell.openPath(preset.photoDir);
    }
    // const photoPaths = ipcRenderer.sendSync("get-photo-paths", preset.photoDir);
    // [photoPaths[0]].forEach(async (path, index) => {
    //   remainingPhotosToInject = photoPaths.length - index;
    //   const image = nativeImage.createFromPath(path);
    //   clipboard.write({ image });
    //   webview.focus();
    //   await webview.runJS(`
    //     document.querySelector(".ArticleWriteFormSubject textarea").focus();
    //     document
    //       .querySelector("iframe")
    //       .contentDocument
    //       .querySelector("[contenteditable]")
    //       .focus();
    //   `);
    //   webview.paste();
    // });
    // remainingPhotosToInject = 0;

    // 내용 복사
    showContentView = true;
    await tick();
    const selection = document.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(contentView);
    selection.addRange(range);
    document.execCommand("copy");
    showContentView = false;
    
    // 내용 입력
    webview.focus();
    await webview.runJS(`
      document.querySelector(".ArticleWriteFormSubject textarea").focus();
      document
        .querySelector("iframe")
        .contentDocument
        .querySelector("[contenteditable]")
        .focus();
    `);
    webview.paste();
    injectingStatus = "done";
  }
</script>

<svelte:head>
  <title>중나오토</title>
</svelte:head>
<div class="layout">
  <nav>
    <button
      class="preset"
      on:click={() => { showPresetList = !showPresetList; showPresetDetail = false; }}
    >
    <span>{$selectedPresetIndex < 0 ? "프리셋을 선택하세요" : $presets[$selectedPresetIndex].presetTitle}</span>
      <Icon icon={showPresetList ? faChevronUp : faChevronDown} />
    </button>
    <button
      disabled={injectingStatus !== "available" || showPresetList}
      on:click={injectPreset}
    >
      {#if injectingStatus === "available" || injectingStatus === "unavailable" }
        내용 삽입
      {:else if injectingStatus === "done" }
        삽입 완료
      {:else}
        {remainingPhotosToInject > 0 ? `사진 삽입 중 (${remainingPhotosToInject})` : "삽입 중"}
      {/if}
    </button>
    <div>
      <button
        title="개발자도구 열기"
        on:click={() => webview.openDevTools()}
      ><Icon icon={faBug}></Icon></button>
      <button
        title="새로고침"
        on:click={() => {ipcRenderer.send("refresh")}}
      ><Icon icon={faRedo}></Icon></button>
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
    {#if showPresetList}
      <PresetList
        class="preset-list"
        on:change={() => { /* showPresetList = false */ }}
        on:edit={(e) => {
          currentEditingPresetIndex = e.detail.index;
          showPresetDetail = true;
        }}
      />
    {/if}
    {#if showPresetDetail}
      <PresetDetail
        class="preset-detail"
        editingIndex={currentEditingPresetIndex}
        on:back={() => showPresetDetail = false}
      />
    {/if}
    {#if showContentView}
      <div bind:this={contentView} style="z-index: 5" contenteditable>
        {@html $presets[$selectedPresetIndex].content}
      </div>
    {/if}
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
  main :global(.preset-list) {
    overflow-y: scroll;
    z-index: 2;
    background-color: #fff;
  }
  main :global(.preset-detail) {
    z-index: 3;
    background-color: #fff;
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