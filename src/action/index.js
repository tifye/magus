/** @type {HTMLLIElement} */
const fontLiTemplate = document
    .querySelector('#font-li-template')
    .content.querySelector('.font-li')

const fontRecordsUl = document.getElementById('font-records')

loadFontRecords()

async function loadFontRecords() {
    const tabId = await activeTabId()
    const key = keyForTab(tabId)

    let data
    try {
        data = await chrome.storage.session.get(key)
    } catch (err) {
        console.error(err)
        return
    }

    /** @type {FontRecord[]} */
    const fontRecords = data[key] || []
    if (fontRecords.length === 0) {
        console.debug('no font records found')
        return
    }

    for (let i = 0; i < fontRecords.length; i++) {
        const record = fontRecords[i]

        /** @type {HTMLLIElement} */
        const fontLi = fontLiTemplate.cloneNode(true)

        const fontNameSpan = fontLi.querySelector('.font-name')
        fontNameSpan.textContent = record.name

        const fontFormatSpan = fontLi.querySelector('.font-format')
        fontFormatSpan.textContent = record.format

        /** @type {HTMLAnchorElement} */
        const fontDownloadLink = fontLi.querySelector('.font-download')
        fontDownloadLink.href = record.url

        const fontExamplePg = fontLi.querySelector('.font-example')
        applyFontFromUrl(fontExamplePg, record.url)

        console.log(record)
        fontRecordsUl.appendChild(fontLi)
    }
}

/**
 * @param {number} tabId
 * @returns {string}
 */
function keyForTab(tabId) {
    return `tab:${tabId}`
}

/**
 * @returns {Promise<number>}
 */
async function activeTabId() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab.id
}

/**
 * @param {HTMLElement} element
 * @param {string} url
 */
async function applyFontFromUrl(element, url) {
    const res = await fetch(url, {
        headers: {
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            Origin: 'https://www.apple.com',
        },
    })
    const buf = await res.arrayBuffer()

    // Option A: CSS Font Loading API (clean and flexible)
    const font = new FontFace('TempFont', buf)
    await font.load()
    document.fonts.add(font)

    element.style.fontFamily = `"${'TempFont'}", system-ui, sans-serif`
}
