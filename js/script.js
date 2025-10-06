let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds → mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,"0")}:${String(remainingSeconds).padStart(2,"0")}`;
}

function playMusic(track, pause = false) {
    if (!track) return;

    currentSong.src = track;

    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    }

    const songName = decodeURIComponent(track.split("/").pop().replace(".mp3", ""));
    document.querySelector(".songinfo").innerText = songName;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    // ✅ When the song ends, reset everything
    currentSong.addEventListener("ended", () => {
        // Reset audio to start
        currentSong.currentTime = 0;

        // Reset seekbar circle position
        const circle = document.querySelector(".circle");
        if (circle) circle.style.left = "0%";

        // Reset time text
        const songTime = document.querySelector(".songtime");
        if (songTime) songTime.innerText = "00:00 / 00:00";

        // Change pause icon back to play
        const playBtn = document.querySelector("#play");
        if (playBtn) playBtn.src = "img/play.svg";
    });
}


// Get songs from folder using songs.json
async function getSongs(folder){
    currFolder = folder;
    const res = await fetch(`https://23466-cm-084.github.io/Project/songs/${folder}/songs.json`);
    const data = await res.json(); // array of filenames
    songs = data;

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach(song => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="img/music.svg" class="invert" alt="">
            <div class="info"><div>${song}</div><div>Billu Bhai</div></div>
            <div class="playnow"><span>Play Now</span><img src="img/play.svg" class="invert"></div>
        `;
        li.addEventListener("click", () => {
            // ✅ Use absolute URL to avoid any undefined/404
            playMusic(`https://23466-cm-084.github.io/Project/songs/${folder}/${song}`);
            currentSong.play();
            document.querySelector("#play").src="img/pause.svg";
        });
        songUL.appendChild(li);
    });

    return songs;
}

// Display albums dynamically
async function displayAlbums(){
    const res = await fetch('https://23466-cm-084.github.io/Project/songs/index.json');
    const data = await res.json();
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML="";

    for(const folder of data.albums){
        try{
            const infoRes = await fetch(`https://23466-cm-084.github.io/Project/songs/${folder}/info.json`);
            const info = await infoRes.json();
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"/></svg></div>
                <img src="https://23466-cm-084.github.io/Project/songs/${folder}/cover.jpg" alt="">
                <h3>${info.title}</h3>
                <p>${info.description}</p>
            </div>`;
        }catch(err){
            console.warn(`Cannot load info.json for ${folder}`);
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card=>{
        card.addEventListener("click", async ()=>{
            songs = await getSongs(card.dataset.folder);
            if(songs.length>0) playMusic(`https://23466-cm-084.github.io/Project/songs/${card.dataset.folder}/${songs[0]}`);
            document.querySelector(".left").style.left="0";
        });
    });
}

// Main function
async function main(){
    await displayAlbums();

    // Load first album by default
    const res = await fetch('https://23466-cm-084.github.io/Project/songs/index.json');
    const allAlbums = await res.json();
    if(allAlbums.albums.length>0){
        const first = allAlbums.albums[0];
        songs = await getSongs(first);
        if(songs.length>0) playMusic(`https://23466-cm-084.github.io/Project/songs/${first}/${songs[0]}`,true);
    }

    // Play/Pause
    document.querySelector("#play").addEventListener("click",()=>{
        if(currentSong.paused){currentSong.play();document.querySelector("#play").src="img/pause.svg";}
        else{currentSong.pause();document.querySelector("#play").src="img/play.svg";}
    });

    // Next/Previous
    const previous = document.querySelector("#previous");
    const next = document.querySelector("#next");

    previous.addEventListener("click",()=>{
        const idx = songs.indexOf(currentSong.src.split("/").pop());
        if(idx>0) playMusic(`https://23466-cm-084.github.io/Project/songs/${currFolder}/${songs[idx-1]}`);
    });

    next.addEventListener("click",()=>{
        const idx = songs.indexOf(currentSong.src.split("/").pop());
        if(idx<songs.length-1) playMusic(`https://23466-cm-084.github.io/Project/songs/${currFolder}/${songs[idx+1]}`);
    });

    // Time update
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100+"%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click",(e)=>{
        const percent = (e.offsetX / e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent+"%";
        currentSong.currentTime = (currentSong.duration*percent)/100;
    });

    // Hamburger open/close
    document.querySelector(".hamburger").addEventListener("click",()=>{document.querySelector(".left").style.left="0";});
    document.querySelector(".close").addEventListener("click",()=>{document.querySelector(".left").style.left="-100%";});

    // Volume
    document.querySelector(".range input").addEventListener("change",(e)=>{currentSong.volume=parseInt(e.target.value)/100;});
    document.querySelector(".volume img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg"); currentSong.volume=0; document.querySelector(".range input").value=0;
        }else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg"); currentSong.volume=0.1; document.querySelector(".range input").value=10;
        }
    });
}

main();
