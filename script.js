/* =========================================================
   GET TROPHY ID FROM URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const trophyId =
    params.get("id");


/* =========================================================
   MAIN ELEMENTS
========================================================= */

const title =
    document.getElementById("title");

const image =
    document.getElementById("trophyImage");

const factsContainer =
    document.getElementById("factsContainer");

const historyText =
    document.getElementById("historyText");

const timelineContainer =
    document.getElementById("timelineContainer");


/* =========================================================
   SUMMARY / TIMELINE ELEMENTS
========================================================= */

const summaryViewBlock =
    document.getElementById("summaryViewBlock");

const timelineViewBlock =
    document.getElementById("timelineViewBlock");

const toggleSummaryBtn =
    document.getElementById("toggleSummaryBtn");

const toggleTimelineBtn =
    document.getElementById("toggleTimelineBtn");


/* =========================================================
   AUDIO ELEMENTS
========================================================= */

const playButton =
    document.getElementById("playButton");

const audioPlayer =
    document.getElementById("audioPlayer");

const audioSeekControls =
    document.getElementById(
        "audioSeekControls"
    );

const audioPauseBtn =
    document.getElementById(
        "audioPauseBtn"
    );

const audioPlayIcon =
    document.getElementById(
        "audioPlayIcon"
    );

const audioSeekBar =
    document.getElementById(
        "audioSeekBar"
    );

const audioCurrentTime =
    document.getElementById(
        "audioCurrentTime"
    );

const audioTotalTime =
    document.getElementById(
        "audioTotalTime"
    );


/* =========================================================
   ICON MAP FOR FACT CARDS
========================================================= */

const iconMap = {

    "presented to":
        "👤",

    "date of presentation":
        "📅",

    "date of commemoration":
        "📆",

    "occasion":
        "⚔️",

    "presented by":
        "🎖️",

    "material":
        "🛡️",

    "description":
        "📄"

};


/* =========================================================
   LOAD TROPHY JSON
========================================================= */

async function loadData() {

    try {

        const response =
            await fetch(
                "data/trophies.json"
            );


        if (!response.ok) {

            throw new Error(

                "Could not load trophies.json"

            );

        }


        const trophies =
            await response.json();


        let currentTrophy;


        /*
           If URL contains ?id=...
           find that trophy.

           Otherwise show first trophy.
        */

        if (trophyId) {

            currentTrophy =
                trophies.find(

                    item =>
                        item.id === trophyId

                );

        } else {

            currentTrophy =
                trophies[0];

        }


        if (currentTrophy) {

            displayPlacard(
                currentTrophy
            );

        } else {

            console.error(

                "Trophy not found:",

                trophyId

            );

        }


    } catch (error) {

        console.error(

            "Data load error:",

            error

        );

    }

}


/* =========================================================
   DISPLAY TROPHY
========================================================= */

function displayPlacard(trophy) {


    /* =====================================================
       TITLE
    ===================================================== */

    title.textContent =
        trophy.title || "";


    /* =====================================================
       TROPHY IMAGE
    ===================================================== */

    if (trophy.image) {

        image.src =
            `images/${trophy.image}`;

        image.style.display =
            "";

    } else {

        image.removeAttribute(
            "src"
        );

        image.style.display =
            "none";

    }


    /* =====================================================
       HISTORY / SUMMARY
    ===================================================== */

    const historyArray =

        Array.isArray(
            trophy.history
        )

        ? trophy.history

        : trophy.history

            ? [trophy.history]

            : [];


    historyText.innerHTML =

        historyArray

            .map(

                text =>
                    `<p>${text}</p>`

            )

            .join("");


    /* =====================================================
       TIMELINE
    ===================================================== */

    if (

        trophy.timeline &&

        trophy.timeline.length > 0

    ) {


        toggleTimelineBtn.style.display =
            "flex";


        timelineContainer.innerHTML =

            trophy.timeline

                .map(

                    (node, i) => `

                    <div class="timeline-node">

                        <div
                            class="node-marker ${
                                i === 1
                                    ? "highlight"
                                    : ""
                            }">
                        </div>


                        <div class="node-content">

                            <h4>
                                ${node.title}
                            </h4>

                            <p>
                                ${node.text}
                            </p>

                        </div>

                    </div>

                `

                )

                .join("");


    } else {


        toggleTimelineBtn.style.display =
            "none";


        timelineContainer.innerHTML =
            "";

    }


    /* =====================================================
       FACTS
    ===================================================== */

    factsContainer.innerHTML =
        "";


    if (trophy.facts) {


        const factsArray =
            Object.entries(
                trophy.facts
            );


        /*
           First four facts appear
           in normal grid.
        */

        const gridItems =
            factsArray.slice(
                0,
                4
            );


        /*
           Remaining facts appear
           as full width banners.
        */

        const bannerItems =
            factsArray.slice(4);


        const splitRowWrapper =
            document.createElement(
                "div"
            );


        splitRowWrapper.className =
            "matrix-row-split";


        gridItems.forEach(

            ([key, value]) => {


                const icon =

                    iconMap[

                        key
                            .toLowerCase()
                            .trim()

                    ] || "▪";


                splitRowWrapper
                    .insertAdjacentHTML(

                        "beforeend",

                        `

                        <div class="fact-card">

                            <div class="key-icon">

                                ${icon}

                            </div>


                            <div class="fact-meta-container">

                                <span class="fact-key">

                                    ${key}

                                </span>


                                <span class="fact-val">

                                    ${value}

                                </span>

                            </div>

                        </div>

                        `

                    );

            }

        );


        factsContainer.appendChild(
            splitRowWrapper
        );


        bannerItems.forEach(

            ([key, value]) => {


                const icon =

                    iconMap[

                        key
                            .toLowerCase()
                            .trim()

                    ] || "▪";


                factsContainer
                    .insertAdjacentHTML(

                        "beforeend",

                        `

                        <div
                            class="fact-card
                                   full-width-banner">

                            <div class="key-icon">

                                ${icon}

                            </div>


                            <div class="fact-meta-container">

                                <span class="fact-key">

                                    ${key}

                                </span>


                                <span class="fact-val">

                                    ${value}

                                </span>

                            </div>

                        </div>

                        `

                    );

            }

        );

    }


    /* =====================================================
       AUDIO
    ===================================================== */

    resetAudioUI();


    if (trophy.audio) {


        /*
           Load MP3 specified
           in trophies.json
        */

        audioPlayer.src =
            `audio/${trophy.audio}`;


        /*
           Load metadata so duration
           becomes available.
        */

        audioPlayer.load();


        /*
           Initial state:

           LISTEN TO THE STORY visible
           Seek player hidden
        */

        playButton.hidden =
            false;

        playButton.style.display =
            "inline-flex";


        audioSeekControls.hidden =
            true;


    } else {


        /*
           No audio available.

           Hide both controls.
        */

        playButton.hidden =
            true;

        playButton.style.display =
            "none";


        audioSeekControls.hidden =
            true;


        audioPlayer.removeAttribute(
            "src"
        );

    }

}


/* =========================================================
   SUMMARY / TIMELINE SWITCH
========================================================= */

window.switchView =
    function (view) {


        summaryViewBlock
            .classList
            .toggle(

                "hidden-element",

                view !== "summary"

            );


        timelineViewBlock
            .classList
            .toggle(

                "hidden-element",

                view !== "timeline"

            );


        toggleSummaryBtn
            .classList
            .toggle(

                "active",

                view === "summary"

            );


        toggleTimelineBtn
            .classList
            .toggle(

                "active",

                view === "timeline"

            );

    };


/* =========================================================
   FORMAT AUDIO TIME

   65 seconds -> 1:05
========================================================= */

function formatAudioTime(
    seconds
) {


    if (

        !Number.isFinite(
            seconds
        )

    ) {

        return "0:00";

    }


    const minutes =

        Math.floor(
            seconds / 60
        );


    const secs =

        Math.floor(
            seconds % 60
        );


    return (

        minutes +

        ":" +

        secs
            .toString()
            .padStart(
                2,
                "0"
            )

    );

}


/* =========================================================
   RESET AUDIO UI
========================================================= */

function resetAudioUI() {


    /*
       Stop previous playback.
    */

    audioPlayer.pause();


    /*
       Reset seek position.
    */

    try {

        audioPlayer.currentTime =
            0;

    } catch (error) {

        /*
           No audio loaded yet.
           Safe to ignore.
        */

    }


    audioSeekBar.value =
        0;


    audioSeekBar
        .style
        .setProperty(

            "--audio-progress",

            "0%"

        );


    audioCurrentTime.textContent =
        "0:00";


    audioTotalTime.textContent =
        "0:00";


    audioPlayIcon.textContent =
        "❚❚";


    audioSeekControls.hidden =
        true;


    audioSeekControls.style.display =
        "";

}


/* =========================================================
   CLICK ORIGINAL
   "LISTEN TO THE STORY"

   BUTTON -> SEEK PLAYER
========================================================= */

playButton.addEventListener(

    "click",

    async function () {


        /*
           Hide original button.
        */

        playButton.hidden =
            true;


        playButton.style.display =
            "none";


        /*
           Show seek controls.
        */

        audioSeekControls.hidden =
            false;


        audioSeekControls.style.display =
            "flex";


        /*
           Start playback.
        */

        try {


            await audioPlayer.play();


        } catch (error) {


            console.error(

                "Audio playback failed:",

                error

            );


            /*
               If playback fails,
               restore original button.
            */

            audioSeekControls.hidden =
                true;


            audioSeekControls.style.display =
                "";


            playButton.hidden =
                false;


            playButton.style.display =
                "inline-flex";

        }

    }

);


/* =========================================================
   PLAY / PAUSE INSIDE SEEK PLAYER
========================================================= */

audioPauseBtn.addEventListener(

    "click",

    async function () {


        if (audioPlayer.paused) {


            try {


                await audioPlayer.play();


            } catch (error) {


                console.error(

                    "Audio playback failed:",

                    error

                );

            }


        } else {


            audioPlayer.pause();

        }

    }

);


/* =========================================================
   AUDIO PLAYING

   Show PAUSE icon
========================================================= */

audioPlayer.addEventListener(

    "play",

    function () {


        audioPlayIcon.textContent =
            "❚❚";

    }

);


/* =========================================================
   AUDIO PAUSED

   Show PLAY icon
========================================================= */

audioPlayer.addEventListener(

    "pause",

    function () {


        if (!audioPlayer.ended) {


            audioPlayIcon.textContent =
                "▶";

        }

    }

);


/* =========================================================
   GET TOTAL DURATION
========================================================= */

audioPlayer.addEventListener(

    "loadedmetadata",

    function () {


        audioTotalTime.textContent =

            formatAudioTime(

                audioPlayer.duration

            );

    }

);


/* =========================================================
   UPDATE SEEK BAR
   WHILE AUDIO PLAYS
========================================================= */

audioPlayer.addEventListener(

    "timeupdate",

    function () {


        if (

            !Number.isFinite(
                audioPlayer.duration
            )

            ||

            audioPlayer.duration <= 0

        ) {

            return;

        }


        /*
           Percentage played.
        */

        const progress =

            (

                audioPlayer.currentTime

                /

                audioPlayer.duration

            )

            * 100;


        /*
           Move slider.
        */

        audioSeekBar.value =
            progress;


        /*
           Fill golden portion.
        */

        audioSeekBar
            .style
            .setProperty(

                "--audio-progress",

                progress + "%"

            );


        /*
           Update current time.
        */

        audioCurrentTime.textContent =

            formatAudioTime(

                audioPlayer.currentTime

            );

    }

);


/* =========================================================
   USER SEEKS AUDIO
========================================================= */

audioSeekBar.addEventListener(

    "input",

    function () {


        if (

            !Number.isFinite(
                audioPlayer.duration
            )

            ||

            audioPlayer.duration <= 0

        ) {

            return;

        }


        const percentage =

            Number(
                audioSeekBar.value
            );


        const newTime =

            (

                percentage / 100

            )

            *

            audioPlayer.duration;


        /*
           Jump to selected point.
        */

        audioPlayer.currentTime =
            newTime;


        /*
           Update golden bar immediately.
        */

        audioSeekBar
            .style
            .setProperty(

                "--audio-progress",

                percentage + "%"

            );


        /*
           Update current time.
        */

        audioCurrentTime.textContent =

            formatAudioTime(
                newTime
            );

    }

);


/* =========================================================
   AUDIO FINISHED

   SEEK PLAYER -> ORIGINAL BUTTON
========================================================= */

audioPlayer.addEventListener(

    "ended",

    function () {


        /*
           Reset playback.
        */

        audioPlayer.currentTime =
            0;


        /*
           Reset seek bar.
        */

        audioSeekBar.value =
            0;


        audioSeekBar
            .style
            .setProperty(

                "--audio-progress",

                "0%"

            );


        /*
           Reset time.
        */

        audioCurrentTime.textContent =
            "0:00";


        /*
           Reset icon.
        */

        audioPlayIcon.textContent =
            "❚❚";


        /*
           Hide seek player.
        */

        audioSeekControls.hidden =
            true;


        audioSeekControls.style.display =
            "";


        /*
           Bring original button back.
        */

        playButton.hidden =
            false;


        playButton.style.display =
            "inline-flex";

    }

);


/* =========================================================
   START WEBSITE
========================================================= */

loadData();
