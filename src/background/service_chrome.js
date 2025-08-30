chrome.webRequest.onCompleted.addListener(onRequestCompleted, {
    urls: ['<all_urls>'],
})

/**
 * @typedef {{
 *  type: string,
 *  url: string,
 *  statusCode: number,
 *  method: string,
 *  initiator: string | undefined,
 *  tabId: number
 * }} RequestDetails
 */

/**
 * @param {RequestDetails} details
 */
async function onRequestCompleted(details) {
    if (details.type !== 'font') return

    if (details.statusCode > 399) {
        console.warn('font load failed: ', details.url)
        return
    }

    /** @type {FontRecord} */
    const record = {
        tabId: details.tabId,
        url: details.url,
        initiator: details.initiator || null,
        ...fontFromUrl(details.url),
    }

    const key = keyForTab(details.tabId)
    const query = {
        [key]: [], // if no value found then default to `[]`
    }
    const data = await chrome.storage.session.get(query)

    /** @type {FontRecord[]} */
    const fontRecords = data[key]
    const containsRecord = fontRecords.some((x) => x.url === record.url)
    if (containsRecord) {
        console.debug('already contains record for font ', record.url)
        return
    }

    fontRecords.push(record)
    chrome.storage.session.set({
        [key]: fontRecords,
    })
    chrome.action.setBadgeText({
        tabId: details.tabId,
        text: `${fontRecords.length}`,
    })

    console.debug('adding font record', record)
}

/**
 *
 * @param {number} tabId
 * @returns {string}
 */
function keyForTab(tabId) {
    return `tab:${tabId}`
}

/**
 * @param {string} url
 * @returns {{
 *  name: string,
 *  format: string
 * }}
 */
function fontFromUrl(url) {
    const parts = url.split('/')
    const filename = parts[parts.length - 1]
    const [name, format] = filename.split('.')
    return { name, format }
}
