
/** Class represetning a game of Rock Rap 'N Roll */
class Game {


    /**
     * Create a game instance
     */
    constructor() {
        this.audioCtx = null
        this.songalizer = null
        this.recorder = null
        this.samplesBuffer = []
        this.genres = null
        this.currentGenre = null
    }


    /** intitialize web audio api & fetch available genres */
    async init() {

        // init web audio
        this.audioCtx = window.AudioContext || window.webkitAudioContext
        if (this.audioCtx) {
            this.audioCtx = new this.audioCtx()
            this.audioCtx.onstatechange = (e) => console.log('Audio State: ' + e.target.state)
        } else {
            console.log('Web Audio Not Supported')
        }

        // fetch generes & cache to local storage
        try {
            if (!localStorage.getItem('genres')) {
                const res = await fetch('/data')
                const json = await res.json()
                localStorage.setItem('genres', JSON.stringify(json))
                this.genres = JSON.parse(localStorage.getItem('genres'))
            }

            // use cached genres
            else {
                this.genres = JSON.parse(localStorage.getItem('genres'))
            }
        }
        catch (e) {
            this.genres = { 'CONTACT ADMINISTRATOR': null }
        }

        // display main menu
        this.mainMenu()
    }



    /** reset game state & render main menu */
    mainMenu() {

        // reset game state
        this.samplesBuffer = []
        if (this.songalizer) {
            this.songalizer.stopSongalizer()
        }

        // clear game wrapper 
        const gameWrapper = document.getElementById('game-wrapper')
        gameWrapper.innerHTML = ''

        // set main menu background image
        gameWrapper.style.backgroundImage = `url(../images/mainMenu.png)`
        gameWrapper.style.backgroundSize = '100% 100%'

        // create main menu div
        const mainMenuDiv = document.createElement('div')
        mainMenuDiv.setAttribute('id', 'main-menu')
        //creat columns with 5 entries
        let colDiv
        const entriesPerCol = 5
        Object.keys(this.genres).forEach((genre, i) => {
            //create new column
            if (i % entriesPerCol === 0) {
                colDiv = document.createElement('div')
                colDiv.setAttribute('class', 'genre-column')
                mainMenuDiv.appendChild(colDiv)
            }

            const genreTitle = document.createElement('button')
            genreTitle.innerText = genre.match(/[A-Z][a-z]+/g).join(' ')
            // resume audio context if suspened, when we click on a genre.
            genreTitle.addEventListener('click', () => {
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume().then(function () {
                        console.log('Resuming audio context.')
                    });
                }

                this.currentGenre = this.genres[genre]
                mainMenuDiv.remove()
                this.buildGame()

            })
            colDiv.appendChild(genreTitle)
        })
        gameWrapper.appendChild(mainMenuDiv)
    }


    async buildGame() {

        const gameWrapper = document.getElementById('game-wrapper')
        const style = this.currentGenre.style

        // set background image
        gameWrapper.style.backgroundImage = `url(../genres/${style}/images/${style}.png)`
        gameWrapper.style.backgroundSize = '100% 100%'

        // load samples
        for (const path of this.currentGenre.samples) {

            const res = await fetch(path)
            const arrayBuffer = await res.arrayBuffer()
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer)
            const id = path.split(new RegExp(/\.wav|\//))[4]
            this.samplesBuffer.push({ id, audioBuffer })
        }


        // sample buttons
        const songsDiv = document.createElement('div')
        songsDiv.setAttribute('id', 'songs')
        this.currentGenre.songalizer.map((song, i) => {
            const songElem = document.createElement('div')
            songElem.classList.add('gameControlElement')
            songElem.setAttribute('id', `song_${i + 1}`)
            songElem.setAttribute('data-sample-id', song.id)
            songsDiv.appendChild(songElem)
        })
        gameWrapper.appendChild(songsDiv)


        // slots
        const slotsDiv = document.createElement('div')
        slotsDiv.setAttribute('id', 'slots')
        gameWrapper.appendChild(slotsDiv)



        // song names
        const songNamesDiv = document.createElement('div')
        songNamesDiv.setAttribute('id', 'song-names')
        this.currentGenre.songalizer.map((song, i) => {
            const title = document.createElement('img')
            title.src = `../genres/${this.currentGenre.style}/images/song_title_${i + 1}.png`
            title.classList.add(...['song', 'gameControlElement'])
            title.setAttribute('data-sample-id', song.id)
            songNamesDiv.appendChild(title)
        })
        gameWrapper.appendChild(songNamesDiv)


        // vocalizer
        const vocalizerDiv = document.createElement('div')
        vocalizerDiv.setAttribute('id', 'vocalizer')
        this.currentGenre.vocalizer.map((song, i) => {
            const buttonElem = document.createElement('button')
            buttonElem.classList.add('gameControlElement')
            buttonElem.setAttribute('data-sample-id', song.id)
            vocalizerDiv.appendChild(buttonElem)
        })
        gameWrapper.appendChild(vocalizerDiv)

        // volume
        const volumeDiv = document.createElement('div')
        volumeDiv.setAttribute('class', 'slider-wrapper')
        const volumeSlider = document.createElement('input')
        volumeSlider.classList.add('gameControlElement')
        volumeSlider.setAttribute('id', 'volume')
        volumeSlider.setAttribute('type', 'range')
        volumeSlider.setAttribute('min', 0)
        volumeSlider.setAttribute('max', 11)
        volumeSlider.setAttribute('value', 7)
        volumeSlider.setAttribute('step', 1)
        volumeDiv.appendChild(volumeSlider)
        gameWrapper.appendChild(volumeDiv)


        // vibe
        const vibeTrigger = document.createElement('button')
        vibeTrigger.setAttribute('id', 'vibe-trigger')
        const vibeSelectElem = document.createElement('select')
        vibeSelectElem.setAttribute('id', 'vibe-select')

        // bop
        const bopTrigger = document.createElement('button')
        bopTrigger.setAttribute('id', 'bop-trigger')
        const bopSelectElem = document.createElement('select')
        bopSelectElem.setAttribute('id', 'bop-select')

        this.currentGenre.vibeBop.map(song => {
            const vibeOption = document.createElement('option')
            vibeOption.setAttribute('value', song.id)
            vibeOption.innerText = song.title
            vibeSelectElem.appendChild(vibeOption)

            const bopOption = document.createElement('option')
            bopOption.setAttribute('value', song.id)
            bopOption.innerText = song.title
            bopSelectElem.appendChild(bopOption)
        })
        gameWrapper.appendChild(vibeTrigger)
        gameWrapper.appendChild(vibeSelectElem)
        gameWrapper.appendChild(bopSelectElem)
        gameWrapper.appendChild(bopTrigger)

        // pitch-em
        const pitchEmNumsElem = document.createElement('div')
        pitchEmNumsElem.classList.add('gameControlElement')
        pitchEmNumsElem.setAttribute('id', 'pitchEmNums')
        const numsSelect = document.createElement('select')
        numsSelect.setAttribute('id', 'num')

        this.currentGenre.pitchem.numbers.map(song => {
            console.log(song)
            const numOption = document.createElement('option')
            numOption.setAttribute('value', song.id)
            numOption.innerText = song.title
            numsSelect.appendChild(numOption)
        })
        pitchEmNumsElem.appendChild(numsSelect)
        gameWrapper.appendChild(pitchEmNumsElem)


        const pitchEmKeysElem = document.createElement('div')
        pitchEmKeysElem.classList.add('gameControlElement')
        pitchEmKeysElem.setAttribute('id', 'pitchEmKeys')
        const keySelect = document.createElement('select')
        keySelect.setAttribute('id', 'alpha')

        this.currentGenre.pitchem.keys.map(song => {
            const keyOption = document.createElement('option')
            keyOption.setAttribute('value', song.id)
            keyOption.innerText = song.title
            keySelect.appendChild(keyOption)
        })
        pitchEmKeysElem.appendChild(keySelect)
        gameWrapper.appendChild(pitchEmKeysElem)


        // controls
        const controlDiv = document.createElement('div')
        controlDiv.setAttribute('id', 'controls')
        const startButton = document.createElement('button')
        startButton.setAttribute('id', 'start-stop')
        controlDiv.appendChild(startButton)
        const clearButton = document.createElement('button')
        clearButton.setAttribute('id', 'clear')
        controlDiv.appendChild(clearButton)
        gameWrapper.appendChild(controlDiv)


        // navigation 
        const navigationDiv = document.createElement('div')
        navigationDiv.setAttribute('id', 'navigation')
        const quitButton = document.createElement('button')
        quitButton.setAttribute('id', 'quit')
        navigationDiv.appendChild(quitButton)
        const menuButton = document.createElement('button')
        menuButton.setAttribute('id', 'menu')
        navigationDiv.appendChild(menuButton)
        gameWrapper.appendChild(navigationDiv)



        // keymap visual
        const keyTrigger = document.createElement('button')
        keyTrigger.setAttribute('id', 'key-trigger')
        keyTrigger.onclick=()=>{
            img.style.display = ''
        }
        gameWrapper.appendChild(keyTrigger)


        const keyMapDiv = document.createElement('div')
        keyMapDiv.setAttribute('id', 'key-map')
        const img = document.createElement('img')
        img.src = `../genres/${this.currentGenre.style}/images/key_map.png`
        img.style.display = 'none'
        
        img.onclick = ()=>{
            img.style.display = 'none'
        }

        keyMapDiv.appendChild(img)
        gameWrapper.appendChild(keyMapDiv)




        //Bug reporting
        const supportDiv = document.createElement('support')
        supportDiv.setAttribute('id', 'support')
        supportDiv.innerText = 'This game remake is in the development stage, help me test RRR by submitting bug reports and suggestions!'
        const bugLink = document.createElement('a')
        bugLink.href = "mailto: jpelrah@wpi.edu?subject=RRR%20Bug%20Submission&body=Briefly%20describe%20the%20bug.%20Also%20provide%20your%20operating%20system%28Win%2COSX%2CLinux...%29%20and%20the%20browser%28Chrome%2C%20Firefox...%29%20used%20to%20access%20the%20game.%0A%0AThank%20you%20for%20your%20contribution%21%20-%20Jake"
        bugLink.setAttribute('id','bug-link')
        bugLink.innerText = 'Report Bug: Jpelrah@wpi.edu'
        supportDiv.appendChild(bugLink)
        gameWrapper.appendChild(supportDiv)




        // recording
        // const recordDiv = document.createElement('div')
        // recordDiv.setAttribute('id', 'recording')

        // // const audioElem = document.createElement('audio')
        // // audioElem.setAttribute('controls', true)
        // // recordDiv.appendChild(audioElem)

        // const record = document.createElement('button')
        // record.innerText = 'RECORD'
        // record.addEventListener('click', () => recorder.start())
        // recordDiv.appendChild(record)


        // const stop = document.createElement('button')
        // stop.innerText = 'STOP'
        // stop.addEventListener('click', () => recorder.stop())
        // recordDiv.appendChild(stop)

        // gameWrapper.appendChild(recordDiv)



        // classes to keep track of variables, cleaner?
        this.recorder = new Recorder(this.audioCtx)
        this.songalizer = new Songalizer(this)
        this.vocalizer = new Vocalizer(this.audioCtx, this.samplesBuffer, this.recorder)
        
        // these are all event listener setups
        this.songPreview('song-names')
        this.controls('controls')
        this.dropDown('vibe-select', 'vibe-trigger', this.currentGenre.vibe_image)
        this.dropDown('bop-select','bop-trigger', this.currentGenre.bop_image)
        this.keyMap(this.currentGenre.keyMap)
        this.navigation('navigation')
        const { keyMap, numMap } = this.currentGenre.pitchem
        new PitchEm('pitchEmKeys', keyMap, this)
        new PitchEm('pitchEmNums', numMap, this)
    }

    navigation(id) {

        const navigation = document.getElementById(id)
        const [quitButton, menuButton] = navigation.querySelectorAll('button')

        quitButton.addEventListener('click', ()=> {
            this.mainMenu()
        })
        menuButton.addEventListener('click',  ()=> {
            this.mainMenu()
        })
    }

    controls(id) {
        const controlsDiv = document.getElementById(id)
        const [startStop, clear] = controlsDiv.querySelectorAll('button')

        startStop.addEventListener('click', () => {

            if (!this.songalizer.isPlaying && this.songalizer.tracks.length > 0) {
                this.songalizer.toggle()
                startStop.style.background = `url("../genres/${this.currentGenre.style}/images/stop.png") no-repeat`
                startStop.style.backgroundSize = '100% 100%'
            }
            else if (this.songalizer.isPlaying) {
                this.songalizer.stopSongalizer()
                startStop.style.background = ''
            }
        })

        clear.addEventListener('click', () => {
            this.songalizer.clearSongalizer()
            startStop.style.background =''
        })
    }


    dropDown(selectId, triggerId, img) {
        const select = document.getElementById(selectId)
        const trigger = document.getElementById(triggerId)
        console.log(trigger)

        console.log(select, trigger)
        const play = () => {

            //change the image to reflect the sound playing
            trigger.style.backgroundImage = `url(${img})`
            trigger.style.backgroundRepeat = 'no-repeat';
            trigger.style.backgroundSize = '100% 100%'

            //play sound
            const src = this.playSampleById({id:select.value})

            // reset image
            src.onended = () => {
                trigger.style.backgroundImage = ''
            }
        }
        trigger.addEventListener('click', play, false)
    }

        keyMap(keyMap) {
                const play = (e) => {
                    if (!e.repeat) {
                        keyMap.forEach((sample) => {
                            if (sample.key === e.code) {
                                this.playSampleById({id:sample.id})
                            }
                        })
                    }
                }
                document.addEventListener('keydown', play)
            }

            songPreview (id) {
                    this.currentSong = null
                    const songNamesDiv = document.getElementById(id)
                    const songNames = songNamesDiv.querySelectorAll('img')
            
                
            
            
                    songNames.forEach(song => {
                        const id = song.getAttribute('data-sample-id')
                        const titleNum = song.src.split(/\.png|_/)[2]

                            // if we click anywhere but on another song, stop the song
                    document.addEventListener('mousedown', (e) => {

                        if(e.target.className !==song){

                            song.src = `../genres/${this.currentGenre.style}/images/song_title_${titleNum}.png`
                            this.currentSong?.stop()
                        }
                    })
                        song.addEventListener('click', () => {
            
                            //stop previous song
                            if (this.currentSong) {
                                song.src = `../genres/${this.currentGenre.style}/images/song_title_${titleNum}.png`
                                this.currentSong.stop()
                            }
            
                            if (!this.songalizer.isPlaying) {
                                song.src = `../genres/${this.currentGenre.style}/images/asong_title_${titleNum}.png`
                                this.currentSong = this.playSampleById({id})
                            }
                        })
            
                    })
                }        

    playSampleById({id, start=0, detuneAmt=0}) {
        const src = this.audioCtx.createBufferSource()
        src.buffer = this.samplesBuffer.find(x => x.id === id).audioBuffer
        src.detune.value = detuneAmt
        src.connect(this.audioCtx.destination)
        src.connect(this.recorder.dest)
        src.start(start)
        return src
    }
}

class PitchEm {

    constructor(id, keyMap, gameRef) {
        const div = document.getElementById(id)
        const select = div.querySelector('select')

        const play = (e) => {


            if (!e.repeat) {
                Object.entries(keyMap).forEach((entry) => {
                    console.log(keyMap)
                    const code = e.code
                    if (entry[0] === code) {
                        console.log(select.value)
                        this.currentSample = gameRef.playSampleById({id:select.value,  detuneAmt:keyMap[code]})
                    }
                })
            }
        }
        //Use addEventListener, It allows adding more than one handler for an event.
        document.addEventListener('keydown', play, false)
    }
}






class Vocalizer {
    constructor(audioCtx, samplesBuffer, recorder) {
        this.audioCtx = audioCtx
        this.samplesBuffer = samplesBuffer
        this.recorder = recorder
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
        const source = this.audioCtx.createBufferSource()
        source.buffer = this.samplesBuffer.find(x => x.id === id).audioBuffer
        source.connect(this.audioCtx.destination)
        source.connect(this.recorder.dest)



        if (!this.isPlaying) {
            this.start = this.audioCtx.currentTime
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
    constructor(gameRef) {
        this.gameRef = gameRef 
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
        this.selectedSong = null
        this.songs = document.getElementById('songs').querySelectorAll('div')


        this.songs.forEach(song => {

            song.onmousedown = (ev) => {
                console.log(ev)
                this.selectedSong = song
                document.body.style.cursor = 'url(../images/outline.png) 20 20, pointer'
                //disable pointer events on gameInputElements
                document.querySelectorAll('.gameControlElement').forEach(elem => elem.style.pointerEvents = 'none')
            }


            song.onmouseleave =(ev)=>console.log(document.body.style)

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
            if (this.tracks.length < MAX_SONGS) {
                const id = this.selectedSong.getAttribute('data-sample-id')
                const imgElem = document.createElement('img')
                imgElem.setAttribute('id', this.selectedSong.id)
                imgElem.setAttribute('draggable', false)
                imgElem.setAttribute('data-sample-id', id)
                imgElem.setAttribute('src', `../genres/${this.gameRef.currentGenre.style}/images/${this.selectedSong.id}.png`)
                this.slots.appendChild(imgElem)
                const { audioBuffer } = this.gameRef.samplesBuffer.find(x => x.id === id)
                this.tracks.push({ id, audioBuffer })
            }

            //enable pointer events on gameInputElements
            document.querySelectorAll('.gameControlElement').forEach(elem => elem.style.pointerEvents = 'auto')
            document.body.style.cursor = 'auto'
            this.selectedSong = null

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
            img.src = `../genres/${this.gameRef.currentGenre.style}/images/song_${img.src.split('_')[1]}`
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
                this.nextTrackTime = this.gameRef.audioCtx.currentTime
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
        this.currentSource = this.gameRef.playSampleById({id, start})

    }

    scheduler() {

        while (this.nextTrackTime < this.gameRef.audioCtx.currentTime + this.scheduleAheadTime) {

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
        const style = this.gameRef.currentGenre.style

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



class Recorder {

    constructor(audioCtx) {
        this.chunks = []
        this.dest = audioCtx.createMediaStreamDestination()
        this.mediaRecorder = new MediaRecorder(this.dest.stream, { mimeType: 'audio/webm' })

        this.mediaRecorder.ondataavailable = (evt) => {
            // push each chunk (blobs) in an array
            console.log(this.chunks)
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




window.onload = new Game().init()