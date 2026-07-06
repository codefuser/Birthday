import { useRef, useState, Suspense, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text3D } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { birthdayConfig } from '../../config/birthday'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { soundManager } from '../../lib/sound'
import { StarIcon, HeartIcon, FlowerIcon } from '../ui/PremiumIcons'

let micStream: MediaStream | null = null
let blowCheckId: number | null = null

function playHappyBirthday() {
  const AC = window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext
  if (!AC) return
  const ctx = new AC()
  const note = (freq: number, start: number, dur: number) => {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0.12, ctx.currentTime + start)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
    o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur)
  }
  const C4=261.63,D4=293.66,E4=329.63,F4=349.23,G4=392.00,A4=440.00,Bb4=466.16,C5=523.25
  note(C4,0,.3);note(C4,.3,.3);note(D4,.6,.35);note(C4,.95,.35);note(F4,1.3,.35);note(E4,1.65,.5)
  note(C4,2.15,.3);note(C4,2.45,.3);note(D4,2.75,.35);note(C4,3.1,.35);note(G4,3.45,.35);note(F4,3.8,.5)
  note(C4,4.3,.3);note(C4,4.6,.3);note(C5,4.9,.35);note(A4,5.25,.35);note(F4,5.6,.35);note(E4,5.95,.35);note(D4,6.3,.5)
  note(Bb4,6.8,.3);note(Bb4,7.1,.3);note(A4,7.4,.35);note(F4,7.75,.35);note(G4,8.1,.35);note(F4,8.45,.8)
}

function CakeTier({ bR, tR, h, yO, col }: { bR:number;tR:number;h:number;yO:number;col:string }) {
  const pts = useMemo(() => {
    const p: THREE.Vector2[] = []
    for (let i = 0; i <= 24; i++) { const t=i/24; p.push(new THREE.Vector2(bR+(tR-bR)*Math.pow(t,.7), t*h)) }
    return p
  }, [bR, tR, h])
  return <mesh position={[0, yO, 0]} geometry={useMemo(()=>new THREE.LatheGeometry(pts, 48), [pts])} castShadow receiveShadow>
    <meshPhysicalMaterial color={col} roughness={.35} metalness={.05} clearcoat={.15} clearcoatRoughness={.3} />
  </mesh>
}

function CreamRing({ r, y }: { r:number; y:number }) {
  const pts = useMemo(() => {
    const p: THREE.Vector2[] = []
    for (let i = 0; i <= 12; i++) { const t=i/12; p.push(new THREE.Vector2(r*(1+t*.03-t*.06), t*.04)) }
    return p
  }, [r])
  return <mesh position={[0, y, 0]} geometry={useMemo(()=>new THREE.LatheGeometry(pts, 32), [pts])} receiveShadow>
    <meshPhysicalMaterial color="#fdf2f8" roughness={.6} metalness={0} clearcoat={.05} />
  </mesh>
}

function CakeTopper() {
  return <group position={[0,.685,0]}>
    <Text3D font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
      size={.085} height={.02} curveRadius={.3}
      bevelEnabled bevelSize={.003} bevelThickness={.008} bevelSegments={8}
      anchorX="center" anchorY="middle">
      MS
      <meshPhysicalMaterial color="#fcd34d" metalness={.9} roughness={.1}
        clearcoat={.4} clearcoatRoughness={.1} emissive="#fcd34d" emissiveIntensity={.06} />
    </Text3D>
    <mesh position={[0,-.008,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.02,.22,24]} />
      <meshPhysicalMaterial color="#fcd34d" roughness={.2} metalness={.8} clearcoat={.3} transparent opacity={.2} />
    </mesh>
  </group>
}

function Rose({ pos, sc=1 }: { pos:[number,number,number]; sc?:number }) {
  return <group position={pos} scale={sc}>
    {[0,60,120,180,240,300].map((a)=><mesh key={a} position={[0,.01,0]} rotation={[.2,0,a*Math.PI/180]}>
      <sphereGeometry args={[.045,6,6]} /><meshPhysicalMaterial color="#f472b6" roughness={.3} clearcoat={.4} />
    </mesh>)}
    <mesh position={[0,.02,0]}><sphereGeometry args={[.028,6,6]} /><meshPhysicalMaterial color="#fcd34d" roughness={.2} clearcoat={.3} /></mesh>
  </group>
}

function Pearl({ pos }: { pos:[number,number,number] }) {
  return <mesh position={pos}><sphereGeometry args={[.035,10,10]} /><meshPhysicalMaterial color="#fff" roughness={.1} metalness={.4} clearcoat={1} /></mesh>
}

function Sprinkles({ cnt=30, r, y }: { cnt:number; r:number; y:number }) {
  const items = useMemo(() => Array.from({length:cnt},(_,i)=>({
    a:Math.random()*Math.PI*2, rad:r*(.2+Math.random()*.7),
    c:['#fcd34d','#f472b6','#a78bfa','#34d399','#60a5fa'][i%5]
  })), [cnt,r])
  return <group>{items.map((it,i)=><mesh key={i} position={[Math.sin(it.a)*it.rad, y+Math.random()*.08-.04, Math.cos(it.a)*it.rad]}
    rotation={[Math.random()*Math.PI,Math.random()*Math.PI,0]}>
    <boxGeometry args={[.035,.005,.01]} /><meshPhysicalMaterial color={it.c} roughness={.5} metalness={.1} />
  </mesh>)}</group>
}

function Candle({ pos, blown, idx }: { pos:[number,number]; blown:boolean; idx:number }) {
  const mr=useRef<THREE.Mesh>(null!), gr=useRef<THREE.Mesh>(null!), t=useRef(Math.random()*100)
  useFrame((_,d)=>{t.current+=d
    if(mr.current&&!blown){
      const f=Math.sin(t.current*18+idx*3)*.15+Math.sin(t.current*11+idx*7)*.1+Math.sin(t.current*7+idx*2)*.08
      mr.current.scale.x=1+f*.2;mr.current.scale.y=1+f*.25
    }
    if(gr.current){const i=blown?0:.6+Math.sin(t.current*15)*.2;gr.current.scale.setScalar(.3+i*.4)}
  })
  return <group position={[pos[0],.88,pos[1]]}>
    <mesh position={[0,0,0]}><cylinderGeometry args={[.018,.024,.28,8]} /><meshPhysicalMaterial color="#fef3c7" roughness={.3} metalness={.1} /></mesh>
    <mesh position={[0,.02,0]}><cylinderGeometry args={[.026,.022,.02,8]} /><meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={.15} /></mesh>
    <mesh position={[0,.04,0]}><cylinderGeometry args={[.016,.018,.01,8]} /><meshPhysicalMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={.1} /></mesh>
    <mesh ref={mr} position={[0,.22,0]}><coneGeometry args={[.025,.08,8]} />
      <meshPhysicalMaterial color="#fcd34d" emissive="#f97316" emissiveIntensity={blown?0:2.5} transparent opacity={blown?0:1} /></mesh>
    <mesh ref={gr} position={[0,.18,0]}><sphereGeometry args={[.04,8,8]} />
      <meshBasicMaterial color="#fcd34d" transparent opacity={blown?0:.35} /></mesh>
  </group>
}

function PremiumCake3D({blown,onBlow,onSongPlay,playing,detecting}:{blown:boolean;onBlow:()=>void;onSongPlay:()=>void;playing:boolean;detecting:boolean}) {
  const grp=useRef<THREE.Group>(null!), ctrl=useRef<any>(null!)
  const cpos=useMemo(()=>[0,72,144,216,288].map((a)=>{const r=a*Math.PI/180;return [Math.sin(r)*.42,Math.cos(r)*.42] as [number,number]}),[])

  useFrame((s)=>{
    if(!grp.current||!ctrl.current)return
    if(!ctrl.current.isDragging)grp.current.rotation.y+=s.clock.getDelta()*.12
    if(!blown)grp.current.position.y=-.9+Math.sin(s.clock.elapsedTime*.4)*.025
  })

  const hc=useCallback((e:any)=>{e.stopPropagation();onSongPlay()},[onSongPlay])

  return <group>
    <mesh position={[0,-1.8,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <circleGeometry args={[2.5,48]} />
      <meshPhysicalMaterial color="#1a1a2e" roughness={.9} metalness={0} transparent opacity={.12} />
    </mesh>

    <group ref={grp} position={[0,-.9,0]}>
      <OrbitControls ref={ctrl} enablePan={false} enableZoom={true}
        minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/2} rotateSpeed={.5} />

      <group position={[0,-.15,0]}>
        <mesh position={[0,-.01,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.92,1.7,48]} />
          <meshPhysicalMaterial color="#e2e8f0" roughness={.3} metalness={.2} clearcoat={.5} />
        </mesh>
        <mesh position={[0,0,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.82,1.0,48]} />
          <meshPhysicalMaterial color="#cbd5e1" roughness={.2} metalness={.4} clearcoat={.6} />
        </mesh>
      </group>

      <CakeTier bR={1.0} tR={.92} h={.32} yO={-.15} col="#fce7f3" />
      <CreamRing r={.92} y={.17} />
      <Sprinkles cnt={22} r={.88} y={.08} />

      <CakeTier bR={.86} tR={.78} h={.28} yO={.17} col="#fbcfe8" />
      <CreamRing r={.78} y={.45} />
      <Sprinkles cnt={18} r={.74} y={.3} />

      <CakeTier bR={.72} tR={.65} h={.24} yO={.45} col="#f9a8d4" />
      <CreamRing r={.65} y={.69} />

      <CakeTopper />

      {cpos.map((p,i)=><Candle key={i} pos={p} blown={blown} idx={i} />)}

      <Rose pos={[.38,-.05,.55]} sc={1.2} />
      <Rose pos={[-.42,-.07,-.4]} sc={1} />
      <Rose pos={[.22,.28,.58]} sc={1.1} />
      <Rose pos={[-.32,.26,-.5]} sc={.9} />
      <Rose pos={[.5,.68,-.25]} sc={1} />
      <Rose pos={[-.5,.7,.2]} sc={1.05} />

      <Pearl pos={[.4,-.04,-.55]} />
      <Pearl pos={[-.4,-.06,.55]} />
      <Pearl pos={[.55,-.05,0]} />
      <Pearl pos={[-.55,-.07,0]} />
      <Pearl pos={[.58,.25,0]} />
      <Pearl pos={[-.58,.26,0]} />
      <Pearl pos={[0,.8,.55]} />
      <Pearl pos={[0,.8,-.55]} />

      <mesh onClick={hc} visible={false}><boxGeometry args={[1.5,2.5,1.5]} /></mesh>

      {detecting&&!blown&&Array.from({length:12}).map((_,i)=><mesh key={i} position={[(Math.random()-.5)*.2,.7+Math.random()*.4,.65]}>
        <sphereGeometry args={[.005+Math.random()*.008,4,4]} /><meshBasicMaterial color="#e2e8f0" transparent opacity={.4} /></mesh>)}
    </group>
  </group>
}

function MicButton({onClick,disabled,detecting}:{onClick:()=>void;disabled:boolean;detecting:boolean}) {
  const cls="px-8 py-3 rounded-full font-sans text-sm tracking-widest uppercase transition-all duration-500 "+(
    disabled?"bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
    :"bg-gradient-to-r from-rose-400/30 to-pink-400/20 text-rose-200 border border-rose-400/30 hover:border-rose-400/50 backdrop-blur-md shadow-lg shadow-rose-500/10")
  return <motion.button onClick={onClick} disabled={disabled}
    whileHover={disabled?{}:{scale:1.05}} whileTap={disabled?{}:{scale:.95}} className={cls}>
    {disabled?<span className="flex items-center gap-2"><HeartIcon className="w-4 h-4" /><span>Wish Made</span></span>
    :detecting?<span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border border-current animate-spin border-t-transparent" /><span>Blow...</span></span>
    :<span className="flex items-center gap-2"><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg><span>Blow Candles</span></span>}
  </motion.button>
}

function SongButton({onClick,playing}:{onClick:()=>void;playing:boolean}) {
  return <motion.button onClick={onClick} whileHover={{scale:1.05}} whileTap={{scale:.95}}
    className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-rose-200 hover:border-rose-300/30 hover:bg-rose-400/10 transition-all duration-500 font-sans text-xs tracking-widest uppercase backdrop-blur-sm">
    {playing?<span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full border border-current animate-spin border-t-transparent" /><span>Playing...</span></span>
    :<span className="flex items-center gap-2"><svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" /></svg><span>Song</span></span>}
  </motion.button>
}

export default function CakeSection() {
  const rm=useReducedMotion()
  const[blown,setBlown]=useState(false);const[detecting,setDetecting]=useState(false)
  const[sc,setSc]=useState(false);const[playing,setPlaying]=useState(false)

  const hb=useCallback(()=>{
    if(blown)return;setBlown(true);setDetecting(false)
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    if(blowCheckId){cancelAnimationFrame(blowCheckId);blowCheckId=null}
    setTimeout(()=>{setSc(true);soundManager.playCelebration()},400)
  },[blown])

  const sb=useCallback(async()=>{
    if(blown||detecting)return;setDetecting(true)
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});micStream=stream
      const AC=window.AudioContext||(window as unknown as Record<string, typeof AudioContext>).webkitAudioContext
      if(!AC){hb();return}
      const ctx=new AC();const src=ctx.createMediaStreamSource(stream)
      const an=ctx.createAnalyser();an.fftSize=128;src.connect(an)
      let to=setTimeout(()=>hb(),6000);let st=false
      const ck=()=>{if(st||blown){cancelAnimationFrame(blowCheckId!);blowCheckId=null;return}
        const d=new Uint8Array(an.frequencyBinCount);an.getByteTimeDomainData(d)
        let s=0;for(let i=0;i<d.length;i++)s+=Math.abs(d[i]-128)/128
        if(s/d.length>.08){clearTimeout(to);hb();return}
        blowCheckId=requestAnimationFrame(ck)}
      ck()
      return()=>{st=true;clearTimeout(to)}
    }catch{hb()}
  },[blown,detecting,hb])

  const hs=useCallback(()=>{if(playing)return;setPlaying(true);playHappyBirthday();setTimeout(()=>setPlaying(false),10000)},[playing])

  useEffect(()=>(()=>{
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    if(blowCheckId){cancelAnimationFrame(blowCheckId);blowCheckId=null}
  }),[])

  if(rm)return<SectionWrapper className="bg-rose-garden min-h-[100dvh] relative" id="cake" transitionType="portal">
    <div className="text-center"><AnimatedText text="Make a Wish" className="text-4xl md:text-6xl font-heading text-rose-200 mb-4 text-center" />
    <p className="text-rose-100/40 font-sans tracking-widest uppercase text-sm">Blow the candles</p>
    <div className="mt-12 text-white/30 font-script text-2xl">May all your wishes come true</div></div>
  </SectionWrapper>

  return (
    <SectionWrapper className="bg-rose-garden min-h-[130dvh] relative" id="cake" transitionType="portal">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_,i)=><motion.div key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
            background:`radial-gradient(circle,${['#fcd34d','#f472b6','#fbcfe8','#fff'][i%4]},transparent)`}}
          animate={{opacity:[0,.6,0],scale:[0,1.5,0]}}
          transition={{duration:2+Math.random()*4,repeat:Infinity,delay:Math.random()*3,ease:'easeInOut'}} />)}
      </div>

      <div className="relative z-10 text-center mb-8">
        <motion.p initial={{opacity:0,y:-20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="text-gold-300/60 font-sans text-xs tracking-[.3em] uppercase mb-3">Celebrating</motion.p>
        <AnimatedText text={`Happy Birthday ${birthdayConfig.friendName}`}
          className="text-3xl md:text-5xl font-heading text-rose-100 text-center" variant="reveal" />
        <motion.p initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:.4}}
          className="text-rose-100/25 font-sans text-xs tracking-widest uppercase mt-3">Blow the candles and make your birthday wish</motion.p>
      </div>

      <div className="w-full h-[420px] md:h-[520px] relative">
        <Suspense fallback={<div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
          <span className="text-white/20 text-xs font-sans tracking-widest uppercase">Baking your cake...</span></div>}>
          <Canvas shadows camera={{position:[0,-.05,3.4],fov:34}}
            gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.2}}>
            <ambientLight intensity={.18} />
            <hemisphereLight args={['#fce7f3','#1a1a2e',.35]} />
            <directionalLight position={[2.5,4,3]} intensity={.7} castShadow />
            <pointLight position={[-2,2,3]} intensity={.25} color="#fcd34d" />
            <pointLight position={[0,3,-1]} intensity={.2} color="#f472b6" />
            <spotLight position={[0,5,3]} angle={.3} penumbra={.8} intensity={.4} castShadow />
            <PremiumCake3D blown={blown} onBlow={hb} onSongPlay={hs} playing={playing} detecting={detecting} />
          </Canvas>
        </Suspense>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <MicButton onClick={sb} disabled={blown} detecting={detecting} />
          <SongButton onClick={hs} playing={playing} />
        </div>
      </div>

      {sc&&<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}}
        className="relative z-10 text-center mt-5">
        <p className="text-rose-200/70 font-script text-2xl mb-2">Your wish has been made...</p>
        <div className="flex justify-center gap-3">
          {[StarIcon,HeartIcon,FlowerIcon].map((Icon,i)=><motion.div key={i}
            animate={{y:[0,-8,0]}} transition={{duration:2,repeat:Infinity,delay:i*.2,ease:'easeInOut'}}>
            <Icon className={"w-5 h-5 "+(i===0?"text-gold-300":i===1?"text-rose-300":"text-pink-300")} />
          </motion.div>)}
        </div>
      </motion.div>}
    </SectionWrapper>
  )
}
