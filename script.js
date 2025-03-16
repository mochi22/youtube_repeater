let player;
let pointA = null;
let pointB = null;
let isLooping = false;
let isPlaying = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: {
            'playsinline': 1,
            'cc_load_policy': 1,
            'cc_lang_pref': 'en',
            'origin': window.location.origin,  // この行を追加
            'enablejsapi': 1,                 // この行を追加
            'widget_referrer': window.location.href  // この行を追加
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onApiChange': onApiChange
        }
    });
}

function extractVideoID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

document.getElementById('loadButton').addEventListener('click', () => {
    const url = document.getElementById('videoUrl').value;
    const videoId = extractVideoID(url);
    if (videoId) {
        player.loadVideoById(videoId);
        setTimeout(initializeCaptions, 1000);
    } else {
        alert('有効なYouTube URLを入力してください。');
    }
});

function onPlayerReady(event) {
    console.log('Player is ready');
    setTimeout(initializeCaptions, 1000);
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-pause"></i> 停止';
        checkLoop();
        updateCaptions();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        document.getElementById('playPause').innerHTML = '<i class="fas fa-play"></i> 再生';
    }
}

function onApiChange() {
    console.log('API changed');
    initializeCaptions();
}

function initializeCaptions() {
    try {
        const tracks = player.getAvailableQualityLevels();
        player.loadModule('captions');
        const trackList = player.getOption('captions', 'tracklist');
        
        if (trackList && trackList.length > 0) {
            const languageSelect = document.getElementById('captionLanguage');
            languageSelect.innerHTML = '';
            
            trackList.forEach(track => {
                const option = document.createElement('option');
                option.value = track.languageCode;
                option.textContent = track.languageName;
                languageSelect.appendChild(option);
            });
            
            document.querySelector('.caption-container').style.display = 'block';
        }
    } catch (error) {
        console.error('Caption initialization error:', error);
    }
}

function updateCaptions() {
    if (player && player.getOptions().includes('captions')) {
        const currentCaption = player.getCurrentTime();
        const captions = player.getOption('captions', 'getCaptions');
        if (captions) {
            document.getElementById('captionText').textContent = captions;
        }
    }
    if (isPlaying) {
        requestAnimationFrame(updateCaptions);
    }
}

document.getElementById('setPointA').addEventListener('click', () => {
    pointA = player.getCurrentTime();
    document.getElementById('pointA').textContent = pointA.toFixed(2) + '秒';
});

document.getElementById('setPointB').addEventListener('click', () => {
    pointB = player.getCurrentTime();
    document.getElementById('pointB').textContent = pointB.toFixed(2) + '秒';
});

document.getElementById('startLoop').addEventListener('click', () => {
    if (pointA !== null && pointB !== null && pointA < pointB) {
        isLooping = true;
        player.seekTo(pointA);
        player.playVideo();
    } else {
        alert('有効なA点とB点を設定してください。');
    }
});

document.getElementById('stopLoop').addEventListener('click', () => {
    isLooping = false;
});

function checkLoop() {
    if (isLooping && player.getCurrentTime() >= pointB) {
        player.seekTo(pointA);
    }
    if (isPlaying) {
        setTimeout(checkLoop, 100);
    }
}

document.getElementById('playPause').addEventListener('click', () => {
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
});

document.getElementById('rewind5').addEventListener('click', () => {
    const currentTime = player.getCurrentTime();
    player.seekTo(Math.max(0, currentTime - 5), true);
});

document.getElementById('forward5').addEventListener('click', () => {
    const currentTime = player.getCurrentTime();
    player.seekTo(currentTime + 5, true);
});

document.getElementById('toggleCaption').addEventListener('click', () => {
    const container = document.querySelector('.caption-container');
    if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        player.loadModule('captions');
    } else {
        container.style.display = 'none';
        player.unloadModule('captions');
    }
});

document.getElementById('captionLanguage').addEventListener('change', (e) => {
    player.setOption('captions', 'track', {'languageCode': e.target.value});
});