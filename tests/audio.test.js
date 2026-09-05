import { AudioEngine } from '../js/audio.js';

test('shaft travel uses a soft noise sweep with no drilling impact tone', () => {
    const param=()=>({value:0,setValueAtTime:jest.fn(),exponentialRampToValueAtTime:jest.fn()});
    const source={connect:jest.fn(),start:jest.fn(),stop:jest.fn()};
    const filter={type:'',Q:param(),frequency:param(),connect:jest.fn()};
    const gain={gain:param(),connect:jest.fn()};
    const engine=new AudioEngine();engine.ctx={state:'running',currentTime:1,createBufferSource:()=>source,createBiquadFilter:()=>filter,createGain:()=>gain};
    engine.fxGain={};engine.noise={};engine.tone=jest.fn();engine.play('shaft');
    expect(filter.type).toBe('bandpass');expect(source.start).toHaveBeenCalled();expect(source.stop).toHaveBeenCalledWith(1.45);
    expect(engine.tone).not.toHaveBeenCalled();
});
test('muted effects produce no sound nodes', () => {
    const engine=new AudioEngine();engine.effects=false;engine.ctx={state:'running',createBufferSource:jest.fn()};
    engine.play('shaft');engine.play('dig');expect(engine.ctx.createBufferSource).not.toHaveBeenCalled();
});
