window.ATInternet = window.ATInternet || {};
window.ATInternet.HTMLMediaElement = {
    Controls: []
};
window.ATInternet.HTMLMediaElement.Times = {
    reset: function (media) {
        media.ATInternet.context.times.previous = 0;
        media.ATInternet.context.times.current = 0;
    },
    update: function (media) {
        media.ATInternet.context.times.previous = media.ATInternet.context.times.current;
        media.ATInternet.context.times.current = Math.floor(media.currentTime * 1000);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl = function (media, tag) {
    if ((typeof HTMLMediaElement !== 'undefined') && (media instanceof HTMLMediaElement)) {
        this.media = media;
        this.media.ATInternet = {
            tagAVI: new tag.avInsights.Media(media.dataset['at_av_heartbeat']),
            context: {
                state: 'ended',
                times: {
                    previous: 0,
                    current: 0
                }
            },
            init: false
        };
        this.addListeners();
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.addListeners = function () {
    var mediaControl = this;
    var events = [
        {
            action: ['play', 'playing', 'pause', 'ended'],
            method: 'fire'
        },
        {
            action: ['error', 'waiting', 'seeked', 'timeupdate']
        }
    ];
    for (var i = 0; i < events.length; i++) {
        for (var j = 0; j < events[i].action.length; j++) {
            window.ATInternet.Utils.addEvtListener(mediaControl.media, events[i].action[j], mediaControl[events[i].method || events[i].action[j]]);
        }
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.fire = function (e) {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    switch (media.ATInternet.context.state + e.type) {
        case 'endedplay':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.play(Math.floor(media.currentTime * 1000));
            break;
        case 'endedplaying':
        case 'playplaying':
        case 'bufferingplaying':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackStart(Math.floor(media.currentTime * 1000));
            break;
        case 'pauseplaying':
        case 'rebufferingplaying':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackResumed(Math.floor(media.currentTime * 1000));
            break;
        case 'playingpause':
        case 'bufferingpause':
        case 'rebufferingpause':
            if (!media.seeking) {
                media.ATInternet.context.state = e.type;
                media.ATInternet.tagAVI.playbackPaused(Math.floor(media.currentTime * 1000));
            }
            break;
        case 'playended':
        case 'playingended':
        case 'pauseended':
        case 'bufferingended':
        case 'rebufferingended':
            media.ATInternet.context.state = e.type;
            media.ATInternet.tagAVI.playbackStopped(Math.floor(media.currentTime * 1000));
            window.ATInternet.HTMLMediaElement.Times.reset(media);
            break;
        default:
            break;
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.timeupdate = function () {
    var media = this;
    if (media.ATInternet.context.times.current !== Math.floor(media.currentTime * 1000)) {
        window.ATInternet.HTMLMediaElement.Times.update(media);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.seeked = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (media.ATInternet.context.times.previous !== Math.floor(media.currentTime * 1000)) {
        media.ATInternet.tagAVI.seek(media.ATInternet.context.times.previous, Math.floor(media.currentTime * 1000));
        window.ATInternet.HTMLMediaElement.Times.update(media);
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.waiting = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (!media.seeking) {
        if (media.ATInternet.context.state === 'play') {
            media.ATInternet.context.state = 'buffering';
            media.ATInternet.tagAVI.bufferStart(Math.floor(media.currentTime * 1000));
        } else if (media.ATInternet.context.state === 'playing') {
            media.ATInternet.context.state = 'rebuffering';
            media.ATInternet.tagAVI.bufferStart(Math.floor(media.currentTime * 1000));
        }
    }
};
window.ATInternet.HTMLMediaElement.MediaControl.prototype.error = function () {
    var media = this;
    window.ATInternet.HTMLMediaElement.Tag.init(media);
    if (typeof media.error !== 'undefined') {
        media.ATInternet.tagAVI.error('Error ' + media.error.code + '; details: ' + media.error.message);
    }
};
window.ATInternet.HTMLMediaElement.Tag = {
    init: function (media) {
        media.ATInternet.tagAVI.set('av_player', media.dataset['at_av_player'] || '');
        media.ATInternet.tagAVI.set('av_player_version', media.dataset['at_av_player_version'] || '');
        media.ATInternet.tagAVI.set('av_player_position', media.dataset['at_av_player_position'] || '');
        media.ATInternet.tagAVI.set('av_content', media.dataset['at_av_content'] || '');
        media.ATInternet.tagAVI.set('av_content_id', media.dataset['at_av_content_id'] || media.currentSrc);
        media.ATInternet.tagAVI.set('av_content_type', media.dataset['at_av_content_type'] || '');
        media.ATInternet.tagAVI.set('av_content_duration', media.duration * 1000 || media.dataset['at_av_content_duration']);
        media.ATInternet.tagAVI.set('av_content_version', media.dataset['at_av_content_version'] || '');
        media.ATInternet.tagAVI.set('av_content_genre', window.ATInternet.Utils.jsonParse(media.dataset['at_av_content_genre']) || []);
        media.ATInternet.tagAVI.set('av_content_linked', media.dataset['at_av_content_linked'] || '');
        media.ATInternet.tagAVI.set('av_content_duration_range', media.dataset['at_av_content_duration_range'] || '');
        media.ATInternet.tagAVI.set('av_broadcasting_type', media.dataset['at_av_broadcasting_type'] || '');
        media.ATInternet.tagAVI.set('av_ad_type', media.dataset['at_av_ad_type'] || '');
        media.ATInternet.tagAVI.set('av_publication_date', media.dataset['at_av_publication_date'] || 0);
        media.ATInternet.tagAVI.set('av_show', media.dataset['at_av_show'] || '');
        media.ATInternet.tagAVI.set('av_show_season', media.dataset['at_av_show_season'] || '');
        media.ATInternet.tagAVI.set('av_episode_id', media.dataset['at_av_episode_id'] || '');
        media.ATInternet.tagAVI.set('av_episode', media.dataset['at_av_episode'] || '');
        media.ATInternet.tagAVI.set('av_channel', media.dataset['at_av_channel'] || '');
        media.ATInternet.tagAVI.set('av_author', media.dataset['at_av_author'] || '');
        media.ATInternet.tagAVI.set('av_broadcaster', media.dataset['at_av_broadcaster'] || '');
        media.ATInternet.tagAVI.set('av_auto_mode', window.ATInternet.Utils.jsonParse(media.dataset['at_av_auto_mode']) || false);
    }
};
window.ATInternet.HTMLMediaElement.init = function (tag) {
    if (typeof tag !== 'undefined') {
        var htmlTags = ['VIDEO', 'AUDIO'];
        var mediaObjects = [];
        for (var i = 0; i < htmlTags.length; i++) {
            mediaObjects = document.getElementsByTagName(htmlTags[i]);
            for (var j = 0; j < mediaObjects.length; j++) {
                window.ATInternet.HTMLMediaElement.Controls.push(new window.ATInternet.HTMLMediaElement.MediaControl(mediaObjects[j], tag));
            }
        }
    }
};
