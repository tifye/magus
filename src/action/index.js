setInterval(testLoop, 1000)

async function testLoop() {
    console.log(await chrome.storage.session.get('counter'))
}
