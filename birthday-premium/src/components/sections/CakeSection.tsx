import { useRef, useState, Suspense, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import SectionWrapper from '../ui/SectionWrapper'
import AnimatedText from '../ui/AnimatedText'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { soundManager } from '../../lib/sound'
import { StarIcon, HeartIcon, FlowerIcon } from '../ui/PremiumIcons'

let micStream: MediaStream | null = null

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

function CakeTier({ bottomR, topR, height, yOffset, color }: { bottomR:number;topR:number;height:number;yOffset:number;color:string }) {
  const points = useMemo(() => {
    const p: THREE.Vector2[] = []
    for (let i = 0; i <= 24; i++) { const t=i/24; p.push(new THREE.Vector2(bottomR+(topR-bottomR)*Math.pow(t,.6), t*height)) }
    return p
  }, [bottomR, topR, height])
  const geo = useMemo(() => new THREE.LatheGeometry(points, 48), [points])
  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color={color} roughness={.35} metalness={.05} clearcoat={.15} clearcoatRoughness={.3} />
      </mesh>
    </group>
  )
}

function Rose({ position, scale=1 }: { position:[number,number,number]; scale?:number }) {
  return (
    <group position={position} scale={scale}>
      {[0,60,120,180,240,300].map((a)=><mesh key={a} position={[0,.01,0]} rotation={[.2,0,a*Math.PI/180]}>
        <sphereGeometry args={[.04,6,6]} /><meshPhysicalMaterial color="#f472b6" roughness={.3} clearcoat={.4} />
      </mesh>)}
      <mesh position={[0,.02,0]}><sphereGeometry args={[.025,6,6]} /><meshPhysicalMaterial color="#fcd34d" roughness={.2} clearcoat={.3} /></mesh>
    </group>
  )
}

function Pearl({ position }: { position:[number,number,number] }) {
  return <mesh position={position}><sphereGeometry args={[.03,8,8]} /><meshPhysicalMaterial color="#fff" roughness={.1} metalness={.3} clearcoat={1} /></mesh>
}

function Sprinkles({ count=30, radius, yOffset }: { count:number; radius:number; yOffset:number }) {
  const items = useMemo(() => Array.from({length:count},(_,i)=>({
    a:Math.random()*Math.PI*2, r:radius*(.2+Math.random()*.7),
    c:['#fcd34d','#f472b6','#a78bfa','#34d399','#60a5fa'][i%5]
  })), [count,radius])
  return <group>{items.map((it,i)=><mesh key={i} position={[Math.sin(it.a)*it.r, yOffset+Math.random()*.1-.05, Math.cos(it.a)*it.r]}
    rotation={[Math.random()*Math.PI,Math.random()*Math.PI,0]}>
    <boxGeometry args={[.03,.005,.008]} /><meshPhysicalMaterial color={it.c} roughness={.5} metalness={.1} />
  </mesh>)}</group>
}

function CandleFlame({ blown, index }: { blown:boolean; index:number }) {
  const meshRef=useRef<THREE.Mesh>(null!), glowRef=useRef<THREE.Mesh>(null!), time=useRef(Math.random()*100)
  useFrame((_,d)=>{time.current+=d
    if(meshRef.current&&!blown){
      const f=Math.sin(time.current*18+index*3)*.15+Math.sin(time.current*11+index*7)*.1+Math.sin(time.current*7+index*2)*.08
      meshRef.current.scale.x=1+f*.2;meshRef.current.scale.y=1+f*.25;meshRef.current.position.x=Math.sin(time.current*5+index*2)*.008
    }
    if(glowRef.current){const i=blown?0:.6+Math.sin(time.current*15)*.2;glowRef.current.scale.setScalar(.3+i*.4)}
  })
  return <group>
    <mesh ref={meshRef} position={[0,.22,0]}><coneGeometry args={[.025,.07,8]} />
      <meshPhysicalMaterial color="#fcd34d" emissive="#f97316" emissiveIntensity={blown?0:2} transparent opacity={blown?0:1} /></mesh>
    <mesh ref={glowRef} position={[0,.18,0]}><sphereGeometry args={[.04,8,8]} />
      <meshBasicMaterial color="#fcd34d" transparent opacity={blown?0:.35} /></mesh>
  </group>
}

function FloatingRose() {
  const ref=useRef<THREE.Group>(null!)
  useFrame((s)=>{if(ref.current){ref.current.position.y=-1.2+Math.sin(s.clock.elapsedTime*.3)*.05;ref.current.rotation.y=s.clock.elapsedTime*.02}})
  return <group ref={ref}><Rose position={[0,0,0]} scale={1.5} /></group>
}

function PremiumCake3D({blown,onBlow,onSongPlay,playing,detecting}:{blown:boolean;onBlow:()=>void;onSongPlay:()=>void;playing:boolean;detecting:boolean}) {
  const groupRef=useRef<THREE.Group>(null!)
  const controlsRef=useRef<any>(null!)
  const candlePositions=useMemo(()=>[0,72,144,216,288].map((a)=>{const r=a*Math.PI/180;return [Math.sin(r)*.4,Math.cos(r)*.4] as [number,number]}),[])

  useFrame((s)=>{
    if(!groupRef.current||!controlsRef.current)return
    const el=document.getElementById('cake');if(!el)return
    const rect=el.getBoundingClientRect()
    const progress=Math.max(0,Math.min(1,1-rect.top/window.innerHeight))
    const scaleVal=.25+progress*.75
    groupRef.current.scale.setScalar(scaleVal)
    if(!controlsRef.current.isDragging){groupRef.current.rotation.y+=s.clock.getDelta()*.12}
    if(!blown){groupRef.current.position.y=-.9+Math.sin(s.clock.elapsedTime*.4)*.025}
  })

  const handleClick=useCallback((e:any)=>{e.stopPropagation();onSongPlay()},[onSongPlay])

  return <group>
    <mesh position={[0,-1.8,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <circleGeometry args={[2.5,48]} />
      <meshPhysicalMaterial color="#1a1a2e" roughness={.9} metalness={0} transparent opacity={.15} />
    </mesh>

    <group ref={groupRef} position={[0,-.9,0]}>
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true}
        minPolarAngle={Math.PI/4} maxPolarAngle={Math.PI/2.2} rotateSpeed={.5} />

      <group position={[0,-.25,0]}>
        <mesh position={[0,-.02,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.95,1.6,48]} />
          <meshPhysicalMaterial color="#e2e8f0" roughness={.3} metalness={.2} clearcoat={.5} />
        </mesh>
        <mesh position={[0,0,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[.82,1.0,48]} />
          <meshPhysicalMaterial color="#cbd5e1" roughness={.2} metalness={.4} clearcoat={.6} />
        </mesh>
      </group>

      <CakeTier bottomR={.95} topR={.88} height={.28} yOffset={-.15} color="#fbcfe8" />
      <Sprinkles count={20} radius={.8} yOffset={.12} />
      <CakeTier bottomR={.8} topR={.74} height={.26} yOffset={.13} color="#f9a8d4" />
      <Sprinkles count={18} radius={.68} yOffset={.38} />
      <CakeTier bottomR={.65} topR={.6} height={.24} yOffset={.39} color="#f472b6" />

      <Rose position={[.3,-.13,.52]} scale={1.1} />
      <Rose position={[-.35,-.15,-.38]} scale={.95} />
      <Rose position={[.18,.16,.55]} scale={1.05} />
      <Rose position={[-.28,.17,-.48]} scale={.85} />
      <Rose position={[.47,.62,-.25]} scale={1} />
      <Rose position={[-.47,.63,.18]} scale={1.05} />
      <FloatingRose />

      <Pearl position={[.32,-.12,-.52]} />
      <Pearl position={[-.32,-.14,.52]} />
      <Pearl position={[.48,-.13,0]} />
      <Pearl position={[-.48,-.15,0]} />
      <Pearl position={[.52,.15,0]} />
      <Pearl position={[-.52,.16,0]} />
      <Pearl position={[0,.63,.52]} />
      <Pearl position={[0,.63,-.52]} />

      {candlePositions.map(([x,z],i)=><group key={i} position={[x,.63,z]}>
        <mesh position={[0,0,0]}><cylinderGeometry args={[.018,.022,.22,8]} /><meshPhysicalMaterial color="#fff" roughness={.3} metalness={.1} /></mesh>
        <mesh position={[0,.01,0]}><cylinderGeometry args={[.024,.02,.015,8]} /><meshPhysicalMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={.2} /></mesh>
        <CandleFlame blown={blown} index={i} />
      </group>)}

      <mesh position={[0,.62,0]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.48,.57,32]} />
        <meshPhysicalMaterial color="#fce7f3" roughness={.5} transparent opacity={.3} />
      </mesh>

      <mesh onClick={handleClick} visible={false}>
        <boxGeometry args={[1.5,2.5,1.5]} />
      </mesh>

      {detecting&&!blown&&Array.from({length:15}).map((_,i)=><mesh key={i} position={[(Math.random()-.5)*.2,.6+Math.random()*.4,.7]}>
        <sphereGeometry args={[.006+Math.random()*.008,4,4]} /><meshBasicMaterial color="#e2e8f0" transparent opacity={.4} /></mesh>)}
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
  const reducedMotion=useReducedMotion()
  const[blown,setBlown]=useState(false);const[detecting,setDetecting]=useState(false)
  const[showConfetti,setShowConfetti]=useState(false);const[playing,setPlaying]=useState(false)

  const handleBlow=useCallback(()=>{
    if(blown)return;setBlown(true);setDetecting(false)
    if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
    setTimeout(()=>{setShowConfetti(true);soundManager.playCelebration()},400)
  },[blown])

  const startBlow=useCallback(async()=>{
    if(blown||detecting)return;setDetecting(true)
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});micStream=stream
      const AC=window.AudioContext||(window as unknown as Record<string, typeof AudioContext>).webkitAudioContext
      if(!AC){handleBlow();return}
      const ctx=new AC();const source=ctx.createMediaStreamSource(stream);const analyser=ctx.createAnalyser()
      analyser.fftSize=256;source.connect(analyser)
      const data=new Uint8Array(analyser.frequencyBinCount)
      let timeout=setTimeout(()=>handleBlow(),8000);let stopped=false
      const check=()=>{if(stopped||blown)return;analyser.getByteTimeDomainData(data)
        let sum=0;for(let i=0;i<data.length;i++)sum+=Math.abs(data[i]-128)/128
        if(sum/data.length>.1){clearTimeout(timeout);handleBlow();return}
        requestAnimationFrame(check)}
      check()
      return()=>{stopped=true;clearTimeout(timeout)}
    }catch{handleBlow()}
  },[blown,detecting,handleBlow])

  const handleSongPlay=useCallback(()=>{if(playing)return;setPlaying(true);playHappyBirthday();setTimeout(()=>setPlaying(false),10000)},[playing])

  useEffect(()=>(()=>{if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}}),[])

  if(reducedMotion)return<SectionWrapper className="bg-rose-garden min-h-[100dvh] relative" id="cake" transitionType="portal">
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

      <div className="relative z-10 text-center mb-4">
        <AnimatedText text="Make a Wish" className="text-3xl md:text-5xl font-heading text-rose-200 text-center" />
        <p className="text-rose-100/30 font-sans text-xs tracking-widest uppercase mt-2">Blow the candles and make your birthday wish</p>
      </div>

      <div className="w-full h-[420px] md:h-[520px] relative">
        <Suspense fallback={<div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
          <span className="text-white/20 text-xs font-sans tracking-widest uppercase">Baking your cake...</span></div>}>
          <Canvas shadows camera={{position:[0,-.2,3.8],fov:36}}
            gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.2}}>
            <ambientLight intensity={.15} />
            <hemisphereLight args={['#fce7f3','#1a1a2e',.3]} />
            <directionalLight position={[2,4,3]} intensity={.6} castShadow />
            <pointLight position={[-2,2,3]} intensity={.2} color="#fcd34d" />
            <pointLight position={[0,3,-1]} intensity={.15} color="#f472b6" />
            <spotLight position={[0,5,3]} angle={.3} penumbra={.8} intensity={.3} castShadow />
            <PremiumCake3D blown={blown} onBlow={handleBlow} onSongPlay={handleSongPlay} playing={playing} detecting={detecting} />
          </Canvas>
        </Suspense>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <MicButton onClick={startBlow} disabled={blown} detecting={detecting} />
          <SongButton onClick={handleSongPlay} playing={playing} />
        </div>
      </div>

      {showConfetti&&<motion.div
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}}
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
