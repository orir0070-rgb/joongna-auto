<script>
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import Icon from "fa-svelte";
  import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
  import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
  import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
  import { presets, selectedPresetIndex } from "./stores";
  const dispatch = createEventDispatcher();

  let sortBy = "title";
  $: sortedPresets = $presets
    .map((preset, index) => ({ preset, index }))
    .sort(({ preset: a }, { preset: b }) => {
      if (sortBy === "date") {
        a = -a.createdDateTime;
        b = -b.createdDateTime;
      } else {
        a = a.presetTitle;
        b = b.presetTitle;
      }
      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });

  function handleEdit(index) {
    dispatch("edit", { index });
  }
  function handleDelete(index) {
    if (confirm("삭제할까요?")) {
      $presets.splice(index, 1);
      if ($selectedPresetIndex >= 0 && $selectedPresetIndex >= index) {
        selectedPresetIndex.update(i => i - 1);
      }
      $presets = $presets;
    }
  }
  function handleAdd() {
    $presets.push({
      createdDateTime: Date.now(),
      presetTitle: "",
      postTitle: "",
      boardName: "",
      price: "",
      quality: -1,
      payment: -1,
      delivery: -1,
      openContact: -1,
      watermark: false,
      tags: "",
      content: "",
      photoDir: "",
    });
    handleEdit($presets.length - 1);
  }
  function formatTime(dt) {
    const year = (dt.getFullYear() + "").substring(2);
    const month = (dt.getMonth() + 1 + "").padStart(2, 0);
    const day = (dt.getDate() + "").padStart(2, 0);
    const hour = (dt.getDate() + "").padStart(2, 0);
    const minute = (dt.getDate() + "").padStart(2, 0);
    const ymd = [year, month, day].join("/");
    const hm = [hour, minute].join(":");

    return `${ymd} ${hm}`;
  }
</script>

<div class={$$props.class} transition:slide>
  <div class="menu-bar">
    <button on:click={() => sortBy === "title" ? (sortBy = "date") : (sortBy = "title")}>
      {sortBy === "title" ? "이름순" : "최신순"}
    </button>
    <button title="추가" on:click={handleAdd}>
      <Icon icon={faPlus} />
    </button>
  </div>
  {#each sortedPresets as { preset, index } (index)}
    <label class="item" class:selected={$selectedPresetIndex == index}>
      <input
        type="radio"
        bind:group={$selectedPresetIndex}
        value={index}
        on:change
      >
      <h2>{preset.presetTitle}</h2>
      <div class="right">
        <div class="buttons">
          <button on:click={() => handleDelete(index)}><Icon icon={faTrash} /></button>
          <button on:click={() => handleEdit(index)}><Icon icon={faEdit} /></button>
        </div>
        <span>{formatTime(new Date(preset.createdDateTime))}</span>
      </div>
    </label>
  {/each}
</div>

<style>
  button {
    appearance: none;
    background-color: transparent;
    border: none;
    border-radius: 9999px;
  }
  button:hover {
    background-color: rgba(200,200,200,0.4);
  }
  .menu-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 2px;
    border-bottom: 1px solid #ccc;
  }
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 48px;
    user-select: none;
    border-bottom: 1px solid #ccc;
  }
  .item:hover {
    background-color: #def;
  }
  /* .item:active {
    background-color: #cde;
  } */
  .item.selected {
    background-color: #598fe0;
    color: white;
  }
  .item .right {
    flex-shrink: 0;
    margin: 0 4px;
    align-items: center;
  }
  .item .buttons {
    display: none;
  }
  .item:hover .buttons, .item.selected .buttons {
    display: inline-flex;
  }
  .item:hover .buttons, .item.selected .buttons > button {
    color: white;
    display: inline-flex;
    /* margin-left: 3px; */
  }
  .item input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .item h2 {
    margin: 0 6px;
    font-weight: 300;
    font-size: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  
</style>