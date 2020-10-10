<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import Icon from "fa-svelte";
  import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
  import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
  import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
  import { faSquare } from "@fortawesome/free-solid-svg-icons/faSquare";
  import { faAlignLeft } from "@fortawesome/free-solid-svg-icons/faAlignLeft";
  import { faAlignCenter } from "@fortawesome/free-solid-svg-icons/faAlignCenter";
  import { faAlignRight } from "@fortawesome/free-solid-svg-icons/faAlignRight";
  import { faAlignJustify } from "@fortawesome/free-solid-svg-icons/faAlignJustify";
  import { faBold } from "@fortawesome/free-solid-svg-icons/faBold";
  import { faItalic } from "@fortawesome/free-solid-svg-icons/faItalic";
  import { faUnderline } from "@fortawesome/free-solid-svg-icons/faUnderline";
  import { faStrikethrough } from "@fortawesome/free-solid-svg-icons/faStrikethrough";
  import { presets, boardList } from "./stores";
  const { ipcRenderer } = require("electron");
  export let editingIndex = -1;
  $: preset = $presets[editingIndex];
  const dispatch = createEventDispatcher();

  let showBoardList = false;
  let boardListFilter = "";
  let createdDateTime;
  let presetTitle;
  let postTitle;
  let boardName;
  let price;
  let quality;
  let payment;
  let delivery;
  let openContact;
  let watermark;
  let tags;
  let content;
  let photoDir;

  function save() {
    $presets[editingIndex] = {
      createdDateTime,
      presetTitle,
      boardName,
      postTitle,
      price,
      quality,
      payment,
      delivery,
      openContact,
      watermark,
      tags,
      content,
      photoDir,
    };
  }
  onMount(() => {
    createdDateTime = preset.createdDateTime;
    presetTitle = preset.presetTitle || "";
    boardName = preset.boardName || "";
    postTitle = preset.postTitle || "";
    price = preset.price || "";
    quality = preset.quality || -1;
    payment = preset.payment || -1;
    delivery = preset.delivery || -1;
    openContact = preset.openContact || -1;
    watermark = preset.watermark || false;
    tags = preset.tags || "";
    content = preset.content || "";
    photoDir = preset.photoDir || "";

    const handlePickedDir = (event, dir) => photoDir = dir;
    ipcRenderer.addListener("picked-dir", handlePickedDir);
    return () => {
      save();
      ipcRenderer.removeListener("picked-dir", handlePickedDir);
    };
  });

  function execCommand(key, value) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(key, false, value);
  }
  function setColor(color) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, color);
  }
  function setBackColor(color) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("hiliteColor", false, color);
  }
  function setFontSize(size) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("fontSize", false, size);
  }

</script>

<div class={$$props.class} transition:slide>
  <button class="back" title="뒤로" on:click={() => dispatch("back")}>
    <Icon icon={faChevronLeft} />
  </button>
  <span style="margin: 4px 8px;">생성일시: {new Date(createdDateTime).toLocaleString()}</span>
  <label class="input-row">
    <span>이름</span>
    <input
      type="text"
      placeholder="프리셋 이름"
      bind:value={presetTitle}>
  </label>
  <div class="input-row">
    <span>게시판</span>
    <button class="select" on:click={() => showBoardList = !showBoardList}>
      <span>{boardName || "선택하세요"}</span>
      <Icon icon={showBoardList ? faChevronUp : faChevronDown} />
    </button>
  </div>
  {#if showBoardList}
    <label style="margin-left: 12px; font-size: 0.9em;">
      게시판 필터:
      <input style="font-size: 0.9em;" type="text" bind:value={boardListFilter}>
    </label>
    <div class="options">
      {#each $boardList as board, index (index)}
        {#if !boardListFilter || board.toLowerCase().includes(boardListFilter.toLowerCase())}
          <label>
            <input
              type="radio"
              bind:group={boardName}
              value={board}
              name="board-list"
              on:change={() => showBoardList=false}
            >
            {board}
          </label>
        {/if}
      {/each}
    </div>
  {/if}
  <label class="input-row">
    <span>제목</span>
    <input type="text" placeholder="글 제목 (상품명)" bind:value={postTitle}>
  </label>
  <label class="input-row">
    <span>가격</span>
    <input type="number" placeholder="가격 (2,000~1억)" min={2000} max={100000000} step={1000} bind:value={price}>
  </label>
  <div class="input-row">
    <span>상태</span>
    <div class="radios">
      <label>
        <input type="radio" value="0" bind:group={quality}>
        미개봉
      </label>
      <label>
        <input type="radio" value="1" bind:group={quality}>
        거의새것
      </label>
      <label>
        <input type="radio" value="2" bind:group={quality}>
        사용감있음
      </label>
    </div>
  </div>
  <div class="input-row">
    <span>결제</span>
    <div class="radios">
      <label>
        <input type="radio" value="0" bind:group={payment}>
        네이버페이 안전거래
      </label>
      <label>
        <input type="radio" value="1" bind:group={payment}>
        직접거래
      </label>
    </div>
  </div>
  <div class="input-row">
    <span>배송</span>
    <div class="radios">
      <label>
        <input type="radio" value="0" bind:group={delivery}>
        직거래
      </label>
      <label>
        <input type="radio" value="1" bind:group={delivery}>
        택배거래
      </label>
      <label>
        <input type="radio" value="2" bind:group={delivery}>
        온라인발송
      </label>
    </div>
  </div>
  <div class="input-row">
    <span>전화</span>
    <div class="radios">
      <label>
        <input type="radio" value="0" bind:group={openContact}>
        공개
      </label>
      <label>
        <input type="radio" value="1" bind:group={openContact}>
        안심번호
      </label>
    </div>
  </div>
  <hr>
  <div class="input-row">
    <label>
      <input type="checkbox" bind:value={watermark}>
      첨부사진에 워터마크 추가
    </label>
  </div>
  <div class="input-row">
    <span>사진폴더</span>
    <button class="dir" on:click={() => {
      ipcRenderer.send("pick-dir");
    }}>{photoDir || "선택하세요"}</button>
    <button style="margin-left: 3px; padding: 2px;" disabled={!photoDir} on:click={() => photoDir = ""}>
      <Icon icon={faTimes} />
    </button>
  </div>
  <p>프리셋 삽입 시, 이 폴더가 시스템 파일 탐색기로 열리며 별도로 직접 삽입해야합니다.</p>
  <hr>
  <span>글 내용</span>
  <div class="control-strip">
    <span>글자색</span>
    <button class="control" title="리셋" on:click={() => setColor("unset")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="빨강" style="color:#e03131" on:click={() => setColor("#e03131")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="주황" style="color:#e8590c" on:click={() => setColor("#e8590c")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="노랑" style="color:#f08c00" on:click={() => setColor("#f08c00")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="초록" style="color:#2f9e44" on:click={() => setColor("#2f9e44")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="파랑" style="color:#1971c2" on:click={() => setColor("#1971c2")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="보라" style="color:#9c36b5" on:click={() => setColor("#9c36b5")}>
      <Icon icon={faSquare} />
    </button>
  </div>
  <div class="control-strip">
    <span>배경색</span>
    <button class="control" title="리셋" on:click={() => setBackColor("unset")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="빨강" style="color:#e03131" on:click={() => setBackColor("#ffc9c9")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="주황" style="color:#e8590c" on:click={() => setBackColor("#ffd8a8")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="노랑" style="color:#f08c00" on:click={() => setBackColor("#ffec99")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="초록" style="color:#2f9e44" on:click={() => setBackColor("#b2f2bb")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="파랑" style="color:#1971c2" on:click={() => setBackColor("#a5d8ff")}>
      <Icon icon={faSquare} />
    </button>
    <button class="control" title="보라" style="color:#9c36b5" on:click={() => setBackColor("#eebefa")}>
      <Icon icon={faSquare} />
    </button>
  </div>
  <div class="control-strip">
    <span>글자크기</span>
    <button class="control" on:click={() => setFontSize(2)}>작게</button>
    <button class="control" on:click={() => setFontSize(3)}>보통</button>
    <button class="control" on:click={() => setFontSize(4)}>크게</button>
    <button class="control" on:click={() => setFontSize(5)}>아주크게</button>
  </div>
  <div class="control-strip">
    <span>정렬</span>
    <button class="control" on:click={() => execCommand("justifyLeft")}>
      <Icon icon={faAlignLeft} />
    </button>
    <button class="control" on:click={() => execCommand("justifyCenter")}>
      <Icon icon={faAlignCenter} />
    </button>
    <button class="control" on:click={() => execCommand("justifyRight")}>
      <Icon icon={faAlignRight} />
    </button>
    <button class="control" on:click={() => execCommand("justifyFull")}>
      <Icon icon={faAlignJustify} />
    </button>
  </div>
  <div class="control-strip">
    <span>모양</span>
    <button class="control" on:click={() => execCommand("bold")}>
      <Icon icon={faBold} />
    </button>
    <button class="control" on:click={() => execCommand("italic")}>
      <Icon icon={faItalic} />
    </button>
    <button class="control" on:click={() => execCommand("underline")}>
      <Icon icon={faUnderline} />
    </button>
    <button class="control" on:click={() => execCommand("strikeThrough")}>
      <Icon icon={faStrikethrough} />
    </button>
  </div>
  <div contenteditable bind:innerHTML={content}></div>
  <label class="input-row">
    <span>태그</span>
    <input type="text" placeholder="#태그 (최대 10개)" bind:value={tags}>
  </label>
</div>

<style>
  hr {
    border: none;
    border-bottom: 1px solid #ccc;
  }
  p {
    font-size: 0.9em;
    margin: 4px 8px;
  }
  button {
    appearance: none;
    background: unset;
    text-align: start;
  }
  button.back {
    margin: 3px;
    border: none;
    border-radius: 9999px;
  }
  button.back:hover {
    background-color: rgba(200,200,200,0.4);
  }
  button.dir {
    border: 1px solid #ccc;
    border-radius: 8px;
    max-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.9em;
    padding: 4px 6px;
  }
  button.dir:hover {
    background-color: #eee;
  }
  button.dir:active {
    background-color: #fff;
  }
  button.control {
    /* font-weight: 700; */
    font-size: 0.9em;
    padding: 3px;
    margin-left: 4px;
  }
  .control-strip {
    display: flex;
    flex-wrap: wrap;
    margin: 4px 8px;
  }
  .input-row {
    display: flex;
    padding: 3px 8px;
    align-items: center;
  }
  .input-row span {
    margin: 2px 4px;
    margin-left: 0;
  }
  .input-row > input {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 6px 8px;
  }
  .input-row > .radios {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 3px 8px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .input-row > .select {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 3px 6px;
    /* user-select: none; */
    max-width: 200px;
  }
  .input-row > .select span {
    flex: 1;
  }
  .options > label {
    display: flex;
    align-items: center;
    padding: 2px 8px;
  }
  div[contenteditable] {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 6px 8px;
    margin: 2px 8px 6px;
    min-height: 250px;
  }
</style>