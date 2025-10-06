// 🎵 Music Player Script for GitHub Pages
// Cleaned, fixed, and tested by GPT-5

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// 🧮 Converts seconds → mm:ss format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// 🎧 Play a given track
function playMusic(track, pause = false) {
    if (!track) {
        console.error("❌ No track provided to playMusic()");
        return;
    }

    currentSong.src = track;

    if (!pause) {
        currentSong.play();
        document.querySelector("#play").src = "img/pause.svg";
    }

    const songName = decodeURIComponent(track.split("/").pop().replace(".mp3", ""));
    document.querySelector(".songinfo").innerText = songName;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// 🗂️ Fetch all songs from a specific folder (like /songs/BGM/)
async function getSongs(folder) {
    currFolder = folder;
    const response = await fetch(`/songs/${folder}/`);
    if (!response.ok) {
        console.error(`❌ Folder not found: /songs/${folder}/`);
        return [];
    }

    const html = await response.text();
    const div = document.createElement("div");
    div.innerHTML = html;

    songs = [];
    const links = div.getElementsByTagName("a");

    for (let a of links) {
        const href = a.getAttribute("href");
        if (href && href.endsWith(".mp3")) {
            const fileName = href.split("/").pop();
            songs.push(fileName);
        }
    }

    // 🎶 Update the song list
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img src="img/music.svg" class="invert" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Billu Bhai</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/play.svg" class="invert" alt="">
            </div>
        </li>`;
    }

    // ▶️ Click to play song
    Array.from(document.querySelectorAll(".songList li")).forEach(li => {
        li.addEventListener("click", () => {
            const songName = li.querySelector(".info div").innerText.trim();
            playMusic(`/songs/${folder}/${songName}`);
        });
    });

    return songs;
}

// 🧱 Display all albums (folders) inside /songs/
async function displayAlbums() {
    console.log("🎵 Displaying albums...");

    const res = await fetch(`/songs/`);
    if (!res.ok) {
        console.error("❌ Could not load /songs/ directory");
        return;
    }

    const html = await res.text();
    const div = document.createElement("div");
    div.innerHTML = html;

    const anchors = Array.from(div.getElementsByTagName("a"));
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const a of anchors) {
        const href = a.getAttribute("href");
        if (href && !href.endsWith(".mp3") && !href.endsWith(".htaccess")) {
            const folderName = href.replace("/", "").trim();

            try {
                const infoRes = await fetch(`/songs/${folderName}/info.json`);
                const info = infoRes.ok ? await infoRes.json() : {
                    title: folderName,
                    description: "No description available."
                };

                cardContainer.innerHTML += `
                <div data-folder="${folderName}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folderName}/cover.jpg" alt="${info.title}">
                    <h3>${info.title}</h3>
                    <p>${info.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`⚠️ Could not load info.json for ${folderName}`, err);
            }
        }
    }

    // 📀 Click on album → load songs
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.folder;
            console.log(`📀 Loading album: ${folder}`);
            songs = await getSongs(folder);
            if (songs.length > 0) {
                playMusic(`/songs/${folder}/${songs[0]}`);
                document.querySelector(".left").style.left = "0";
            } else {
                alert(`No songs found in ${folder}`);
            }
        });
    });
}

// 🚀 Main entry point
async function main() {
    // Load default album
    songs = await getSongs("BGM");
    if (songs.length > 0) playMusic(`/songs/BGM/${songs[0]}`, true);

    await displayAlbums();

    const playBtn = document.querySelector("#play");

    // ▶️ Play / Pause
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // ⏱ Update time + progress bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // 🎚 Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // 🍔 Hamburger open
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // ❌ Close sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // ⏮ Previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(`/songs/${currFolder}/${songs[index - 1]}`);
    });

    // ⏭ Next
    next.addEventListener("click", () => {
        currentSong.pause();
        const index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(`/songs/${currFolder}/${songs[index + 1]}`);
    });

    // 🔉 Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // 🔇 Mute / Unmute
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
