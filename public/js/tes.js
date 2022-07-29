class Vocalizer {
    constructor() {
        this.isPlaying = false
        this.triggers = document.querySelector('#vocalizer').querySelectorAll('button')
        this.triggers.forEach(trigger => trigger.addEventListener('click', () => this.onClick(trigger)))
        this.start = 0
        this.prevDuration = 0
        this.counter = 0
        this.src = null
    }


    stopVocalizer() {
        console.log(this.src)
        this.src.disconnect()
    }

    onClick(trigger) {
        trigger.disabled = true
        trigger.style.opacity = .5
        trigger.style.backgroundColor = 'white'
        trigger.style.filter = 'blur(4px)'
        const id = trigger.getAttribute('data-sample-id')

        if (!this.isPlaying) {
            this.start = audioCtx.currentTime
            this.src = playSampleById({ id, start: this.start, })
        }
        else if (this.isPlaying) {
            this.src = playSampleById({ id, start: this.start + this.prevDuration })
        }

        this.src.onended = () => {
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
        this.counter++

        this.isPlaying = true
        this.prevDuration += this.src.buffer.duration
    }
}