import { createElement } from "./utils/elements";

export default class ProgressBar {
    constructor(config, element) {
        this._config = config;
        this._element = element;
        this.segments = [];
        this.initialize();
        
    }

    initialize() {
        this._progressContainer = createElement("div", {
            class: "plyr__progress__segments"
        })

        this._element.appendChild(this._progressContainer);

        this._width = this._element.offsetWidth;
    }

    setDuration(value) {
        this._duration = value;
        this.render();
    }

    setCurrentTime(value) {
        console.log('setCurrentTime',value)
        if(this._progressContainer.childElementCount == 1) {
            const time = this._progressContainer.querySelector('.plyr__progress__segment-time')
            console.log('value / this._duration', value, this._duration)
            time && (time.style.transform = `scaleX(${value / this._duration})`);
        }
        // this._duration = value;
    }

    setBufferTime(value) {
        console.log('setBufferTime',value)
        if(this._progressContainer.childElementCount == 1) {
            const time = this._progressContainer.querySelector('.plyr__progress__segment-buffer')
            time && (time.style.transform = `scaleX(${value / 100})`);
        }        
        // this._duration = value;
    }

    render() {        
        const { clips } = this._config;

        this.clips = this._parseClips(clips)
        this.drawClips(this.clips);
    }

    drawClips(map) {
        let length = 1;
        if(this._duration > 0 && map.size > 0) {
            length = map.size;
        }
        if(this._progressContainer.childElementCount != length || this._width != this._element.offsetWidth) {
            this._width = this._element.offsetWidth;
            this._progressContainer.replaceChildren();
            for(let i = 0; i < length; i++) {
                const element = this.createClip();
                // this._progressContainer.innerHtml = element;
                this._progressContainer.appendChild(new DOMParser().parseFromString(element, "text/html").body.firstElementChild);
                // console.log('hui', element, this._progressContainer.innerHtml)
            }
        }
    }

    createClip() {
        let width = this._element.offsetWidth;
        if(this._duration) {

        }        
        const element = `
            <div class="plyr__progress__segment" style="width: ${width}px;">
                <div class="plyr__progress__segment-bg"></div>
                <div class="plyr__progress__segment-buffer" style="transform: scaleX(0);"></div>
                <div class="plyr__progress__segment-time" style="transform: scaleX(0);"></div>
            </div>
        `
        return element;
    }

    _parseClips(clips) {
        const mapClips = new Map();
        if(!clips || !clips.text) return mapClips;

        const arrClips = clips.text.split('\n');
        arrClips.forEach((val, index) => {
          const matchRes = val.match(/(\d+:\d+|:\d+) (.+)/i);
          if (matchRes && ~matchRes[1].search(/\d+:\d+|:\d+/)) {
            const key = strtimeToMiliseconds(matchRes[1]);
    
            if (!isNaN(key)) {
               mapClips.set(key, {
                index,
                start: key,
                text: matchRes[2],
              });
            }
          }
        });
        return mapClips;
      }
}