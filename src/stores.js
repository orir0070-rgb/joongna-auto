import { writable } from "svelte/store";
import storage from "./storage";

const storageWritable = (storageKey, initialValue) => {
  const store = writable(storage.get(storageKey) ?? initialValue);
  store.subscribe((value) => storage.set(storageKey, value));
  return store;
};

export const presets = storageWritable("presets", []);

export const selectedPresetIndex = storageWritable("selected-preset-index", -1);

export const boardList = storageWritable("board-list", []);
