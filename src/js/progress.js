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

        this.subscribeAttributeChange(this._element, "seek-value")

        this._element.appendChild(this._progressContainer);

        this._width = this._element.offsetWidth;
    }

    subscribeAttributeChange(element, attribute) {
        const config = { attributes: true, childList: false, subtree: false };
        const callback = (mutationsList) => {

            for (let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === attribute) {
                    const percent = mutation.target.getAttribute(attribute)
                    this.setPercentVideo(percent)
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(element, config);

    }    

    setDuration(value) {
        this._duration = value;
        this.render();
    }

    setCurrentTime(value) {
        this.updateProgress('.plyr__progress__segment-time', this._duration, value)     
    }

    updateProgress(className, delimentr, value) {
        if(this._duration) {
            const percent = value / delimentr;
            let currentWidth = this._width * percent;
            const elements = Array.from(this._progressContainer.children);
            for(let i = 0; i < elements.length; i++) {
                const elementWidth = elements[i].offsetWidth;
                if(currentWidth < elementWidth) {
                    if(currentWidth > 0) {
                        const percentInElement = currentWidth / elementWidth;
                        currentWidth = 0;
                        this.setScaleInElement(
                            elements[i].querySelector(className),
                            percentInElement
                        )
                    } else {
                        this.setScaleInElement(
                            elements[i].querySelector(className),
                            0
                        )                        
                    }
                    
                } else {
                    currentWidth -= elementWidth;
                    this.setScaleInElement(
                        elements[i].querySelector(className),
                        1
                    )
                }
            }                 
        }
    }

    setScaleInElement(element, value) {
        element && (element.style.transform = `scaleX(${value})`);
    }

    setPercentVideo(value) {
        this.updateProgress('.plyr__progress__segment-time', 100, value)    
    }

    setBufferTime(value) {      
        this.updateProgress('.plyr__progress__segment-buffer', 100, value)            
    }

    render() {        
        const { clips } = this._config;
                
        // this.clips = this._parseClips({
        //    "text": "00:00 Интро\r\n00:40 “Полярная”\r\n00:46 Диалоги “Полярная”\r\n01:32 “Чпок”\r\n02:04 Диалоги “Чпок” \r\n02:53 “Поиск”\r\n"
        // })
        this.clips = this._parseClips(clips);
        this.drawClips(this.clips);
    }

    drawClips(map) {
        let length = 1;
        if(this._duration > 0 && map.length > 0) {
            length = map.length;
        }
        if(this._progressContainer.childElementCount != length || this._width != this._element.offsetWidth) {
            this._width = this._element.offsetWidth;
            this._progressContainer.replaceChildren();
            for(let i = 0; i < length; i++) {
                let element;
                if(map[i + 1]) {
                    element = this.createClip(map[i].start, map[i + 1].start);
                } else {
                    element = this.createClip(map[i]?.start || 0, -1);
                }
                this._progressContainer.appendChild(new DOMParser().parseFromString(element, "text/html").body.firstElementChild);
            }
        } 
    }

    createClip(start, end) {
        let width = this._element.offsetWidth;
        if(this._duration) {
            let realEnd = end > 0 ? end : this._duration;
            const percent = (realEnd - start) / this._duration;
            width = width * percent;
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

    _strtimeToMiliseconds(str) {
        if (!str){
          return;
        }
        const arr = str.split(/:/);
        let { h, m, s } = 0;
        if (arr.length>=3) {
          h = parseInt(arr[arr.length-3])*60*60;
        } else {
          h = 0;
        }
        if (arr.length>=2) {
          m = parseInt(arr[arr.length-2])*60;
        } else {
          m = 0;
        }
      
        if (arr.length>=1) {
          s = parseInt(arr[arr.length-1]);
        } else {
          s = 0;
        }
        return (h+m+s);
      }    

    _parseClips(clips) {
        const mapClips = [];
        if(!clips || !clips.text) return mapClips;

        const arrClips = clips.text.split('\n');
        arrClips.forEach((val, index) => {
          const matchRes = val.match(/(\d+:\d+|:\d+) (.+)/i);
          if (matchRes && ~matchRes[1].search(/\d+:\d+|:\d+/)) {
            const key = this._strtimeToMiliseconds(matchRes[1]);
    
            if (!isNaN(key)) {
                mapClips.push({
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