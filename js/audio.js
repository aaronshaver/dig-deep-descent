// Original procedural score. No remote assets, samples, or autoplay dependency.
export class AudioEngine {
    constructor() { this.ctx = null; this.music = true; this.effects = true; this.volume = .55; this.step = 0; this.depth = 0; this.nextNote = 0; }
    async start() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.ctx = new AudioContext();
            this.master = this.ctx.createGain(); this.master.gain.value = this.volume * .45; this.master.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
            this.fxGain = this.ctx.createGain(); this.fxGain.connect(this.master);
            const delay = this.ctx.createDelay(2); delay.delayTime.value = .68;
            const feedback = this.ctx.createGain(); feedback.gain.value = .36;
            delay.connect(feedback); feedback.connect(delay); delay.connect(this.musicGain); this.echo = delay;
            [36.71,55,73.42,110.2].forEach((frequency,i) => {
                const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); const filter = this.ctx.createBiquadFilter();
                osc.type = i === 0 ? 'sine' : 'triangle'; osc.frequency.value = frequency; osc.detune.value = i * 3 - 4;
                filter.type = 'lowpass'; filter.frequency.value = 220; gain.gain.value = .075;
                const lfo = this.ctx.createOscillator(); const amount = this.ctx.createGain(); lfo.frequency.value = .06 + i*.019; amount.gain.value = .028;
                lfo.connect(amount); amount.connect(gain.gain); lfo.start(); osc.connect(filter); filter.connect(gain); gain.connect(this.musicGain); osc.start();
            });
            const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
            const values = buffer.getChannelData(0); for(let i=0;i<values.length;i++) values[i] = Math.random()*2-1;
            this.noise = buffer;
        }
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        this.updateGains();
    }
    updateGains() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        this.master.gain.setTargetAtTime(this.volume*.45,t,.1);
        this.musicGain.gain.setTargetAtTime(this.music ? .55 : 0,t,.2);
        this.fxGain.gain.setTargetAtTime(this.effects ? .7 : 0,t,.05);
    }
    tone(frequency, duration, volume, bus, type = 'sine') {
        const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(frequency,t); g.gain.setValueAtTime(.001,t); g.gain.exponentialRampToValueAtTime(volume,t+.025); g.gain.exponentialRampToValueAtTime(.001,t+duration);
        osc.connect(g); g.connect(bus); osc.start(); osc.stop(t+duration+.05);
    }
    tick(depth) {
        if (!this.ctx || this.ctx.state !== 'running' || !this.music) return;
        if (this.ctx.currentTime < this.nextNote) return;
        this.nextNote = this.ctx.currentTime + 2.6;
        const notes = [146.83,0,220,164.81,0,130.81,0,110];
        const f = notes[this.step++ % notes.length];
        if (f) { this.tone(f * (depth > 12 ? .5 : 1), 4, .085, this.echo); this.tone(f*2.003, 3, .025, this.musicGain); }
    }
    play(type, drillTier = 0) {
        if (!this.ctx || this.ctx.state !== 'running' || !this.effects) return;
        const t = this.ctx.currentTime;
        if(type==='lowEnergy'||type==='criticalEnergy') {
            const critical=type==='criticalEnergy';
            for(let i=0;i<(critical?3:2);i++){
                const at=t+i*.24,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
                osc.type='sine';osc.frequency.value=critical?620:420;
                gain.gain.setValueAtTime(.001,at);gain.gain.exponentialRampToValueAtTime(critical?.17:.11,at+.025);gain.gain.exponentialRampToValueAtTime(.001,at+.17);
                osc.connect(gain);gain.connect(this.fxGain);osc.start(at);osc.stop(at+.19);
            }
            return;
        }
        if(type==='shaft') {
            const source=this.ctx.createBufferSource();source.buffer=this.noise;
            const filter=this.ctx.createBiquadFilter();filter.type='bandpass';filter.Q.value=.6;
            filter.frequency.setValueAtTime(450,t);filter.frequency.exponentialRampToValueAtTime(1700,t+.14);filter.frequency.exponentialRampToValueAtTime(350,t+.4);
            const gain=this.ctx.createGain();gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(.22,t+.12);gain.gain.exponentialRampToValueAtTime(.001,t+.42);
            source.connect(filter);filter.connect(gain);gain.connect(this.fxGain);source.start();source.stop(t+.45);return;
        }
        if (['dig','explosion','collapse','depth'].includes(type)) {
            const source = this.ctx.createBufferSource(); source.buffer = this.noise;
            const filter = this.ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = type === 'dig' ? 1500 : 550;
            const gain = this.ctx.createGain(); const duration = type === 'dig' ? .15 : .7;
            gain.gain.setValueAtTime(type === 'dig' ? .35 : .65,t); gain.gain.exponentialRampToValueAtTime(.001,t+duration);
            source.connect(filter); filter.connect(gain); gain.connect(this.fxGain); source.start(); source.stop(t+duration);
            this.tone(type === 'dig' ? 85-drillTier*5 : 44, duration, .3, this.fxGain, 'triangle');
        } else if (type === 'scan') {
            this.tone(740, 1.2, .14, this.fxGain); this.tone(1480,.6,.045,this.echo);
        } else if (['purchase','ore','relic','complete'].includes(type)) {
            this.tone(type === 'ore' ? 680 : 440,.3,.1,this.fxGain); this.tone(type === 'ore' ? 1020 : 660,.6,.07,this.fxGain);
        } else if (type === 'alarm' || type === 'damage') this.tone(165,.22,.07,this.fxGain,'triangle');
    }
    suspend() { if (this.ctx?.state === 'running') this.ctx.suspend(); }
}
