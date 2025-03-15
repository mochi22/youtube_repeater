let player;
let pointA = null;
let pointB = null;
let isLooping = false;

// YouTube IFrame Player API の準備
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

// URL から動画ID を抽出する関数
function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

// 動画読み込みボタンのイベントリスナー
document.getElementById('loadButton').addEventListener('click', () => {
    const url = document.getElementById('videoUrl').value;
    const videoId = extractVideoID(url);
    if (videoId) {
        player.loadVideoById(videoId);
    } else {
        alert('有効なYouTube URLを入力してください。');
    }
});

// A点設定ボタン
document.getElementById('setPointA').addEventListener('click', () => {
    pointA = player.getCurrentTime();
    document.getElementById('pointA').textContent = pointA.toFixed(2) + '秒';
});

// B点設定ボタン
document.getElementById('setPointB').addEventListener('click', () => {
    pointB = player.getCurrentTime();
    document.getElementById('pointB').textContent = pointB.toFixed(2) + '秒';
});

// ループ開始ボタン
document.getElementById('startLoop').addEventListener('click', () => {
    if (pointA !== null && pointB !== null && pointA < pointB) {
        isLooping = true;
        player.seekTo(pointA);
        player.playVideo();
    } else {
        alert('有効なA点とB点を設定してください。');
    }
});

// ループ停止ボタン
document.getElementById('stopLoop').addEventListener('click', () => {
    isLooping = false;
});

// プレーヤーの状態変更時のコールバック
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        checkLoop();
    }
}

// ループのチェック
function checkLoop() {
    if (!isLooping) return;
    
    const currentTime = player.getCurrentTime();
    if (currentTime >= pointB) {
        player.seekTo(pointA);
    }
    
    setTimeout(checkLoop, 100);
}