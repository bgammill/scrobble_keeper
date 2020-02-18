const puppeteer = require('puppeteer');

const selectors = {
    'username': 'input#input-10',
    'unfuck': '#input-20',
    'type': '#json-list-item-32',
    'export': '.mr-4'
};

function waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {
    page.on('request', onRequestStarted);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);

    let inflight = 0;
    let fulfill;
    let promise = new Promise(x => fulfill = x);
    let timeoutId = setTimeout(onTimeoutDone, timeout);
    return promise;

    function onTimeoutDone() {
        page.removeListener('request', onRequestStarted);
        page.removeListener('requestfinished', onRequestFinished);
        page.removeListener('requestfailed', onRequestFinished);
        fulfill();
    }

    function onRequestStarted() {
        ++inflight;
        if (inflight > maxInflightRequests)
            clearTimeout(timeoutId);
    }

    function onRequestFinished() {
        if (inflight === 0)
            return;
        --inflight;
        if (inflight === maxInflightRequests)
            timeoutId = setTimeout(onTimeoutDone, timeout);
    }
}

(async() => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('https://lastfm.ghan.nl/export/', {
        waitUntil: 'networkidle0'
    });

    // input username
    await page.focus(selectors.username);
    await page.keyboard.type('bgammill');
    await page.waitFor(100);

    // initial format click to unfuck vue
    await page.click(selectors.unfuck);
    await page.waitFor(100);

    // click json
    await page.click(selectors.type);
    await page.waitFor(100);

    // allow downloads
    await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: './'
    });

    // do the damn thing
    await page.click(selectors.export);

    // wait until network has been idle for 5 seconds
    await waitForNetworkIdle(page, 5000, 0);

    await browser.close();
})();