

const Reverb = {
    'irs': ['../irs/large_room.wav',]
}
const reverbOn = false
let irsBuffer = []


let audioCtx = null
let songalizer = null
let samplesBuffer = []
// var genres = { Africa, BigBand, Blues, Latin, Rap, Reggae, Rock, Soulful, StreetJazz, TechnoPop }
var genres = { } 
let selectedGenre = null
const dragImage = new Image()
dragImage.src = '../images/outline.png'


async function init() {

    //initialize web audio once
    audioCtx = window.AudioContext || window.webkitAudioContext
    if (audioCtx) {
        audioCtx = new audioCtx()
        audioCtx.onstatechange = (e) => console.log('audio state:' + e.target.state)
    } else {
        console.log('Web Audio Not Supported')
    }

    // fetch available style here
    const res = await fetch('/data')
    genres  =  await res.json()


    // display main menu
    mainMenu()
}


function mainMenu() {

    // set background image
    const gameWrapper = document.getElementById('game-wrapper')
    gameWrapper.style.backgroundImage = `url(../images/mainMenu.png)`
    gameWrapper.style.backgroundSize = '100% 100%'

    // create main menu div
    const mainMenuDiv = document.createElement('div')
    mainMenuDiv.setAttribute('id', 'main-menu')
    
    //creat columns with 5 entries within main menu div
    let colDiv
    let entriesPerCol = 5
    Object.keys(genres).forEach((genre, i) => {
        
        //create new column
        if (i % entriesPerCol === 0) {
            colDiv = document.createElement('div')
            colDiv.setAttribute('class', 'genre-column')
            mainMenuDiv.appendChild(colDiv)
        }

        const genreTitle = document.createElement('h1')
        genreTitle.innerText = genre
        // resume audio context if suspened, when we click on a genre.
        genreTitle.addEventListener('click', () => {
            if(audioCtx.state === 'suspended'){
                audioCtx.resume().then(function() {
                    console.log('Resuming audio context.')
                  });
            }
            console.log(genres)
            selectedGenre = genres[genre]
            console.log(genre)
            buildGame()

            // remove the menu when we click on a genre
            mainMenuDiv.remove()
        })
        colDiv.appendChild(genreTitle)
    })
    gameWrapper.appendChild(mainMenuDiv)
}


async function buildGame() {

    const gameWrapper = document.getElementById('game-wrapper')

    // set background image
    gameWrapper.style.backgroundImage = `url(${selectedGenre.background})`
    gameWrapper.style.backgroundSize = '100% 100%'

    // load samples
    for (const path of selectedGenre.samples) {
        const res = await fetch(path)
        const arrayBuffer = await res.arrayBuffer()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
        const id = path.split(/\.WAV|\.wav|\//)[4]
        samplesBuffer.push({ id, audioBuffer })
    }

    // load impulse responses
    for (const path of Reverb.irs) {
        const res = await fetch(path)
        const arrayBuffer = await res.arrayBuffer()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
        const id = path.split(/\.WAV|\.wav|\//)[2]
        irsBuffer.push({ id, audioBuffer })
    }


    // sample buttons
    const samplesDiv = document.createElement('div')
    samplesDiv.setAttribute('id', 'songs')
    selectedGenre.songalizer.map((song, i) => {
        const imgElem = document.createElement('img')
        imgElem.setAttribute('id', `song_${i + 1}`)
        imgElem.setAttribute('data-sample-id', song.id)
        imgElem.setAttribute('ondragstart', 'drag(event)')
        imgElem.setAttribute('src', selectedGenre.song_images[i])
        samplesDiv.appendChild(imgElem)
    })
    gameWrapper.appendChild(samplesDiv)

    // sample names
    const sampleNamesDiv = document.createElement('div')
    sampleNamesDiv.setAttribute('id', 'song-names')
    selectedGenre.songalizer.map(song => {
        const title = document.createElement('h1')
        title.innerText = song.title
        title.setAttribute('class', 'song')
        title.setAttribute('data-sample-id', song.id)
        sampleNamesDiv.appendChild(title)
    })
    gameWrapper.appendChild(sampleNamesDiv)


    // vocalizer
    const vocalizerDiv = document.createElement('div')
    vocalizerDiv.setAttribute('id', 'vocalizer')
    selectedGenre.vocalizer.map((song, i) => {
        const buttonElem = document.createElement('button')
        buttonElem.setAttribute('data-sample-id', song.id)
        vocalizerDiv.appendChild(buttonElem)
    })
    gameWrapper.appendChild(vocalizerDiv)

    // volume
    const volumeDiv = document.createElement('div')
    volumeDiv.setAttribute('class', 'slider-wrapper')
    const volumeSlider = document.createElement('input')
    volumeSlider.setAttribute('type', 'range')
    volumeSlider.setAttribute('min', 0)
    volumeSlider.setAttribute('max', 11)
    volumeSlider.setAttribute('value', 7)
    volumeSlider.setAttribute('step', 1)
    volumeDiv.appendChild(volumeSlider)
    gameWrapper.appendChild(volumeDiv)


    // vibe
    const vibeDiv = document.createElement('div')
    vibeDiv.setAttribute('id', 'vibe')
    const vibeTrigger = document.createElement('button')
    vibeTrigger.setAttribute('id', 'vibeTrigger')
    vibeTrigger.setAttribute('class', 'trigger')
    vibeDiv.appendChild(vibeTrigger)
    const vibeSelectElem = document.createElement('select')

    // bop
    const bopDiv = document.createElement('div')
    bopDiv.setAttribute('id', 'bop')
    const bopTrigger = document.createElement('button')
    bopTrigger.setAttribute('id', 'bopTrigger')
    bopTrigger.setAttribute('class', 'trigger')
    bopDiv.appendChild(bopTrigger)
    const bopSelectElem = document.createElement('select')

    selectedGenre.vibeBop.map(song => {
        const vibeOption = document.createElement('option')
        vibeOption.setAttribute('value', song.id)
        vibeOption.innerText = song.title
        vibeSelectElem.appendChild(vibeOption)

        const bopOption = document.createElement('option')
        bopOption.setAttribute('value', song.id)
        bopOption.innerText = song.title
        bopSelectElem.appendChild(bopOption)
    })
    vibeDiv.appendChild(vibeSelectElem)
    bopDiv.appendChild(bopSelectElem)
    gameWrapper.appendChild(vibeDiv)
    gameWrapper.appendChild(bopDiv)

    // pitch-em
    const pitchEmNumsElem = document.createElement('div')
    pitchEmNumsElem.setAttribute('id', 'pitchEmNums')
    const numsSelect = document.createElement('select')
    numsSelect.setAttribute('id', 'num')

    selectedGenre.pitchem.numbers.map(song => {
        const numOption = document.createElement('option')
        numOption.setAttribute('value', song.id)
        numOption.innerText = song.title
        numsSelect.appendChild(numOption)
    })
    pitchEmNumsElem.appendChild(numsSelect)
    gameWrapper.appendChild(pitchEmNumsElem)


    const pitchEmKeysElem = document.createElement('div')
    pitchEmKeysElem.setAttribute('id', 'pitchEmKeys')
    const keySelect = document.createElement('select')
    keySelect.setAttribute('id', 'alpha')

    selectedGenre.pitchem.keys.map(song => {
        const keyOption = document.createElement('option')
        keyOption.setAttribute('value', song.id)
        keyOption.innerText = song.title
        keySelect.appendChild(keyOption)
    })
    pitchEmKeysElem.appendChild(keySelect)
    gameWrapper.appendChild(pitchEmKeysElem)

    // slots
    const slotsDiv = document.createElement('div')
    slotsDiv.setAttribute('id', 'slots')
    slotsDiv.setAttribute('ondrop', 'drop(event)')
    slotsDiv.setAttribute('ondragover', 'allowDrop(event)')
    gameWrapper.appendChild(slotsDiv)


    // controls
    const controlDiv = document.createElement('div')
    controlDiv.setAttribute('id', 'controls')

    const startButton = document.createElement('button')
    startButton.setAttribute('id', 'start-stop')
    startButton.innerText = 'START'
    controlDiv.appendChild(startButton)

    const clearButton = document.createElement('button')
    clearButton.setAttribute('id', 'clear')
    clearButton.innerText = 'CLEAR'
    controlDiv.appendChild(clearButton)

    gameWrapper.appendChild(controlDiv)




    songalizer = new Songalizer()
    new Vocalizer()
    new SongPreview('song-names')
    Controls('controls')
    DropDown('vibe', selectedGenre.vibe_image)
    DropDown('bop', selectedGenre.bop_image)
    const { keyMap, numMap } = selectedGenre.pitchem
    new PitchEm('pitchEmKeys', keyMap)
    new PitchEm('pitchEmNums', numMap)
    new KeyMap(selectedGenre.keyMap)
}


function Controls(id) {
    const controlsDiv = document.getElementById(id)
    const [startStop, clear] = controlsDiv.querySelectorAll('button')

    startStop.addEventListener('click', () => {

        if (!songalizer.isPlaying && songalizer.tracks.length > 0) {
            songalizer.toggle()
            startStop.innerText = 'STOP'
        }
        else if (songalizer.isPlaying) {
            songalizer.stop()
            startStop.innerText = 'START'
        }
    })

    clear.addEventListener('click', () => {
        songalizer.clearSongalizer()
        startStop.innerText = 'START'

    })
}

function DropDown(id, img) {
    const div = document.getElementById(id)
    const select = div.querySelector('select')
    const trigger = div.querySelector('.trigger')

    const play = () => {

        //change the image to reflect the sound playing
        trigger.style.backgroundImage = `url(${img})`
        trigger.style.backgroundRepeat = 'no-repeat';
        trigger.style.backgroundSize = '105% 105%'

        //play sound
        const src = playSampleById(select.value)

        // reset image
        src.onended = () => {
            trigger.style.backgroundImage = ''
        }
    }
    trigger.addEventListener('click', play, false)
}


class PitchEm {

    constructor(id, keyMap) {
        const div = document.getElementById(id)
        const select = div.querySelector('select')

        const play = (e) => {

       
            if(!e.repeat){
            Object.entries(keyMap).forEach((entry) => {
                const code = e.code
                if (entry[0] === code) {
                    this.currentSample = playDetunedSampleById(select.value, keyMap[code])
                }
            })
        }
    }
        //Use addEventListener, It allows adding more than one handler for an event.
        document.addEventListener('keydown', play, false)
    }
}


class KeyMap {
    constructor(keyMap) {
        const play = (e) => {
            if(!e.repeat){
            keyMap.forEach((sample) => {
                if (sample.key === e.code) {
                    playSampleById(sample.id)
                }
            })
        }
    }
        document.addEventListener('keydown', play)
    }
}

class SongPreview {
    constructor(id) {
        this.currentSong = null
        const songNamesDiv = document.getElementById(id)
        const songNames = songNamesDiv.querySelectorAll('h1')

        // if we click anywhere but on another song, stop the song
        document.addEventListener('mousedown', (e) => {
            e.target.className !== 'song' ? this.currentSong?.stop() : null
        })


        songNames.forEach(song => {
            const id = song.getAttribute('data-sample-id')
            song.addEventListener('click', () => {

                //stop previous song
                if (this.currentSong) {
                    this.currentSong.stop()
                }

                if (!songalizer.isPlaying) {
                    this.currentSong = playSampleById(id)
                }
            })

        })
    }
}


class Vocalizer {
    constructor() {
        this.isPlaying = false
        this.triggers = document.querySelector('#vocalizer').querySelectorAll('button')
        this.triggers.forEach(trigger => trigger.addEventListener('click', () => this.onClick(trigger)))
        this.start = 0
        this.prevDuration = 0
        this.counter = 0
    }

    onClick(trigger) {
        trigger.disabled = true
        trigger.style.opacity = 1
        const id = trigger.getAttribute('data-sample-id')
        const source = audioCtx.createBufferSource()
        source.buffer = samplesBuffer.find(x => x.id === id).audioBuffer
        source.connect(audioCtx.destination)


        if (!this.isPlaying) {
            this.start = audioCtx.currentTime
            source.start(this.start)
            this.counter++
        }

        else if (this.isPlaying) {
            source.start(this.start + this.prevDuration)
            this.counter++
        }

        source.onended = () => {
            trigger.disabled = false
            trigger.style.opacity = 0

            this.counter--
            console.log('Audio counter', this.counter)
            if (this.counter === 0) {
                console.log('DONE')
                this.isPlaying = false
                this.start = 0
                this.prevDuration = 0
                this.counter = 0
            }
        }
        this.isPlaying = true
        this.prevDuration += source.buffer.duration

    }

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
        this.slots = document.getElementById('slots')
        this.tracks = []
        this.counter = 0

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

    stop() {
        this.isPlaying = false
        this.counter = 0
        this.currentSource.stop()
        this.currentSource = null
        this.timerWorker.postMessage('stop')
        const songs = document.getElementById('songs').querySelectorAll('img')
        songs.forEach(song => song.setAttribute('draggable', true))
        //reset slot state images here
        this.slots.querySelectorAll('img').forEach(img => {
            img.src = `../genres/${selectedGenre.style}/images/song_${img.src.split('_')[1]}`
        })
    }

    toggle() {

        if (this.tracks.length !== 0) {

            this.isPlaying = !this.isPlaying

            if (this.isPlaying) {

                // disable draggable
                const songs = document.getElementById('songs').querySelectorAll('img')
                songs.forEach(song => song.setAttribute('draggable', false))

                this.timerWorker.postMessage('start')
                this.nextTrackTime = audioCtx.currentTime
            }
            else {
                this.stop()
            }
        }
        else {
            console.log('Songalizer has no tracks to play!')
        }

    }

    scheduleTrack(id, start) {
        this.currentSource = playSampleById(id, start)

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
            this.stop()
        }
        this.tracks = []
        this.slots.innerHTML = ''
    }

    displayCurrentSong() {

        const songs = this.slots.querySelectorAll('img')
        const style = selectedGenre.style

        if (this.tracks.length > 1) {
            const currentSong = songs[this.currentTrackIndex]
            const id = currentSong.getAttribute('id')

            currentSong.src = `../genres/${style}/images/a${id}.png`

            const prevSongIndex = this.currentTrackIndex - 1 < 0 ? this.tracks.length - 1 : this.currentTrackIndex - 1
            const prevSong = songs[prevSongIndex]
            prevSong.src = `../genres/${style}/images/song_${prevSong.id.split('_')[1]}.png`
        }

        else if (this.tracks.length === 1) {
            const currentSong = songs[this.currentTrackIndex]
            const id = currentSong.getAttribute('id')
            console.log(style, id)
            currentSong.src = `../genres/${style}/images/a${id}.png`
        }
    }
}



function playSampleById(id, start) {

    let convolver
    const src = audioCtx.createBufferSource()
    src.buffer = samplesBuffer.find(x => x.id === id).audioBuffer

    if (reverbOn) {
        convolver = audioCtx.createConvolver();
        convolver.buffer = irsBuffer[0].audioBuffer
        src.connect(convolver)
        convolver.connect(audioCtx.destination)
    }

    else{
        src.connect(audioCtx.destination)
    }

    src.start(start)   
    return src
}

function playDetunedSampleById(id, amt) {
    const src = audioCtx.createBufferSource()
    src.buffer = samplesBuffer.find(x => x.id === id).audioBuffer
    src.detune.value = amt
    src.connect(audioCtx.destination)
    src.start()
    return src
}


function allowDrop(ev) {
    ev.preventDefault();
}


function drag(ev) {
    const { id, width, height } = ev.target
    ev.dataTransfer.setData('text', id);


    ev.dataTransfer.setDragImage(dragImage, width, height);
}


function drop(ev) {
    ev.preventDefault();

    const MAX_SONGS = 10
    if (songalizer.tracks.length < MAX_SONGS) {

        // get and clone sample image
        var data = ev.dataTransfer.getData('text');
        const nodeCopy = document.getElementById(data).cloneNode(true)
        nodeCopy.setAttribute('draggable', false)

        //append to slots if dropped on a sample image
        if (ev.target.parentElement.id === 'slots') {
            ev.target.parentElement.appendChild(nodeCopy)
        }
        else {
            ev.target.appendChild(nodeCopy)
        }

        // get audio buffer and push to songalizer 
        const id = nodeCopy.getAttribute('data-sample-id')
        const { audioBuffer } = samplesBuffer.find(x => x.id === id)
        songalizer.tracks.push({ id, audioBuffer })
    }
    else {
        console.log('Songalizer full')
    }
}


window.addEventListener('load', init)
























