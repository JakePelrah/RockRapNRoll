

const mainMenu = document.getElementById('main-menu')
const loadingText = document.getElementById('loading-text')

let audioCtx = null
let currentGenre = null
let db = null
let samplesBuffer = []
let songalizer = null
let vocalizer = null
let reverbON = false
let gainNode = null
let currentIR = null


window.onload = () => {
    loadingText.style.display = ''

    // fetch and cache the data
    fetchGenres().then(genres => {

        //setup indexeddb
        const request = window.indexedDB.open("rrrDatabase", 3)
        if (!window.indexedDB) {
            console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.")
        } else {
            // handle errors
            request.onerror = (event) => {
                console.error(`Database error: ${event.target.errorCode}`)
            }
            // on success
            request.onsuccess = async (event) => {
                console.log('using database')
                db = event.target.result
                initWebAudio()
                createMenu()
            }
            // fires when new database is created or upgraded 
            request.onupgradeneeded = (event) => {
                console.log('creating database')
                db = event.target.result
                const objectStore = db.createObjectStore("genres", { keyPath: "genre" })

                objectStore.transaction.oncomplete = async (event) => {
                    const genresObjectStore = db.transaction("genres", "readwrite").objectStore("genres")
                    genres.forEach(genre => genresObjectStore.add(genre))

                }
            }
        }
    })
}

function initWebAudio() {
    // initialize web audio
    audioCtx = window.AudioContext || window.webkitAudioContext
    if (audioCtx) {
        console.log('Initializing web audio')
        audioCtx = new audioCtx()
        audioCtx.onstatechange = (e) => console.log('Audio State: ' + e.target.state)
        
    } else {
        console.log('Web Audio Not Supported')
    }
}

function createMenu() {

    //hide loading text
    loadingText.style.display = 'none'

    // populate menu with genre titles
    const genresDiv = document.createElement('div')
    genresDiv.setAttribute('id', 'genres')
    let colDiv
    const entriesPerCol = 5
    const genres = JSON.parse(localStorage.getItem('genres'))
    Object.keys(genres).forEach((genre, i) => {
        //create new column
        if (i % entriesPerCol === 0) {
            colDiv = document.createElement('div')
            colDiv.setAttribute('class', 'genre-column')
            genresDiv.appendChild(colDiv)
        }
        const genreTitle = document.createElement('button')
        genreTitle.innerText = genre.match(/[A-Z][a-z]+/g).join(' ')

        genreTitle.addEventListener('click', () => {

            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(function () {
                    console.log('Resuming audio context.')
                });
            }

            // hide main menu
            mainMenu.style.display = 'none'

            // grab selected genre from indexeddb
            currentGenre = genreTitle.innerText.replace(' ', '')
            const getGenreTrans = db.transaction("genres", "readonly")
                .objectStore("genres").get(currentGenre.replace(' ', '').toLowerCase())

            // decode arrayBuffers->audioBuffers and fill samples buffer
            getGenreTrans.transaction.oncomplete = () => {
                const { result: { arrayBuffers } } = getGenreTrans
                arrayBuffers.forEach(async arrayBuffer => {
                    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.arrayBuffer)
                    samplesBuffer.push({ id: arrayBuffer.id, audioBuffer })
                })
            }

            // build the game
            buildGame()
        })
        colDiv.appendChild(genreTitle)
    })
    mainMenu.appendChild(genresDiv)
}

function buildGame() {

    const genreMappings = JSON.parse(localStorage.getItem('genres'))
    const genreMapping = genreMappings[currentGenre]

    // set game board image
    const gameInterface = document.getElementById('game-board')
    gameInterface.style.background = `url(../genres/${currentGenre}/images/${currentGenre}.png) no-repeat`
    gameInterface.style.backgroundSize = '100% 100%'
    gameInterface.style.display = ''

    // setup songalizer
    const songalizerSampleDivs = document.getElementById('songs').querySelectorAll('div')
    const songalizerTitleImages = document.getElementById('song-names').querySelectorAll('img')
    genreMapping.songalizer_samples.forEach((sample, i) => {
        songalizerSampleDivs[i].setAttribute('data-sample-id', sample.id)
        songalizerTitleImages[i].setAttribute('data-sample-id', sample.id)
        songalizerTitleImages[i].draggable = false
        songalizerTitleImages[i].src = `../genres/${currentGenre}/images/song_title_${i + 1}.png`
    })

    songalizerTitleImages.forEach((songImg, i) => {
        this.isPlaying = false
        this.previewSample = null
        songImg.onclick = () => {

            if (!songalizer.isPlaying) {
                this.isPlaying = !this.isPlaying
                if (this.isPlaying) {
                    const id = songImg.getAttribute('data-sample-id')
                    this.previewSample = playSampleById({ id })
                    songImg.src = `../genres/${currentGenre}/images/asong_title_${i + 1}.png`
                    this.previewSample.onended = () => {
                        this.isPlaying = false
                        songImg.src = `../genres/${currentGenre}/images/song_title_${i + 1}.png`
                    }
                }
                else {
                    this.previewSample.stop()
                    songImg.src = `../genres/${currentGenre}/images/song_title_${i + 1}.png`
                }
                songImg.onblur = () => {
                    this.isPlaying = false
                    this.previewSample.stop()
                    songImg.src = `../genres/${currentGenre}/images/song_title_${i + 1}.png`
                }
            }
        }
    })
    songalizer = new Songalizer()

    // setup vocalizer
    const vocalizerButtons = document.getElementById('vocalizer').querySelectorAll('button')
    genreMapping.vocalizer_samples.forEach((sample, i) => {
        vocalizerButtons[i].setAttribute('data-sample-id', sample.id)
    })
    vocalizer = new Vocalizer()

    // setup vibe & bop
    const vibeSelect = document.getElementById('vibe-select')
    const vibeTrigger = document.getElementById('vibe-trigger')
    const bopSelect = document.getElementById('bop-select')
    const bopTrigger = document.getElementById('bop-trigger')
    genreMapping.vibeBop.forEach(sample => {
        const vOption = document.createElement('option')
        const bOption = document.createElement('option')
        vOption.value = sample.id
        bOption.value = sample.id
        vOption.innerText = sample.title
        bOption.innerText = sample.title
        vibeSelect.appendChild(vOption)
        bopSelect.appendChild(bOption)
    })
    vibeTrigger.onclick = () => {
        vibeTrigger.style.background = `url(../genres/${currentGenre}/images/vibe.png) no-repeat`
        vibeTrigger.style.backgroundSize = '100% 100%'
        const src = this.playSampleById({ id: vibeSelect.value })
        src.onended = () => {
            vibeTrigger.style.background = ''
        }

    }
    bopTrigger.onclick = () => {
        bopTrigger.style.background = `url(../genres/${currentGenre}/images/bop.png) no-repeat`
        bopTrigger.style.backgroundSize = '100% 100%'
        const src = this.playSampleById({ id: bopSelect.value })
        src.onended = () => {
            bopTrigger.style.background = ''
        }
    }

    // setup pitchem
    const pitchemDigitSelect = document.getElementById('pitchem-digit-select')
    genreMapping.pitchem.digitMap.forEach(sample => {
        const option = document.createElement('option')
        option.value = sample.id
        option.innerText = sample.title
        pitchemDigitSelect.appendChild(option)
    })
    const pitchemKeySelect = document.getElementById('pitchem-key-select')
    genreMapping.pitchem.qwertyKeyMap.forEach(sample => {
        const option = document.createElement('option')
        option.value = sample.id
        option.innerText = sample.title
        pitchemKeySelect.appendChild(option)
    })

    // setup key map overlay
    const keyImage = document.getElementById('keymap-image')
    keyImage.src = `../genres/${currentGenre}/images/keymap.png`
    keyImage.style.display = 'none'
    keyImage.onclick = () => {
        keyImage.style.display = 'none'
    }
    const keyTrigger = document.getElementById('keymap-trigger')
    keyTrigger.onclick = () => {
        keyImage.style.display = ''
    }
    document.onkeydown = (e) => {
        if (!e.repeat) {

            // is it a digit
            const { pitchem: { digitDetuneMap } } = genreMapping
            Object.entries(digitDetuneMap).forEach((entry) => {
                const code = e.code
                if (entry[0] === code) {
                    playSampleById({ id: pitchemDigitSelect.value, detuneAmt: digitDetuneMap[code] })
                }
            })

            // or is it in the top row?
            const { pitchem: { qwertyKeyDetuneMap } } = genreMapping
            Object.entries(qwertyKeyDetuneMap).forEach((entry) => {
                const code = e.code
                if (entry[0] === code) {
                    playSampleById({ id: pitchemKeySelect.value, detuneAmt: qwertyKeyDetuneMap[code] })
                }
            })

            const { restKeyMap } = genreMapping
            restKeyMap.forEach((sample) => {
                if (sample.key === e.code) {
                    this.playSampleById({ id: sample.id })
                }
            })
        }
    }


    // setup navigation
    const quitMeuButton = document.getElementById('quit-menu')
    quitMeuButton.onclick = () => {

        if (songalizer.isPlaying) {
            songalizer.stopSongalizer()
        }
        if (vocalizer.isPlaying) {
            vocalizer.stopVocalizer()
        }


        // reset board
              //init samples buffer
              samplesBuffer = []
              vocalizer = null
              songalizer = null
              //reset volume 
              document.getElementById('volume').value = 1
  
              // reset reverb
              if (reverbON) {
                  currentIR.disconnect()
                  currentIR = null
                  document.getElementById('reverb').click()
              }
  
        vibeSelect.innerHTML = ''
        bopSelect.innerHTML = ''
        startStop.style.background = ''
        pitchemDigitSelect.innerHTML = ''
        pitchemKeySelect.innerHTML = ''
        document.getElementById('slots').innerHTML = ''
        gameInterface.style.display = 'none'
        mainMenu.style.display = ''
    }

    //setup controls
    const [startStop, clear] = document.getElementById('controls').querySelectorAll('button')
    startStop.onclick = () => {
        if (!songalizer.isPlaying && songalizer.tracks.length > 0) {
            songalizer.toggle()
            startStop.style.background = `url("../genres/${currentGenre}/images/stop.png") no-repeat`
            startStop.style.backgroundSize = '100% 100%'
        }
        else if (songalizer.isPlaying) {
            songalizer.stopSongalizer()
            startStop.style.background = ''
        }
    }
    clear.onclick = () => {
        songalizer.clearSongalizer()
        startStop.style.background = ''
    }

    // setup reverb
    const reverbButton = document.getElementById('reverb')
    const reverbSelect = document.getElementById('reverb-select')
    reverbSelect.onchange = async () => {
        if (reverbON) {
            currentIR = await createReverb(reverbSelect.value)
        }
    }
    reverbButton.onclick = async () => {
        reverbON = !reverbON
        if (reverbON) {
            currentIR = await createReverb(reverbSelect.value)
            reverbButton.style.backgroundColor = 'green'
        }
        else {
            currentIR = null
            reverbButton.style.backgroundColor = ''
        }
    }

    // setup volume
    gainNode = audioCtx.createGain()
    const volumeSlider = document.getElementById('volume')
    volumeSlider.oninput = (event) => {
        gainNode.gain.value = event.target.value
    }
}


// returns genres array which contains the arrayBuffers for each genre
// arrayBuffers need to be decoded within a web audio context
async function fetchGenres() {

    return new Promise(async (resolve, reject) => {

        try {

            // fetch genre mappings from server
            const res = await fetch('/data')
            const genreMappings = await res.json()

            // cache mappings
            localStorage.setItem('genres', JSON.stringify(genreMappings))

            // fetch array buffers for each style
            let genres = []
            for (const genre in genreMappings) {
                const { samples } = genreMappings[genre]
                const arrayBuffers = await Promise.all(samples.map(async path => {
                    const res = await fetch(path)
                    const arrayBuffer = await res.arrayBuffer()
                    const id = path.split(new RegExp(/\.wav|\//))[4]
                    return { id, arrayBuffer }
                }))
                genres.push({ genre: genre.toLowerCase(), arrayBuffers })
            }

            resolve(genres)
        } catch (e) {

            reject(e)
        }
    })
}


function playSampleById({ id, start = 0, detuneAmt = 0 }) {
    const src = audioCtx.createBufferSource()
    src.buffer = samplesBuffer.find(x => x.id === id).audioBuffer
    src.detune.value = detuneAmt
    src.connect(gainNode)


    gainNode.disconnect()

    if (reverbON) {
        gainNode.connect(currentIR)
        currentIR.connect(audioCtx.destination)
    }
    else {
        gainNode.connect(audioCtx.destination)
    }
    src.start(start)
    return src
}

async function createReverb(path) {
    let convolver = audioCtx.createConvolver();
    let response = await fetch(path);
    let arraybuffer = await response.arrayBuffer();
    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);
    return convolver;
}






class Songalizer {
    constructor() {
        this.scheduleAheadTime = .1
        this.nextTrackTime = 0.0;
        this.lookahead = 25.0;
        this.timerWorker = null;

        this.isPlaying = false
        this.currentTrackIndex = 0
        this.currentSource = null
        this.selectedSong = null

        this.tracks = []
        this.counter = 0

        this.songs = document.getElementById('songs').querySelectorAll('div')
        this.slots = document.getElementById('slots')


        this.songs.forEach(song => {

            song.onmousedown = (ev) => {
                this.selectedSong = song
                document.body.style.cursor = 'url(../images/outline.png) 20 20, pointer'
                //disable pointer events on gameInputElements
                document.querySelectorAll('.gameControlElement').forEach(elem => elem.style.pointerEvents = 'none')
            }

            document.onmouseup = () => {
                if (this.isPlaying) {

                    document.querySelectorAll('.gameControlElement').forEach(elem => {
                        if (elem.classList.contains('song')) {
                            elem.style.pointerEvents = 'auto'
                        }
                    })
                }
                else {
                    document.querySelectorAll('.gameControlElement').forEach(elem => elem.style.pointerEvents = 'auto')
                }
                document.body.style.cursor = 'auto'
                this.selectedSong = null
            }
        })

        this.slots.onmouseup = () => {

            const MAX_SONGS = 10
            if (!this.isPlaying && (this.tracks.length < MAX_SONGS) && this.selectedSong) {
                const id = this.selectedSong.getAttribute('data-sample-id')
                const imgElem = document.createElement('img')
                imgElem.setAttribute('id', this.selectedSong.id)
                imgElem.setAttribute('draggable', false)
                imgElem.setAttribute('data-sample-id', id)
                imgElem.setAttribute('src', `../genres/${currentGenre}/images/${this.selectedSong.id}.png`)
                this.slots.appendChild(imgElem)
                const { audioBuffer } = samplesBuffer.find(x => x.id === id)
                this.tracks.push({ id, audioBuffer })

                //enable pointer events on gameInputElements
                document.querySelectorAll('.gameControlElement').forEach(elem => elem.style.pointerEvents = 'auto')
                document.body.style.cursor = 'auto'
                this.selectedSong = null
            }
        }

        // setup web worker
        this.timerWorker = new Worker('js/songalizerworker.js');
        this.timerWorker.onmessage = (e) => {
            if (e.data === 'tick') {
                this.scheduler()
            }
            else {
                console.log('message:' + e.data)
            }
        }
        this.timerWorker.postMessage({ 'interval': this.lookahead })
    }

    stopSongalizer() {

        if (this.currentSource) {
            this.currentSource.stop()
        }
        this.isPlaying = false
        this.counter = 0
        this.currentSource = null
        this.timerWorker.postMessage('stop')
        // disable dragging of songs
        document.getElementById('songs')
            .querySelectorAll('.gameControlElement')
            .forEach(elem => elem.style.pointerEvents = 'auto')
        //reset slot state images here
        this.slots.querySelectorAll('img').forEach(img => {
            img.src = `../genres/${currentGenre}/images/song_${img.src.split('_')[1]}`
        })
    }

    toggle() {

        if (this.tracks.length !== 0) {

            this.isPlaying = !this.isPlaying

            if (this.isPlaying) {

                // disable dragging of songs
                document.getElementById('songs')
                    .querySelectorAll('.gameControlElement')
                    .forEach(elem => elem.style.pointerEvents = 'none')

                this.timerWorker.postMessage('start')
                this.nextTrackTime = audioCtx.currentTime
            }
            else {
                this.stopSongalizer()
            }
        }
        else {
            console.log('Songalizer has no tracks to play!')
        }

    }

    scheduleTrack(id, start) {
        this.currentSource = playSampleById({ id, start })

    }

    scheduler() {

        while (this.nextTrackTime < audioCtx.currentTime + this.scheduleAheadTime) {

            this.currentTrackIndex = this.counter % this.tracks.length
            const { id } = this.tracks[this.currentTrackIndex]
            this.scheduleTrack(id, this.nextTrackTime)
            this.displayCurrentSong()

            //add duration of next track to nextTrackTime
            const { audioBuffer: { duration } } = this.tracks[this.currentTrackIndex]
            this.nextTrackTime += duration
            this.counter++
        }
    }


    clearSongalizer() {
        if (this.isPlaying) {
            this.isPlaying = !this.isPlaying
            this.stopSongalizer()
        }
        this.tracks = []
        this.slots.innerHTML = ''
    }

    displayCurrentSong() {

        const songs = this.slots.querySelectorAll('img')

        if (this.tracks.length > 1) {
            const currentSong = songs[this.currentTrackIndex]
            const id = currentSong.getAttribute('id')

            currentSong.src = `../genres/${currentGenre}/images/a${id}.png`

            const prevSongIndex = this.currentTrackIndex - 1 < 0 ? this.tracks.length - 1 : this.currentTrackIndex - 1
            const prevSong = songs[prevSongIndex]
            prevSong.src = `../genres/${currentGenre}/images/song_${prevSong.id.split('_')[1]}.png`
        }

        else if (this.tracks.length === 1) {
            const currentSong = songs[this.currentTrackIndex]
            const id = currentSong.getAttribute('id')
            currentSong.src = `../genres/${currentGenre}/images/a${id}.png`
        }
    }
}


class Recorder {
    constructor() {
        this.chunks = []
        this.dest = audioCtx.createMediaStreamDestination()
        this.mediaRecorder = new MediaRecorder(this.dest.stream, { mimeType: 'audio/webm' })

        this.mediaRecorder.ondataavailable = (evt) => {
            // push each chunk (blobs) in an array
            this.chunks.push(evt.data);
        };

        this.mediaRecorder.onstop = (evt) => {
            // Make blob out of our blobs, and open it.
            const blob = new Blob(this.chunks, { 'type': 'audio/webm; codecs=0' });
            document.querySelector("audio").src = URL.createObjectURL(blob);
        };
    }

    start() {
        console.log('starting')
        this.mediaRecorder.start()
    }

    stop() {
        console.log('stoping')
        this.mediaRecorder.stop()
    }
}





class Vocalizer {
    constructor() {
        this.scheduleAheadTime = .1
        this.nextTrackTime = 0.0;
        this.lookahead = 25.0;
        this.timerWorker = null;
        this.isPlaying = false
        this.currentSource = null
        this.tracks = []

        this.triggers = document.querySelector('#vocalizer').querySelectorAll('button')
        this.triggers.forEach(trigger => trigger.addEventListener('click', () => this.onClick(trigger)))

        // setup web worker
        this.timerWorker = new Worker('js/songalizerworker.js');
        this.timerWorker.onmessage = (e) => {
            if (e.data === 'tick') {
                this.scheduler()
            }
            else {
                console.log('message:' + e.data)
            }
        }
        this.timerWorker.postMessage({ 'interval': this.lookahead })
    }

    onClick(trigger) {
        trigger.disabled = true
        trigger.style.opacity = .5
        trigger.style.backgroundColor = 'white'
        trigger.style.filter = 'blur(4px)'
        const id = trigger.getAttribute('data-sample-id')
        const { audioBuffer } = samplesBuffer.find(x => x.id === id)
        this.tracks.push({ id, audioBuffer })

        if (!this.isPlaying) {
            this.isPlaying = !this.isPlaying
            this.timerWorker.postMessage('start')
            this.nextTrackTime = audioCtx.currentTime
        }
    }

    stopVocalizer() {

        if (this.currentSource) {
            this.currentSource.stop()
        }
        this.triggers.forEach(trigger=>{
            trigger.disabled = false
            trigger.style.opacity = 0})
        this.isPlaying = false
        this.currentSource = null
        this.timerWorker.postMessage('stop')
    }



    scheduleTrack(id, start) {
        this.currentSource = playSampleById({ id, start })
        this.currentSource.onended = () => {
            this.triggers.forEach(trigger => {
                const triggerId = trigger.getAttribute('data-sample-id')
                if (triggerId === id) {
                    trigger.disabled = false
                    trigger.style.opacity = 0
                }
            })
        }
    }

    scheduler() {

        while ((this.nextTrackTime < audioCtx.currentTime + this.scheduleAheadTime) && this.isPlaying) {

            if (this.tracks.length >= 1) {
                const { id, audioBuffer: { duration } } = this.tracks.shift()
                this.scheduleTrack(id, this.nextTrackTime)
                //add duration of next track to nextTrackTime
                this.nextTrackTime += duration
            }
            else {
                this.stopVocalizer()
            }

        }
    }
}

// // //         // recording
// // //         // const recordDiv = document.createElement('div')
// // //         // recordDiv.setAttribute('id', 'recording')

// // //         // // const audioElem = document.createElement('audio')
// // //         // // audioElem.setAttribute('controls', true)
// // //         // // recordDiv.appendChild(audioElem)

// // //         // const record = document.createElement('button')
// // //         // record.innerText = 'RECORD'
// // //         // record.addEventListener('click', () => recorder.start())
// // //         // recordDiv.appendChild(record)


// // //         // const stop = document.createElement('button')
// // //         // stop.innerText = 'STOP'
// // //         // stop.addEventListener('click', () => recorder.stop())
// // //         // recordDiv.appendChild(stop)

// // //         // gameWrapper.appendChild(recordDiv)


