let player;
let pointA = null;
let pointB = null;
let isLooping = false;
let isPlaying = false;
let captionsEnabled = false;


// YouTube IFrame Player API の準備
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: '',
        playerVars: {
            'playsinline': 1,
            'cc_load_policy': 1,  // 字幕を有効化
            'cc_lang_pref': 'en'  // 優先言語をenglishに設定
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onReady': onPlayerReady
        }
    });
}

// URL から動画ID を抽出する関数
function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

// 動画URLを読み込む際の処理を更新
document.getElementById('loadButton').addEventListener('click', () => {
    const url = document.getElementById('videoUrl').value;
    const videoId = extractVideoID(url);
    if (videoId) {
        player.loadVideoById({
            'videoId': videoId,
            'startSeconds': 0,
            'suggestedQuality': 'large'
        });
        
        // 字幕の設定をリセット
        setTimeout(() => {
            if (captionsEnabled) {
                player.loadModule('captions');
                player.setOption('captions', 'track', {'languageCode': currentLanguage});
            }
        }, 1000);
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
// function onPlayerStateChange(event) {
//     if (event.data === YT.PlayerState.PLAYING) {
//         checkLoop();
//         updateCaption();
//     }
// }

// ループのチェック
function checkLoop() {
    if (!isLooping) return;
    
    const currentTime = player.getCurrentTime();
    if (currentTime >= pointB) {
        player.seekTo(pointA);
    }
    
    setTimeout(checkLoop, 100);
}



// 再生/停止の切り替え
document.getElementById('playPause').addEventListener('click', () => {
    if (isPlaying) {
        player.pauseVideo();
        isPlaying = false;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-play"></i> 再生';
    } else {
        player.playVideo();
        isPlaying = true;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-pause"></i> 停止';
    }
});

// 5秒戻す
document.getElementById('rewind5').addEventListener('click', () => {
    const currentTime = player.getCurrentTime();
    player.seekTo(Math.max(0, currentTime - 5), true);
});

// 5秒進める
document.getElementById('forward5').addEventListener('click', () => {
    const currentTime = player.getCurrentTime();
    player.seekTo(currentTime + 5, true);
});

// プレーヤーの状態変更時のコールバックを更新
function onPlayerStateChange(event) {
    // 既存のコード
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-pause"></i> 停止';
        if (captionsEnabled) {
            updateCaption();
        }
        checkLoop();

        // 再生開始時の追加処理
        updateTimeDisplay(); // 現在の再生時間を表示
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-play"></i> 再生';
    } else if (event.data === YT.PlayerState.ENDED) {
        // 動画終了時の処理
        isPlaying = false;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-play"></i> 再生';
        if (isLooping) {
            player.seekTo(pointA);
            player.playVideo();
        }
    } else if (event.data === YT.PlayerState.BUFFERING) {
        // バッファリング中の処理
        console.log('動画をバッファリング中...');
    } else if (event.data === YT.PlayerState.CUED) {
        // 動画がキューされた時の処理
        console.log('新しい動画がキューされました');
    }

    // ループ機能の処理
    if (isLooping && event.data === YT.PlayerState.PLAYING) {
        const currentTime = player.getCurrentTime();
        if (currentTime >= pointB) {
            player.seekTo(pointA);
        }
    }

    // エラーハンドリング
    if (event.data === YT.PlayerState.UNSTARTED) {
        console.log('動画の読み込みに問題が発生しました');
    }
}

// 現在の再生時間を表示する補助関数
function updateTimeDisplay() {
    if (isPlaying) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        // 時間表示の更新処理をここに追加
        
        setTimeout(updateTimeDisplay, 1000); // 1秒ごとに更新
    }
}


// 字幕の言語変更
document.getElementById('captionLanguage').addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    player.setOption('captions', 'track', {'languageCode': currentLanguage});
});

// 字幕の表示/非表示切り替え
document.getElementById('toggleCaption').addEventListener('click', () => {
    const captionContainer = document.querySelector('.caption-container');
    if (captionContainer.style.display === 'none') {
        captionContainer.style.display = 'block';
        captionsEnabled = true;
        // 字幕を有効化
        player.loadModule('captions');
        player.setOption('captions', 'track', {'languageCode': currentLanguage});
    } else {
        captionContainer.style.display = 'none';
        captionsEnabled = false;
        // 字幕を無効化
        player.unloadModule('captions');
    }
});

// プレーヤーの準備完了時
// 動画読み込み時に字幕トラックを確認
function onPlayerReady(event) {
    // 利用可能な字幕トラックを取得
    player.loadModule('captions');
    setTimeout(() => {
        const tracks = player.getOption('captions', 'tracklist');
        console.log('Available caption tracks:', tracks);
        
        if (!tracks || tracks.length === 0) {
            document.getElementById('captionText').textContent = 'No captions available for this video';
            return;
        }

        // 利用可能な言語を選択肢に追加
        const languageSelect = document.getElementById('captionLanguage');
        languageSelect.innerHTML = ''; // 既存のオプションをクリア
        
        tracks.forEach(track => {
            const option = document.createElement('option');
            option.value = track.languageCode;
            option.textContent = track.languageName;
            languageSelect.appendChild(option);
        });
    }, 1000); // YouTubeプレーヤーの初期化を待つ
}

function updateCaption() {
    if (!captionsEnabled) return;

    try {
        const currentTime = player.getCurrentTime();
        const captions = player.getOption('captions', 'getCaptions');
        
        if (captions) {
            document.getElementById('captionText').textContent = captions;
        }
    } catch (error) {
        console.error('Error updating captions:', error);
    }

    // 100ミリ秒ごとに更新
    setTimeout(updateCaption, 100);
}

