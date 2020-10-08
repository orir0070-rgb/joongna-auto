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

