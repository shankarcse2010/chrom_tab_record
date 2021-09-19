
document.addEventListener('DOMContentLoaded', function () {
document.querySelector('#btn-watch').addEventListener('click',()=>broadCast('watch_tab'));
document.querySelector('#btn-stop').addEventListener('click',()=>broadCast('stop_tab'));
document.querySelector('#btn-download').addEventListener('click',()=>broadCast('download_tab'));
});

function broadCast(type){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type});
    });
}

