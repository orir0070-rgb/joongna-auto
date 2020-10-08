export async function cleanUpLoginPage(webview) {
  await webview.runJS(`
    document.querySelector("a.sp.h_logo").href = "#";
  `);
  await webview.removeElementsWithJS(
    `div.lang`,
    `.find_info`,
    `.qr_once_wrap .title`,
    `.nudge_tooltip`,
    `.whale_wrap`,
    `a[class*="banner"]`
  );
}

export async function cleanUpWritePage(webview) {
  await webview.collapseElementsWithCSS(
    "div.ArticleWriteHeader",
    ".ButtonBase.ButtonBase--gray",
    ".ArticleWriteFormSelectBox"
  );
  await webview.waitElementWithJS(".btn.btn_fold");
  await webview.clickElement(".btn.btn_fold > a");
}

export async function waitWritePageReady(webview) {
  await webview.waitElementWithJS(
    "button.se-place-toolbar-button.se-document-toolbar-basic-button"
  );
}

export async function getBoardList(webview) {
  await webview.clickElement(".selectbox");
  await webview.waitElementWithJS(".select_board ul");
  const list = await webview.runJS(`
    Array.prototype.map.call(
      document.querySelectorAll(".select_board ul li label"),
      el => el.innerText
    );
  `);
  await webview.clickElement("button.btn_close");
  return list;
}

