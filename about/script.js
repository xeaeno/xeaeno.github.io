let currentActivityIndex = 0;
let previousData = null;

$(document).ready(function () {
    updateStatus();
    consoleText(['Vensin', 'About Me'], 'text', ['white', 'white']);

    const muteButton = $("#muteButton");
    const audio = $("#myAudio")[0];

    muteButton.on("click", function () {
        if (!audio.src) {
            audio.src = "audio-file.mp3"; 
            audio.load();
        }
        audio.muted = !audio.muted;
        $(this).html(audio.muted
            ? '<i class="fas fa-volume-mute icon"></i>'
            : '<i class="fas fa-volume-up icon"></i>');
    });

    const icons = {
        activity: $("#activity-icon"),
        music: $("#music-icon"),
        status: $("#status-icon"),
    };

    const popups = {
        activity: $("#activity-popup"),
        song: $("#song-popup"),
        status: $("#status-popup"),
    };
    
    icons.activity.on("click", function () {
        const activityText = $(this).data("activity");
        showPopup(popups.activity, activityText, "activity-popup");  
    });
    
    icons.music.on("click", function () {
        const songText = $(this).data("song");
        const songLink = $(this).data("song-link");
        showPopup(popups.song, `<a href="${songLink}" target="_blank" style="color: white;">${songText}</a>`, "song-popup");  
    });
    
    icons.status.on("click", function () {
        const stateText = $(this).data("state");
        showPopup(popups.status, stateText, "status-popup");  
    });
});

function showPopup(popupElement, content, popupType) {
    popupElement.html(content); 
    popupElement.removeClass(`${popupType}-hide`).addClass(`${popupType}-show`); 

    setTimeout(() => {
        popupElement.removeClass(`${popupType}-show`).addClass(`${popupType}-hide`);
    }, 5000);
}


function consoleText(words, id, colors) {
    if (colors === undefined) colors = ['#fff'];
    var visible = true;
    var con = document.getElementById('username');
    var letterCount = 1;
    var x = 1;
    var waiting = false;
    var target = document.getElementById(id);
    target.setAttribute('style', 'color:' + colors[0]);
    
    window.setInterval(function() {
        if (letterCount === 0 && waiting === false) {
            waiting = true;
            target.innerHTML = words[0].substring(0, letterCount);
            window.setTimeout(function() {
                var usedColor = colors.shift();
                colors.push(usedColor);
                var usedWord = words.shift();
                words.push(usedWord);
                x = 1;
                target.setAttribute('style', 'color:' + colors[0]);
                letterCount += x;
                waiting = false;
            }, 1000);
        } else if (letterCount === words[0].length + 1 && waiting === false) {
            waiting = true;
            window.setTimeout(function() {
                x = -1;
                letterCount += x;
                waiting = false;
            }, 1000);
        } else if (waiting === false) {
            target.innerHTML = words[0].substring(0, letterCount);
            letterCount += x;
        }
    }, 120);
    
    window.setInterval(function() {
        if (visible === true) {
            con.className = 'underscore hidden';
            visible = false;
        } else {
            con.className = 'underscore';
            visible = true;
        }
    }, 400);
  }
  

function removeBlur() {
    $('#blur-screen').fadeOut(300);
    $('#container--main').removeClass('hidden').css({opacity: '1', transform: 'translateY(0)'});;
    const audio = $("#myAudio")[0];
    audio.volume = 0.2;
    audio.loop = true;
    audio.play();
}

async function fetchDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/531896089096486922`);
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Abrufen der Discord-Daten:", error);
        return null;
    }
}

async function updateStatus() {
    const discordData = await fetchDiscordStatus();
    if (!discordData || !discordData.success || JSON.stringify(discordData.data) === JSON.stringify(previousData)) return;

    previousData = discordData.data;
    const data = discordData.data;
    const statusIndicator = $('#status-indicator');
    const icons = {
        activity: $("#activity-icon"),
        music: $("#music-icon"),
        status: $("#status-icon"),
    };

    const statusClass = `status-${data.discord_status} glow-effect`;
    statusIndicator.attr('class', statusClass);

    const customActivity = data.activities.find(activity => activity.type === 4);
    const statusIcon = $("#status-icon");

    if (customActivity) {
        statusIcon.show();
        statusIcon.data("state", customActivity.state); 

        if (customActivity.emoji) {
            let emojiHTML = '';
            if (customActivity.emoji.animated) {
                emojiHTML = `<img src="https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.gif" alt="${customActivity.emoji.name}" class="status-icon-img" />`;
            } else {
                emojiHTML = `<img src="https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.png" alt="${customActivity.emoji.name}" class="status-icon-img" />`;
            }
            statusIcon.html(emojiHTML); 
        } else {
            statusIcon.html('💬');
        }
    } else {
        statusIcon.hide();
    }
    if (data.listening_to_spotify) {
        const spotify = data.spotify;
        icons.music.addClass("rotating").css('display', 'block').data("song", spotify.song).data("song-link", `https://open.spotify.com/track/${spotify.track_id}`);
    } else {
        icons.music.removeClass("rotating").css('display', 'none');
    }

    const otherActivities = data.activities.filter(activity => activity.type !== 4 && activity.name !== "Spotify");
    if (otherActivities.length > 0) {
        const activity = otherActivities[currentActivityIndex];
        let emoji = '';
        let activityText = '';

        switch (activity.name) {
            case "AniWorld":
            case "Netflix":
                emoji = '🍿';
                activityText = `Schaut ${activity.details} (${activity.name})`;
                break;
            case "Visual Studio Code":
                const filteredDetails = activity.state.replace(/💼/g, '').replace(/ᕁ/g, '').trim(); 
                emoji = '⌨️';
                activityText = `Working - ${filteredDetails}`;
                break;  
            case "YouTube":
                const startTime = activity.timestamps?.start;
                const endTime = activity.timestamps?.end;
        
                let durationText = '';
                if (startTime && endTime) {
                    const duration = (endTime - startTime) / (1000 * 60); 
                    durationText = `(${Math.floor(duration)} Min.)`;
                }
        
                emoji = '📺';
                activityText = `Schaut ${activity.details} ${durationText}`;
                break;
            default:
                if (activity.type === 0 && activity.name) { 
                    const startTime = activity.timestamps?.start;
                    let elapsedTime = "";
                    
                    if (startTime) {
                        const now = Date.now();
                        const duration = now - startTime;
        
                        const hours = Math.floor(duration / (1000 * 60 * 60));
                        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        
                        elapsedTime = hours > 0 
                            ? `seit ${hours}h` 
                            : (minutes > 0 ? `seit ${minutes}m` : `gerade eben`);
                    }
        
                    emoji = '🎮';
                    activityText = `Spielt ${activity.name} (${elapsedTime})`;
                } else {
                    console.warn(`Unbekannte Aktivität: ${activity.name}`);
                }
        }

        icons.activity.html(emoji).css('display', 'block').data("activity", activityText);
        currentActivityIndex = (currentActivityIndex + 1) % otherActivities.length;
    } else {
        icons.activity.css('display', 'none');
    }
}


setInterval(updateStatus, 60000);
