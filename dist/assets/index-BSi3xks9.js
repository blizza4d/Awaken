var Tt=Object.defineProperty;var Nt=(d,e,t)=>e in d?Tt(d,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[e]=t;var o=(d,e,t)=>Nt(d,typeof e!="symbol"?e+"":e,t);import{r as Gt,g as Dt,c as Rt,a as P,j as s,u as Pe,b as Ae,m as L,S as Je,C as pt,d as zt,A as Et,e as je,L as Lt,P as jt,f as Ft,h as Ot,V as kt,i as Wt,E as vt,k as xt,M as Bt,l as Ht,n as It,o as Ut,X as Vt,G as Xt,p as qt,q as Yt,s as Kt,R as Qt,t as Zt}from"./vendor-DK_OTAvj.js";import{M as S,O as Jt,B as J,F as st,S as C,U as de,V as T,W as xe,H as ge,N as _t,C as gt,a as M,b as N,A as I,c as B,R as $t,d as es,e as ts,L as ss,f as is,g as as,h as wt,i as os,j as rs,T as it,k as ns,l as at,m as X,P as q,n as ls,I as he,o as cs,p as ve,q as bt,r as hs,s as Fe,t as _e,D as $e,u as He,v as H,w as oe,x as W,y as ue,z as ds,E as ot,G as yt,J as Oe,K as A,Q as re,X as et,Y as Me,Z as us,_ as ae,$ as Ie,a0 as ms,a1 as Ze,a2 as fs}from"./three-BMG0kCpr.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();var Ce={},rt;function ps(){if(rt)return Ce;rt=1;var d=Gt();return Ce.createRoot=d.createRoot,Ce.hydrateRoot=d.hydrateRoot,Ce}var vs=ps();const xs=Dt(vs),Mt="awaken_spatial_v5",Te={activeScene:"event-horizon",postFX:{bloomMultiplier:1,filmGrain:.024,chromaticAberration:.0018,dynamicResolution:!0},showClockInImmersion:!0,clock24h:!0,brightness:100,wakeLockPreferred:!0,strictNoHud:!1,oledClockOpacity:.3},gs=["fluid-data","volumetric-megacity","event-horizon","carina-nebula","binary-pulsar","saturnian-orbit","deep-void-drift","midnight-cruise","moonlit-shore","oled-void"];function ws(){try{const d=localStorage.getItem(Mt);if(d){const e=JSON.parse(d);return{...Te,...e,activeScene:gs.includes(e.activeScene)?e.activeScene:Te.activeScene,postFX:{...Te.postFX,...e.postFX||{}}}}}catch{}return Te}function bs(d){try{localStorage.setItem(Mt,JSON.stringify(d))}catch{}}const nt=ws();function Q(d){bs({activeScene:d.activeScene,postFX:d.postFX,showClockInImmersion:d.showClockInImmersion,clock24h:d.clock24h,brightness:d.brightness,wakeLockPreferred:d.wakeLockPreferred,strictNoHud:d.strictNoHud,oledClockOpacity:d.oledClockOpacity})}const F=Rt((d,e)=>({...nt,isImmersed:!1,expandingSceneId:null,settingsOpen:!1,audioEnabled:!1,wakeLockStatus:"inactive",noHud:!1,noHudRevealed:!1,telemetry:{fps:60,pixelRatio:Math.min(window.devicePixelRatio||1,2),qualityScale:1,activeInstances:45e3,drawCalls:2,triangles:45e3,geometries:2,textures:0,sceneId:nt.activeScene},setActiveScene:t=>{d({activeScene:t}),Q(e())},launchSceneWithFlip:t=>{d({activeScene:t,expandingSceneId:t,isImmersed:!0,settingsOpen:!1}),Q(e())},setImmersed:t=>d({isImmersed:t,expandingSceneId:t?e().activeScene:null,settingsOpen:t?!1:e().settingsOpen}),toggleImmersed:()=>{const t=!e().isImmersed;d({isImmersed:t,expandingSceneId:t?e().activeScene:null,settingsOpen:t?!1:e().settingsOpen})},setSettingsOpen:t=>d({settingsOpen:t}),setAudioEnabled:t=>d({audioEnabled:t}),setWakeLockStatus:t=>d({wakeLockStatus:t}),setWakeLockPreferred:t=>{d({wakeLockPreferred:t}),Q(e())},updatePostFX:t=>{const a={...e().postFX,...t};d({postFX:a}),Q(e())},setShowClockInImmersion:t=>{d({showClockInImmersion:t}),Q(e())},setClock24h:t=>{d({clock24h:t}),Q(e())},setBrightness:t=>{d({brightness:Math.max(20,Math.min(100,t))}),Q(e())},setTelemetry:t=>d({telemetry:t}),setNoHud:t=>d({noHud:t}),toggleNoHud:()=>d(t=>({noHud:!t.noHud,noHudRevealed:!1})),setNoHudRevealed:t=>d({noHudRevealed:t}),setStrictNoHud:t=>{d({strictNoHud:t}),Q(e())},setOledClockOpacity:t=>{const a=Math.max(.1,Math.min(1,t));d({oledClockOpacity:a}),Q(e())}})),ke=[{id:"carina-nebula",title:"Carina Nebula",subtitle:"Volumetric Deep Space Pillars",category:"DEEP SPACE // VOLUMETRIC",badge:"32K STARS • FBM NOISE",description:"Hypnotic slow drift through glowing interstellar dust clouds rendered via layered volumetric noise shaders (deep indigo, cosmic teal, warm amber gold) and 32,000+ spectral stars.",shaderTech:"Volumetric FBM Slabs • Spectral Twinkle • Soft Alpha",oledProfile:"Deep Interstellar Black • Weightless Drift",accentPrimary:"#2dd4bf",accentSecondary:"#6366f1",accentTertiary:"#f59e0b",bloom:{strength:.92,radius:.65,threshold:.48},exposure:1.06},{id:"binary-pulsar",title:"Binary Pulsar",subtitle:"Relativistic Polar Plasma Jets",category:"ASTROPHYSICS // RELATIVISTIC",badge:"SHOCK JETS • ROCHE STREAM",description:"Rapidly orbiting binary neutron star system projecting luminous relativistic plasma jets from magnetic poles, surrounded by magnetic flux loops and Roche-lobe mass transfer.",shaderTech:"Emissive Plasma Shaders • Helical Jet Beams • Fresnel Limb",oledProfile:"High-Contrast Void • Intense Core Radiance",accentPrimary:"#00f0ff",accentSecondary:"#ec4899",accentTertiary:"#facc15",bloom:{strength:1.2,radius:.68,threshold:.35},exposure:1.08},{id:"saturnian-orbit",title:"Saturnian Orbit",subtitle:"Ringed Gas Giant Eclipsed Horizon",category:"SOLAR SYSTEM // PHOTOREALISTIC",badge:"MUTUAL SHADOWS • CASSINI GAP",description:"Massive procedural gas giant with turbulent banded atmospheric wind shear, blue-gold Rayleigh scattering rim, and dense planetary rings casting crisp mutual shadows with the planet.",shaderTech:"Banded Zonal Shear • Ray-Plane Ring Shadows • Rayleigh Limb",oledProfile:"Eclipsed Nightside #000000 • Milky Way Band",accentPrimary:"#f59e0b",accentSecondary:"#38bdf8",accentTertiary:"#fde68a",bloom:{strength:.78,radius:.54,threshold:.52},exposure:1.04},{id:"event-horizon",title:"Event Horizon",subtitle:"Schwarzschild Gravitational Lensing",category:"SPACE // RAYMARCHED",badge:"GEODESIC SHADER",description:"Photorealistic supermassive black hole integrating curved null geodesics via full-screen fragment raymarching. Bends starlight into Einstein rings around a Doppler-beamed swirling volumetric accretion disk.",shaderTech:"Raymarched Lensing • Doppler Disk • 45K Plasma",oledProfile:"True Event Horizon Black • Orbital Motion",accentPrimary:"#ff6a00",accentSecondary:"#38bdf8",accentTertiary:"#fde047",bloom:{strength:.82,radius:.56,threshold:.62},exposure:.96},{id:"fluid-data",title:"Fluid Data",subtitle:"Bioluminescent Curl-Noise Fiber Optics",category:"ABSTRACT // OLED SAFE",badge:"110K INSTANCES",description:"Divergence-free 3D Simplex curl-noise particle stream on pitch-black OLED obsidian. Shifts smoothly between deep cyan, electric violet, and molten gold with a 10-minute anti-burn-in orbital drift.",shaderTech:"GPU Curl Noise • InstancedMesh • HDR Bloom",oledProfile:"10-Min Lissajous Drift • True #000000",accentPrimary:"#00f0ff",accentSecondary:"#8b5cf6",accentTertiary:"#fbbf24",bloom:{strength:.88,radius:.52,threshold:.58},exposure:1.02},{id:"volumetric-megacity",title:"Volumetric Megacity",subtitle:"Rain-Drenched Neon Drone Descent",category:"CYBERPUNK // HIGH FIDELITY",badge:"PBR WETNESS",description:"High-altitude autonomous drone flight through instanced megastructures with specular rain-wetness PBR maps, randomized emissive windows, neon-absorbing FogExp2, wind-driven rain sheets, and rooftop splash ripples.",shaderTech:"PBR Wetness Maps • FogExp2 • GLSL Rain + Splashes",oledProfile:"Dynamic Camera Pan • ACESFilmic",accentPrimary:"#ff2a85",accentSecondary:"#00f0ff",accentTertiary:"#ff9f1c",bloom:{strength:.76,radius:.52,threshold:.58},exposure:1.04},{id:"deep-void-drift",title:"Deep Void Drift",subtitle:"Empty Space Wanderer",category:"COSMIC // MEDITATIVE",badge:"SPARSE VOID • OLED SAFE",description:"A quiet, meditative drift through vast, mostly empty intergalactic space. Solitary pinpoint stars emerge and fade without popping, punctuated by rare distant galaxies, binary pairs, and red giants.",shaderTech:"Sparse Pinpoints • Distance Fade • FBM Void Dust",oledProfile:"Near-Pitch Black #010205 • True Deep Blacks",accentPrimary:"#a78bfa",accentSecondary:"#38bdf8",accentTertiary:"#f87171",bloom:{strength:.62,radius:.45,threshold:.68},exposure:1.02},{id:"midnight-cruise",title:"Midnight Cruise",subtitle:"Side-View Casual Night Drive",category:"ATMOSPHERIC // LO-FI",badge:"WET ASPHALT • PARALLAX",description:"Relaxing late-night drive viewed from a side-tracking perspective. Minimalist dark GT car with subtle suspension bounce glides past rhythmic sodium and LED streetlights on wet reflective asphalt.",shaderTech:"Wet Road Shaders • Volumetric Headlights • Multi-Layer Parallax",oledProfile:"Night Cruise Silhouette • Deep Midnight Blue",accentPrimary:"#f59e0b",accentSecondary:"#38bdf8",accentTertiary:"#ef4444",bloom:{strength:.85,radius:.58,threshold:.55},exposure:1.04},{id:"moonlit-shore",title:"Moonlit Shore",subtitle:"Crashing Ocean Waves",category:"SEASCAPE // PROCEDURAL",badge:"GERSTNER WAVES • SSS FOAM",description:"Tranquil twilight beach with procedural 8-wave Gerstner ocean swells crashing onto dark sand. Features dynamic wave crest foam, deep-teal subsurface scattering, and shimmering moonlit specular reflections.",shaderTech:"Multi-Wave Gerstner • Analytic Normals • Wet Sand Mask",oledProfile:"Twilight Ocean • Moon Glint Track",accentPrimary:"#38bdf8",accentSecondary:"#2dd4bf",accentTertiary:"#e0f2fe",bloom:{strength:.82,radius:.52,threshold:.52},exposure:1.04},{id:"oled-void",title:"OLED Void",subtitle:"Absolute Zero Resource Mode",category:"OLED CARE // 0% GPU",badge:"0.01% CPU • 0% GPU",description:"Pure pitch-black (#000000) standby display with full WebGL teardown. Digital clock updates strictly once per minute without a per-second loop, shifting across 9 safe zones every 3–5 minutes to eliminate pixel retention.",shaderTech:"Zero WebGL • Pure DOM • Minute-Synced Timer",oledProfile:"9-Zone Translation • True #000000 • Virtual 0% Energy",accentPrimary:"#10b981",accentSecondary:"#059669",accentTertiary:"#34d399",bloom:{strength:0,radius:0,threshold:1},exposure:1,isOledVoid:!0}];function St(d){return ke.find(e=>e.id===d)||ke[0]}const Pt={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class me{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const ys=new Jt(-1,1,1,-1,0,1);class Ms extends J{constructor(){super(),this.setAttribute("position",new st([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new st([0,2,0,0,2,0],2))}}const Ss=new Ms;class We{constructor(e){this._mesh=new S(Ss,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ys)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class At extends me{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof C?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=de.clone(e.uniforms),this.material=new C({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new We(this.material)}render(e,t,a){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=a.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class lt extends me{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,a){const r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let l,n;this.inverse?(l=0,n=1):(l=1,n=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,l,4294967295),i.buffers.stencil.setClear(n),i.buffers.stencil.setLocked(!0),e.setRenderTarget(a),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}}class Ps extends me{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class As{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const a=e.getSize(new T);this._width=a.width,this._height=a.height,t=new xe(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ge}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new At(Pt),this.copyPass.material.blending=_t,this.clock=new gt}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let a=!1;for(let r=0,i=this.passes.length;r<i;r++){const l=this.passes[r];if(l.enabled!==!1){if(l.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),l.render(this.renderer,this.writeBuffer,this.readBuffer,e,a),l.needsSwap){if(a){const n=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(n.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(n.EQUAL,1,4294967295)}this.swapBuffers()}lt!==void 0&&(l instanceof lt?a=!0:l instanceof Ps&&(a=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new T);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const a=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(a,r),this.renderTarget2.setSize(a,r);for(let i=0;i<this.passes.length;i++)this.passes[i].setSize(a,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Cs extends me{constructor(e,t,a=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=a,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new M}render(e,t,a){const r=e.autoClear;e.autoClear=!1;let i,l;this.overrideMaterial!==null&&(l=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:a),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=l),e.autoClear=r}}const Ts={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new M(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class we extends me{constructor(e,t,a,r){super(),this.strength=t!==void 0?t:1,this.radius=a,this.threshold=r,this.resolution=e!==void 0?new T(e.x,e.y):new T(256,256),this.clearColor=new M(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),l=Math.round(this.resolution.y/2);this.renderTargetBright=new xe(i,l,{type:ge}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let m=0;m<this.nMips;m++){const v=new xe(i,l,{type:ge});v.texture.name="UnrealBloomPass.h"+m,v.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(v);const h=new xe(i,l,{type:ge});h.texture.name="UnrealBloomPass.v"+m,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),i=Math.round(i/2),l=Math.round(l/2)}const n=Ts;this.highPassUniforms=de.clone(n.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new C({uniforms:this.highPassUniforms,vertexShader:n.vertexShader,fragmentShader:n.fragmentShader}),this.separableBlurMaterials=[];const c=[3,5,7,9,11];i=Math.round(this.resolution.x/2),l=Math.round(this.resolution.y/2);for(let m=0;m<this.nMips;m++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(c[m])),this.separableBlurMaterials[m].uniforms.invSize.value=new T(1/i,1/l),i=Math.round(i/2),l=Math.round(l/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const u=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=u,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const f=Pt;this.copyUniforms=de.clone(f.uniforms),this.blendMaterial=new C({uniforms:this.copyUniforms,vertexShader:f.vertexShader,fragmentShader:f.fragmentShader,blending:I,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new M,this.oldClearAlpha=1,this.basic=new B,this.fsQuad=new We(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let a=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(a,r);for(let i=0;i<this.nMips;i++)this.renderTargetsHorizontal[i].setSize(a,r),this.renderTargetsVertical[i].setSize(a,r),this.separableBlurMaterials[i].uniforms.invSize.value=new T(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2)}render(e,t,a,r,i){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const l=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),i&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=a.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=a.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let n=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this.fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=n.texture,this.separableBlurMaterials[c].uniforms.direction.value=we.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=we.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this.fsQuad.render(e),n=this.renderTargetsVertical[c];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,i&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(a),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=l}getSeperableBlurMaterial(e){const t=[];for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(e*e))/e);return new C({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new T(.5,.5)},direction:{value:new T(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new C({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}we.BlurDirectionX=new T(1,0);we.BlurDirectionY=new T(0,1);const Ns={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class Gs extends me{constructor(){super();const e=Ns;this.uniforms=de.clone(e.uniforms),this.material=new $t({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new We(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,a){this.uniforms.tDiffuse.value=a.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},es.getTransfer(this._outputColorSpace)===ts&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ss?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===is?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===as?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===wt?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===os?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===rs&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const Ne={defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},Ge={defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},Ue={uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new T(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};class Ds extends me{constructor(e,t){super(),this.edgesRT=new xe(e,t,{depthBuffer:!1,type:ge}),this.edgesRT.texture.name="SMAAPass.edges",this.weightsRT=new xe(e,t,{depthBuffer:!1,type:ge}),this.weightsRT.texture.name="SMAAPass.weights";const a=this,r=new Image;r.src=this.getAreaTexture(),r.onload=function(){a.areaTexture.needsUpdate=!0},this.areaTexture=new it,this.areaTexture.name="SMAAPass.area",this.areaTexture.image=r,this.areaTexture.minFilter=ns,this.areaTexture.generateMipmaps=!1,this.areaTexture.flipY=!1;const i=new Image;i.src=this.getSearchTexture(),i.onload=function(){a.searchTexture.needsUpdate=!0},this.searchTexture=new it,this.searchTexture.name="SMAAPass.search",this.searchTexture.image=i,this.searchTexture.magFilter=at,this.searchTexture.minFilter=at,this.searchTexture.generateMipmaps=!1,this.searchTexture.flipY=!1,this.uniformsEdges=de.clone(Ne.uniforms),this.uniformsEdges.resolution.value.set(1/e,1/t),this.materialEdges=new C({defines:Object.assign({},Ne.defines),uniforms:this.uniformsEdges,vertexShader:Ne.vertexShader,fragmentShader:Ne.fragmentShader}),this.uniformsWeights=de.clone(Ge.uniforms),this.uniformsWeights.resolution.value.set(1/e,1/t),this.uniformsWeights.tDiffuse.value=this.edgesRT.texture,this.uniformsWeights.tArea.value=this.areaTexture,this.uniformsWeights.tSearch.value=this.searchTexture,this.materialWeights=new C({defines:Object.assign({},Ge.defines),uniforms:this.uniformsWeights,vertexShader:Ge.vertexShader,fragmentShader:Ge.fragmentShader}),this.uniformsBlend=de.clone(Ue.uniforms),this.uniformsBlend.resolution.value.set(1/e,1/t),this.uniformsBlend.tDiffuse.value=this.weightsRT.texture,this.materialBlend=new C({uniforms:this.uniformsBlend,vertexShader:Ue.vertexShader,fragmentShader:Ue.fragmentShader}),this.fsQuad=new We(null)}render(e,t,a){this.uniformsEdges.tDiffuse.value=a.texture,this.fsQuad.material=this.materialEdges,e.setRenderTarget(this.edgesRT),this.clear&&e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.materialWeights,e.setRenderTarget(this.weightsRT),this.clear&&e.clear(),this.fsQuad.render(e),this.uniformsBlend.tColor.value=a.texture,this.fsQuad.material=this.materialBlend,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this.fsQuad.render(e))}setSize(e,t){this.edgesRT.setSize(e,t),this.weightsRT.setSize(e,t),this.materialEdges.uniforms.resolution.value.set(1/e,1/t),this.materialWeights.uniforms.resolution.value.set(1/e,1/t),this.materialBlend.uniforms.resolution.value.set(1/e,1/t)}getAreaTexture(){return"data:image/png;base64,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"}getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}dispose(){this.edgesRT.dispose(),this.weightsRT.dispose(),this.areaTexture.dispose(),this.searchTexture.dispose(),this.materialEdges.dispose(),this.materialWeights.dispose(),this.materialBlend.dispose(),this.fsQuad.dispose()}}const Rs={name:"CinematicPostShader",uniforms:{tDiffuse:{value:null},uTime:{value:0},uAberration:{value:.0018},uGrainAmount:{value:.026},uVignette:{value:.28}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGrainAmount;
    uniform float uVignette;

    varying vec2 vUv;

    // Fast high-frequency temporal film grain hash
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float distSq = dot(centered, centered);

      // Radial optical chromatic aberration (zero at screen center, subtle at edges)
      vec2 offset = centered * distSq * uAberration * 4.5;

      float r = texture2D(tDiffuse, clamp(vUv + offset, 0.0, 1.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, clamp(vUv - offset, 0.0, 1.0)).b;

      vec3 color = vec3(r, g, b);

      // Subtle optical vignette
      float vig = smoothstep(0.92, 0.22, distSq * (1.0 + uVignette));
      color *= mix(1.0, vig, uVignette);

      // Shadow-preserving temporal film grain (keeps pure OLED black untouched)
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      float grainMask = smoothstep(0.008, 0.18, luma);
      float noise = hash12(gl_FragCoord.xy + fract(uTime * 17.31) * 512.0) - 0.5;
      color += noise * uGrainAmount * grainMask;

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }
  `},ce=11e4,zs=`
  attribute vec4 aSeed;     // xyz: base flow coordinate, w: personal phase
  attribute vec2 aStream;   // x: filament band [0..1], y: scale jitter

  uniform float uTime;
  uniform vec2 uOledDrift;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vIntensity;
  varying float vDepth;

  // --- Ashima 3D Simplex Noise ---
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Divergence-free 3D Curl Noise via finite differences on 3 offset potential fields
  vec3 curlNoise(vec3 p) {
    const float e = 0.08;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    float p_x0 = snoise(p - dx);
    float p_x1 = snoise(p + dx);
    float p_y0 = snoise(p - dy);
    float p_y1 = snoise(p + dy);
    float p_z0 = snoise(p - dz);
    float p_z1 = snoise(p + dz);

    float x = p_y1 - p_y0 - p_z1 + p_z0;
    float y = p_z1 - p_z0 - p_x1 + p_x0;
    float z = p_x1 - p_x0 - p_y1 + p_y0;

    return normalize(vec3(x, y, z) + 1e-5);
  }

  void main() {
    float slowT = uTime * 0.16;
    float phase = aSeed.w;

    // Base fiber-optic ribbon flow along helical torus-manifold
    float angle = aSeed.x + slowT * (0.45 + aStream.x * 0.35);
    float ringR = 5.4 + aSeed.y * 2.8 + sin(angle * 2.0 + slowT) * 0.9;
    float tubeAngle = aSeed.z + slowT * 0.7 + aStream.x * 6.28318;
    float tubeR = 1.65 + sin(phase * 6.28318 + slowT * 1.4) * 0.9;

    vec3 basePos = vec3(
      (ringR + tubeR * cos(tubeAngle)) * cos(angle),
      tubeR * sin(tubeAngle) * 1.35 + sin(angle * 3.0 - slowT) * 1.1,
      (ringR + tubeR * cos(tubeAngle)) * sin(angle)
    );

    // Advect along GPU 3D Curl Noise field for organic bioluminescent fluid streams
    vec3 flowSample = basePos * 0.22 + vec3(slowT * 0.45, -slowT * 0.3, slowT * 0.25);
    vec3 curl1 = curlNoise(flowSample);
    vec3 curl2 = curlNoise(flowSample * 1.85 + vec3(11.3, 4.7, -7.1) - slowT * 0.35);

    vec3 displaced = basePos + curl1 * 2.45 + curl2 * 1.05;

    // Gentle magnetic repulsion/attraction around user pointer
    vec3 pointerWorld = vec3(uPointer.x * 9.0, uPointer.y * 5.0, 2.0);
    vec3 toPtr = displaced - pointerWorld;
    float ptrDist = length(toPtr);
    displaced += normalize(toPtr + 1e-4) * exp(-ptrDist * 0.28) * 1.45;

    // 10-minute OLED Burn-In Prevention Orbital Drift
    displaced.xy += uOledDrift;

    // Fiber-optic pulse travelling along stream filaments
    float pulse = 0.5 + 0.5 * sin(phase * 18.0 - uTime * 1.65 + aStream.x * 12.0);
    float sparkle = pow(pulse, 4.0);

    // Scale instanced micro-sphere subtly with fluid pulse
    float particleScale = (0.45 + aStream.y * 0.72) * (0.72 + sparkle * 0.85);

    // Color ramp: Deep Cyan -> Electric Violet -> Molten Gold
    vec3 deepCyan = vec3(0.0, 0.88, 1.0);
    vec3 electricViolet = vec3(0.56, 0.16, 1.0);
    vec3 moltenGold = vec3(1.0, 0.68, 0.1);

    float colorWave = fract(aStream.x + uTime * 0.032 + dot(curl1, vec3(0.25, 0.35, 0.2)) * 0.45);
    vec3 col;
    if (colorWave < 0.42) {
      col = mix(deepCyan, electricViolet, smoothstep(0.0, 0.42, colorWave));
    } else if (colorWave < 0.78) {
      col = mix(electricViolet, moltenGold, smoothstep(0.42, 0.78, colorWave));
    } else {
      col = mix(moltenGold, deepCyan, smoothstep(0.78, 1.0, colorWave));
    }

    // Localized HDR bloom boost strictly on energetic fiber crests (prevents whiteout)
    float hdrGain = 0.38 + sparkle * 1.45;
    vColor = col * hdrGain;
    vIntensity = hdrGain;

    vec3 transformed = position * particleScale + displaced;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`,Es=`
  varying vec3 vColor;
  varying float vIntensity;
  varying float vDepth;
  varying float vDepth;

  void main() {
    float fogFactor = smoothstep(36.0, 10.0, vDepth);
    vec3 finalCol = vColor * fogFactor;
    gl_FragColor = vec4(finalCol, 1.0);
  }
`;class ct{constructor(){o(this,"id","fluid-data");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.88,radius:.52,threshold:.58});o(this,"exposure",1.02);o(this,"mesh",null);o(this,"geometry",null);o(this,"material",null);o(this,"activeCount",ce);o(this,"smoothPointer",new T);this.scene=new X,this.scene.background=new M(0),this.camera=new q(50,window.innerWidth/window.innerHeight,.1,120),this.camera.position.set(0,1.2,17.5)}init(e){const t=new ls(.022,0);this.geometry=t;const a=new Float32Array(ce*4),r=new Float32Array(ce*2),i=24;for(let n=0;n<ce;n++){const c=n%i/i,u=Math.random()*Math.PI*2,f=(Math.random()-.5)*1.4,m=c*Math.PI*2+(Math.random()-.5)*.45;a[n*4+0]=u,a[n*4+1]=f,a[n*4+2]=m,a[n*4+3]=Math.random(),r[n*2+0]=c,r[n*2+1]=Math.random()}this.geometry.setAttribute("aSeed",new he(a,4)),this.geometry.setAttribute("aStream",new he(r,2)),this.material=new C({vertexShader:zs,fragmentShader:Es,uniforms:{uTime:{value:0},uOledDrift:{value:new T(0,0)},uPointer:{value:new T(0,0)}},transparent:!1,depthWrite:!0,blending:cs}),this.mesh=new ve(this.geometry,this.material,ce),this.mesh.frustumCulled=!1;const l=new bt;for(let n=0;n<ce;n++)this.mesh.setMatrixAt(n,l);this.mesh.instanceMatrix.needsUpdate=!0,this.scene.add(this.mesh)}update(e,t,a){if(!this.material)return;this.smoothPointer.lerp(a,Math.min(1,e*3.5));const r=t/600*Math.PI*2,i=Math.sin(r)*3.4,l=Math.cos(r*1.333)*1.8;this.material.uniforms.uTime.value=t,this.material.uniforms.uOledDrift.value.set(i,l),this.material.uniforms.uPointer.value.copy(this.smoothPointer);const n=t*.042,c=Math.sin(n)*3.8+Math.sin(t*.083+1.4)*.95+this.smoothPointer.x*2.2,u=Math.cos(n*.7)*1.8+Math.sin(t*.061+2.7)*.85+this.smoothPointer.y*1.5,f=16.8+Math.sin(t*.078)*1.4+Math.cos(t*.035)*.8;this.camera.position.set(c,u,f),this.camera.lookAt(i*.35,l*.35,0),this.camera.rotation.z=Math.sin(t*.027)*.025}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){const t=Math.max(.32,Math.min(1,e));this.activeCount=Math.floor(ce*t),this.mesh&&(this.mesh.count=this.activeCount)}getActiveInstanceCount(){return this.activeCount}dispose(){this.mesh&&(this.scene.remove(this.mesh),this.mesh.dispose(),this.mesh=null),this.geometry&&(this.geometry.dispose(),this.geometry=null),this.material&&(this.material.dispose(),this.material=null),this.scene.clear()}}const Ve=820,Xe=260,qe=340,_=18e3,$=1400,ye=420,Ls=`
  attribute vec3 aOffset;
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uWind;

  varying float vAlpha;

  void main() {
    vec3 boxSize = vec3(110.0, 95.0, 140.0);

    // Advect raindrop downward and along wind vector
    vec3 pos = aOffset;
    pos.y -= uTime * (42.0 + aSpeed * 24.0);
    pos.x += uWind.x * uTime * 16.0;
    pos.z += uWind.z * uTime * 16.0;

    // Wrap continuously inside a moving volume locked to the drone camera
    vec3 rel = mod(pos - uCamPos + boxSize * 0.5, boxSize) - boxSize * 0.5;
    vec3 worldPos = uCamPos + rel;

    // Stretch streak along velocity vector (rain + wind slant)
    vec3 velDir = normalize(vec3(uWind.x * 16.0, -(42.0 + aSpeed * 24.0), uWind.z * 16.0));
    float streakLen = 1.6 + aSpeed * 1.4;
    // position.y is -0.5..0.5 along line quad
    vec3 finalPos = worldPos + velDir * (position.y * streakLen) + vec3(position.x * 0.045, 0.0, 0.0);

    float dist = length(rel);
    vAlpha = smoothstep(75.0, 12.0, dist) * (0.28 + 0.35 * sin(aPhase * 6.28318 + uTime * 4.0) * 0.5 + 0.25);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`,js=`
  uniform vec3 uRainTint;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uRainTint, vAlpha);
  }
`,Fs=`
  attribute vec3 aSplashPos;
  attribute float aSplashSeed;

  uniform float uTime;

  varying vec2 vUv;
  varying float vLife;

  void main() {
    vUv = uv;
    float cycle = fract(uTime * (1.25 + fract(aSplashSeed * 13.7) * 0.9) + aSplashSeed);
    vLife = cycle;

    float radius = 0.25 + cycle * 1.65;
    vec3 local = vec3(position.x * radius, 0.0, position.z * radius);
    vec3 worldPos = aSplashPos + local;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`,Os=`
  varying vec2 vUv;
  varying float vLife;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    // Crisp expanding circular water ripple ring
    float ring = smoothstep(0.08, 0.0, abs(d - vLife * 0.85));
    float alpha = ring * (1.0 - vLife) * 0.72;
    if (alpha < 0.01) discard;
    vec3 col = mix(vec3(0.45, 0.92, 1.0), vec3(0.95, 0.45, 0.85), vLife);
    gl_FragColor = vec4(col * 1.4, alpha);
  }
`,ks=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ws=`
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float radial = exp(-dot(p, p) * 2.4);
    float shimmer = 0.82 + 0.18 * sin(uTime * 0.7 + uSeed * 6.2831 + vUv.y * 4.0);
    float alpha = radial * 0.16 * shimmer;
    gl_FragColor = vec4(uColor, alpha);
  }
`;function Bs(){const e=document.createElement("canvas");e.width=512,e.height=512;const t=e.getContext("2d");t.fillStyle="#0c101b",t.fillRect(0,0,512,512);for(let h=0;h<512;h+=16)t.fillStyle=h%64===0?"#182032":"#101624",t.fillRect(0,h,512,2);for(let h=0;h<512;h+=24)t.fillStyle="#151c2c",t.fillRect(h,0,2,512);const a=document.createElement("canvas");a.width=512,a.height=512;const r=a.getContext("2d");r.fillStyle="#686868",r.fillRect(0,0,512,512);for(let h=0;h<160;h++){const p=Math.random()*512,w=2+Math.random()*14,b=r.createLinearGradient(p,0,p,512);b.addColorStop(0,"rgba(18, 18, 18, 0.85)"),b.addColorStop(.5,"rgba(32, 32, 32, 0.7)"),b.addColorStop(1,"rgba(12, 12, 12, 0.92)"),r.fillStyle=b,r.fillRect(p,0,w,512)}const i=document.createElement("canvas");i.width=512,i.height=512;const l=i.getContext("2d");l.fillStyle="#000000",l.fillRect(0,0,512,512);const n=["#00f0ff","#38bdf8","#ff2a85","#ff9f1c","#fde68a","#a855f7"],c=32,u=16,f=512/u,m=512/c;for(let h=0;h<c;h++){const p=h%9===0&&Math.random()>.35,w=Math.random()>.45?"#00f0ff":"#ff2a85";for(let b=0;b<u;b++){if(p){l.fillStyle=w,l.fillRect(b*f+2,h*m+5,f-4,m-10);continue}if(Math.random()<.34){const x=n[Math.floor(Math.random()*n.length)];l.fillStyle=x,l.globalAlpha=.45+Math.random()*.55,l.fillRect(b*f+4,h*m+4,f-8,m-8)}}}l.globalAlpha=1;const v=(h,p)=>{const w=new ds(h);return w.wrapS=ot,w.wrapT=ot,w.repeat.set(1,3),w.anisotropy=8,p&&(w.colorSpace=yt),w.needsUpdate=!0,w};return{albedoMap:v(e,!0),roughnessMap:v(a,!1),emissiveMap:v(i,!0)}}class Hs{constructor(){o(this,"id","volumetric-megacity");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.76,radius:.52,threshold:.58});o(this,"exposure",1.04);o(this,"buildingsMesh",null);o(this,"neonSignsMesh",null);o(this,"trafficMesh",null);o(this,"rainMesh",null);o(this,"splashMesh",null);o(this,"hazePlanes",[]);o(this,"groundMesh",null);o(this,"buildingData",[]);o(this,"trafficData",[]);o(this,"disposableTextures",[]);o(this,"disposableGeometries",[]);o(this,"disposableMaterials",[]);o(this,"rainMaterial",null);o(this,"splashMaterial",null);o(this,"droneLights",[]);o(this,"dummy",new hs);o(this,"smoothPointer",new T);o(this,"qualityScale",1);o(this,"fogColorBase",new M(396058));o(this,"fogColorPulse",new M(1247268));this.scene=new X,this.scene.background=new M(329748),this.scene.fog=new Fe(396058,.0082),this.camera=new q(62,window.innerWidth/window.innerHeight,.5,420),this.camera.position.set(0,42,0)}init(e){const t=new _e(3718648,1968429,.65);this.scene.add(t);const a=new $e(8246268,.95);a.position.set(60,120,40),this.scene.add(a);const r=new He(61695,220,140,1.5),i=new He(16722565,210,140,1.5),l=new He(16752412,160,120,1.5);this.droneLights.push(r,i,l),this.scene.add(r,i,l);const{albedoMap:n,roughnessMap:c,emissiveMap:u}=Bs();this.disposableTextures.push(n,c,u);const f=new H(520,520),m=new oe({color:329486,roughness:.14,metalness:.78});this.disposableGeometries.push(f),this.disposableMaterials.push(m),this.groundMesh=new S(f,m),this.groundMesh.rotation.x=-Math.PI/2,this.groundMesh.position.y=0,this.scene.add(this.groundMesh);const v=new W(1,1,1);v.translate(0,.5,0),this.disposableGeometries.push(v);const h=new oe({map:n,roughnessMap:c,roughness:.32,metalness:.72,emissive:new M(16777215),emissiveMap:u,emissiveIntensity:1.55});this.disposableMaterials.push(h),this.buildingsMesh=new ve(v,h,Ve);const p=new M;for(let g=0;g<Ve;g++){const z=g%2===0?1:-1,V=17+Math.pow(Math.random(),1.35)*145,fe=z*V,pe=(Math.random()-.5)*ye,le=8+Math.random()*14,Se=8+Math.random()*14,Ct=Math.max(.25,1-V/165),Be=24+Math.random()*98*(.45+Ct*.85);this.buildingData.push({x:fe,z:pe,width:le,depth:Se,height:Be,hasSpire:Be>75}),this.dummy.position.set(fe,0,pe),this.dummy.scale.set(le,Be,Se),this.dummy.rotation.set(0,0,0),this.dummy.updateMatrix(),this.buildingsMesh.setMatrixAt(g,this.dummy.matrix),p.setHSL(.58+Math.random()*.14,.25,.62+Math.random()*.38),this.buildingsMesh.setColorAt(g,p)}this.buildingsMesh.instanceMatrix.needsUpdate=!0,this.buildingsMesh.instanceColor&&(this.buildingsMesh.instanceColor.needsUpdate=!0),this.scene.add(this.buildingsMesh);const w=new W(1,1,.35),b=new B({color:16777215,toneMapped:!1});this.disposableGeometries.push(w),this.disposableMaterials.push(b),this.neonSignsMesh=new ve(w,b,Xe);const x=[new M(61695).multiplyScalar(2.4),new M(16722565).multiplyScalar(2.4),new M(11032055).multiplyScalar(2.2),new M(16752412).multiplyScalar(2.2)];for(let g=0;g<Xe;g++){const z=this.buildingData[g%this.buildingData.length],V=z.x>0?-1:1,fe=z.x+V*(z.width*.5+.4),pe=Math.max(14,z.height*(.45+Math.random()*.5)),le=Math.random()>.45;this.dummy.position.set(fe,pe,z.z),this.dummy.rotation.set(0,Math.PI/2,0),this.dummy.scale.set(le?1.8:z.depth*.72,le?14+Math.random()*18:2.2+Math.random()*2.5,1),this.dummy.updateMatrix(),this.neonSignsMesh.setMatrixAt(g,this.dummy.matrix),this.neonSignsMesh.setColorAt(g,x[g%x.length])}this.neonSignsMesh.instanceMatrix.needsUpdate=!0,this.neonSignsMesh.instanceColor&&(this.neonSignsMesh.instanceColor.needsUpdate=!0),this.scene.add(this.neonSignsMesh);const G=new W(.45,.25,1),D=new B({color:16777215,toneMapped:!1});this.disposableGeometries.push(G),this.disposableMaterials.push(D),this.trafficMesh=new ve(G,D,qe);const j=new M(61695).multiplyScalar(3),k=new M(16719437).multiplyScalar(3);for(let g=0;g<qe;g++){const z=g%2===0,V=(z?-1:1)*(3+Math.random()*11),fe=14+Math.random()*68,pe=(Math.random()-.5)*ye,le=(z?-1:1)*(24+Math.random()*32),Se=2.8+Math.random()*5.2;this.trafficData.push({x:V,y:fe,z:pe,speed:le,length:Se,isCyan:z}),this.trafficMesh.setColorAt(g,z?j:k)}this.trafficMesh.instanceColor&&(this.trafficMesh.instanceColor.needsUpdate=!0),this.scene.add(this.trafficMesh);const R=new H(68,68);this.disposableGeometries.push(R);const y=[58879,16722565,8141549,16752412];for(let g=0;g<14;g++){const z=new C({vertexShader:ks,fragmentShader:Ws,uniforms:{uColor:{value:new M(y[g%y.length])},uTime:{value:0},uSeed:{value:Math.random()}},transparent:!0,depthWrite:!1,blending:I,side:ue});this.disposableMaterials.push(z);const V=new S(R,z);V.position.set((g%2===0?-1:1)*(12+Math.random()*28),22+Math.random()*44,-20-g*24),this.hazePlanes.push(V),this.scene.add(V)}const O=new H(1,1);this.disposableGeometries.push(O);const Y=new Float32Array(_*3),U=new Float32Array(_),E=new Float32Array(_);for(let g=0;g<_;g++)Y[g*3+0]=(Math.random()-.5)*110,Y[g*3+1]=Math.random()*95,Y[g*3+2]=(Math.random()-.5)*140,U[g]=Math.random(),E[g]=Math.random();O.setAttribute("aOffset",new he(Y,3)),O.setAttribute("aSpeed",new he(U,1)),O.setAttribute("aPhase",new he(E,1)),this.rainMaterial=new C({vertexShader:Ls,fragmentShader:js,uniforms:{uTime:{value:0},uCamPos:{value:new N},uWind:{value:new N(.35,0,-.15)},uRainTint:{value:new M(10217471)}},transparent:!0,depthWrite:!1,blending:I,side:ue}),this.disposableMaterials.push(this.rainMaterial),this.rainMesh=new ve(O,this.rainMaterial,_),this.rainMesh.frustumCulled=!1;const K=new bt;for(let g=0;g<_;g++)this.rainMesh.setMatrixAt(g,K);this.rainMesh.instanceMatrix.needsUpdate=!0,this.scene.add(this.rainMesh);const be=new H(1,1);be.rotateX(-Math.PI/2),this.disposableGeometries.push(be);const ne=new Float32Array($*3),tt=new Float32Array($);for(let g=0;g<$;g++){if(g<$*.72){const z=this.buildingData[g%this.buildingData.length];ne[g*3+0]=z.x+(Math.random()-.5)*z.width*.85,ne[g*3+1]=z.height+.08,ne[g*3+2]=z.z+(Math.random()-.5)*z.depth*.85}else ne[g*3+0]=(Math.random()-.5)*32,ne[g*3+1]=.08,ne[g*3+2]=(Math.random()-.5)*ye;tt[g]=Math.random()}be.setAttribute("aSplashPos",new he(ne,3)),be.setAttribute("aSplashSeed",new he(tt,1)),this.splashMaterial=new C({vertexShader:Fs,fragmentShader:Os,uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:I,side:ue}),this.disposableMaterials.push(this.splashMaterial),this.splashMesh=new ve(be,this.splashMaterial,$),this.splashMesh.frustumCulled=!1;for(let g=0;g<$;g++)this.splashMesh.setMatrixAt(g,K);this.splashMesh.instanceMatrix.needsUpdate=!0,this.scene.add(this.splashMesh)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*3));const r=-(t*16.5%(ye*.5)),i=Math.sin(t*.24)*5.2+Math.sin(t*.53+1.1)*1.8+this.smoothPointer.x*6,l=44+Math.sin(t*.35)*6.5+Math.cos(t*.17+2.3)*2.2+this.smoothPointer.y*5;if(this.camera.position.set(i,l,r+80),this.camera.lookAt(i*.45+Math.sin(t*.18)*3.5+Math.cos(t*.08)*1.5,l-6.5+Math.sin(t*.12)*1.2,r-45),this.camera.rotation.z+=-Math.cos(t*.24)*.055+Math.sin(t*.61)*.008-this.smoothPointer.x*.06,this.groundMesh&&(this.groundMesh.position.z=this.camera.position.z-80),this.droneLights.length>=3&&(this.droneLights[0].position.set(i-24,l-8,this.camera.position.z-45),this.droneLights[1].position.set(i+26,l+4,this.camera.position.z-75),this.droneLights[2].position.set(i,l-22,this.camera.position.z-110)),this.scene.fog instanceof Fe){const n=.5+.5*Math.sin(t*.22);this.scene.fog.color.copy(this.fogColorBase).lerp(this.fogColorPulse,n*.6)}for(const n of this.hazePlanes){const c=n.material;c.uniforms.uTime.value=t,n.lookAt(this.camera.position),n.position.z>this.camera.position.z+30?n.position.z-=336:n.position.z<this.camera.position.z-310&&(n.position.z+=336)}if(this.trafficMesh){const n=ye*.5;for(let c=0;c<this.trafficData.length;c++){const u=this.trafficData[c];u.z+=u.speed*e,u.z>n&&(u.z=-n),u.z<-n&&(u.z=n),this.dummy.position.set(u.x,u.y,u.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(1,1,u.length),this.dummy.updateMatrix(),this.trafficMesh.setMatrixAt(c,this.dummy.matrix)}this.trafficMesh.instanceMatrix.needsUpdate=!0}this.rainMaterial&&(this.rainMaterial.uniforms.uTime.value=t,this.rainMaterial.uniforms.uCamPos.value.copy(this.camera.position),this.rainMaterial.uniforms.uWind.value.set(.35+Math.sin(t*.4)*.28,0,-.18+Math.cos(t*.3)*.14)),this.splashMaterial&&(this.splashMaterial.uniforms.uTime.value=t)}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){this.qualityScale=Math.max(.35,Math.min(1,e)),this.rainMesh&&(this.rainMesh.count=Math.floor(_*this.qualityScale)),this.splashMesh&&(this.splashMesh.count=Math.floor($*this.qualityScale))}getActiveInstanceCount(){return Ve+Xe+qe+Math.floor((_+$)*this.qualityScale)}dispose(){[this.buildingsMesh,this.neonSignsMesh,this.trafficMesh,this.rainMesh,this.splashMesh].forEach(e=>{e&&(this.scene.remove(e),e.dispose())}),this.hazePlanes.forEach(e=>this.scene.remove(e)),this.hazePlanes=[],this.groundMesh&&(this.scene.remove(this.groundMesh),this.groundMesh=null),this.disposableGeometries.forEach(e=>e.dispose()),this.disposableMaterials.forEach(e=>e.dispose()),this.disposableTextures.forEach(e=>e.dispose()),this.disposableGeometries=[],this.disposableMaterials=[],this.disposableTextures=[],this.buildingData=[],this.trafficData=[],this.droneLights=[],this.buildingsMesh=null,this.neonSignsMesh=null,this.trafficMesh=null,this.rainMesh=null,this.splashMesh=null,this.rainMaterial=null,this.splashMaterial=null,this.scene.clear()}}const ee=45e3,Is=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`,Us=`
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamForward;
  uniform float uTanHalfFov;
  uniform int uRaySteps;

  varying vec2 vUv;

  // --- Fast Procedural Hash & Value Noise for Plasma & Starfield ---
  float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);

    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 4; i++) {
      val += amp * noise3D(p);
      p = p * 2.07 + vec3(13.1, 7.4, -9.2);
      amp *= 0.5;
    }
    return val;
  }

  // Deep space procedural starfield & faint cosmic dust nebula (gravitationally lensed)
  vec3 sampleDeepSpace(vec3 dir) {
    vec3 col = vec3(0.0);

    // Subtle cosmic dust nebula band
    float neb = fbm(dir * 3.5 + vec3(0.0, 1.2, 0.0));
    float galacticPlane = exp(-abs(dir.y * 2.8 + dir.x * 0.6) * 2.6);
    vec3 nebColor = mix(vec3(0.02, 0.05, 0.14), vec3(0.14, 0.04, 0.22), neb);
    col += nebColor * galacticPlane * neb * 0.45;

    // Multi-scale crisp lensed stars
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 115.0 : 210.0;
      vec3 cell = floor(dir * scale);
      vec3 local = fract(dir * scale) - 0.5;
      float rnd = hash31(cell);
      if (rnd > 0.965) {
        vec3 starOffset = vec3(hash31(cell + 1.1), hash31(cell + 2.3), hash31(cell + 3.7)) - 0.5;
        float d = length(local - starOffset * 0.55);
        float bright = smoothstep(0.14, 0.0, d) * (rnd - 0.965) * 42.0;
        // Spectral star temperatures (blue O-type -> white -> warm amber K-type)
        vec3 starHue = mix(vec3(0.65, 0.85, 1.0), vec3(1.0, 0.78, 0.52), hash31(cell + 7.9));
        col += starHue * bright * (layer == 0 ? 1.1 : 0.65);
      }
    }

    return col;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 ndc = vUv * 2.0 - 1.0;

    // Reconstruct exact world-space camera ray matching Three.js PerspectiveCamera
    vec3 rayDir = normalize(
      uCamForward +
      uCamRight * (ndc.x * aspect * uTanHalfFov) +
      uCamUp * (ndc.y * uTanHalfFov)
    );

    vec3 pos = uCamPos;
    vec3 dir = rayDir;

    // Schwarzschild radius & accretion disk bounds
    const float RS = 1.65;
    const float DISK_INNER = 2.45;
    const float DISK_OUTER = 9.4;

    // Angular momentum squared for exact general-relativistic geodesic bending
    vec3 hVec = cross(pos, dir);
    float h2 = dot(hVec, hVec);

    vec3 accumGlow = vec3(0.0);
    float transmittance = 1.0;
    bool captured = false;

    for (int i = 0; i < 128; i++) {
      if (i >= uRaySteps) break;

      float r = length(pos);
      if (r < RS) {
        captured = true;
        break;
      }
      if (r > 32.0) {
        break;
      }

      // Adaptive step size: fine near photon sphere, coarser in far field
      float dt = clamp(r * 0.085, 0.045, 0.55);

      // General-relativistic null geodesic bending: a = -1.5 * RS * h^2 * pos / r^5
      float r2 = r * r;
      float r5 = r2 * r2 * r;
      vec3 accel = -1.5 * RS * h2 * pos / max(r5, 0.001);

      vec3 nextDir = normalize(dir + accel * dt);
      vec3 nextPos = pos + nextDir * dt;

      // Photon sphere delicate incandescent halo (r ~ 1.5 * RS)
      float photonDist = abs(r - RS * 1.48);
      float photonRing = exp(-photonDist * 8.5) * 0.042 * dt;
      accumGlow += vec3(0.85, 0.92, 1.0) * photonRing * transmittance;

      // Volumetric Accretion Disk slab intersection / proximity sampling
      float diskHeight = 0.24 + (r - DISK_INNER) * 0.045;
      if (abs(pos.y) < diskHeight * 2.4 && r > DISK_INNER * 0.85 && r < DISK_OUTER) {
        float verticalDensity = exp(-(pos.y * pos.y) / max(diskHeight * diskHeight * 0.32, 0.002));
        float radialIn = smoothstep(DISK_INNER, DISK_INNER + 0.85, r);
        float radialOut = smoothstep(DISK_OUTER, DISK_INNER + 1.8, r);
        float radialMask = radialIn * radialOut;

        if (radialMask * verticalDensity > 0.002) {
          // Differential Keplerian swirling plasma coordinates
          float angle = atan(pos.z, pos.x);
          float keplerOmega = 2.6 / pow(max(r, 1.0), 1.35);
          float spiralAngle = angle + uTime * keplerOmega + 4.8 / max(r, 1.0);

          vec3 sampleCoord = vec3(
            cos(spiralAngle) * r * 0.65,
            pos.y * 2.5,
            sin(spiralAngle) * r * 0.65
          );

          float plasma = fbm(sampleCoord * 1.15 - vec3(0.0, 0.0, uTime * 0.25));
          float filaments = smoothstep(0.24, 0.86, plasma);

          // Relativistic Doppler Beaming: approaching side is hotter/bluer & brighter
          vec3 tangent = normalize(vec3(-pos.z, 0.0, pos.x));
          float doppler = dot(tangent, -rayDir); // >0 approaching camera, <0 receding
          float beaming = pow(clamp(1.0 + doppler * 0.55, 0.38, 1.95), 2.1);

          // Heated plasma temperature palette: deep crimson -> blazing orange -> gold -> relativistic cyan-blue
          float heat = clamp((1.0 - (r - DISK_INNER) / (DISK_OUTER - DISK_INNER)) * 1.15 + doppler * 0.35 + filaments * 0.25, 0.0, 1.0);

          vec3 coolCrimson = vec3(0.68, 0.12, 0.02);
          vec3 blazingOrange = vec3(1.0, 0.42, 0.04);
          vec3 hotGold = vec3(1.0, 0.84, 0.48);
          vec3 relativisticBlue = vec3(0.45, 0.82, 1.0);

          vec3 diskColor = mix(coolCrimson, blazingOrange, smoothstep(0.0, 0.42, heat));
          diskColor = mix(diskColor, hotGold, smoothstep(0.42, 0.76, heat));
          diskColor = mix(diskColor, relativisticBlue, smoothstep(0.74, 1.0, heat) * (0.45 + max(doppler, 0.0) * 0.65));

          float density = verticalDensity * radialMask * (0.35 + filaments * 1.35) * dt * 1.32;
          accumGlow += diskColor * density * beaming * transmittance * 1.55;
          transmittance *= exp(-density * 0.72);
        }
      }

      pos = nextPos;
      dir = nextDir;

      if (transmittance < 0.02) break;
    }

    vec3 finalColor = accumGlow;
    if (!captured) {
      // Escaped ray samples gravitationally lensed starfield & Einstein ring
      finalColor += sampleDeepSpace(dir) * transmittance;
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`,Vs=`
  attribute float aRadius;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aSeed;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Fast Keplerian orbital rotation around the singularity
    float omega = 1.65 / pow(max(aRadius, 1.5), 1.45);
    float currentAngle = aAngle + uTime * omega;

    // Subtle vertical plasma wave turbulence
    float y = aHeight * (0.55 + 0.45 * sin(currentAngle * 3.0 + uTime * 1.2 + aSeed * 6.2831));
    vec3 worldPos = vec3(
      cos(currentAngle) * aRadius,
      y,
      sin(currentAngle) * aRadius
    );

    // Relativistic Doppler shift relative to viewer
    vec3 tangent = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
    vec3 toCam = normalize(cameraPosition - worldPos);
    float doppler = dot(tangent, toCam);

    float heat = clamp(1.0 - (aRadius - 2.5) / 7.8, 0.0, 1.0);

    vec3 fieryOrange = vec3(1.0, 0.38, 0.04);
    vec3 moltenGold = vec3(1.0, 0.82, 0.36);
    vec3 ionizedBlue = vec3(0.32, 0.78, 1.0);

    vec3 col = mix(fieryOrange, moltenGold, smoothstep(0.1, 0.72, heat));
    col = mix(col, ionizedBlue, smoothstep(0.55, 1.0, heat) * clamp(0.35 + doppler * 0.75, 0.0, 1.0));

    float boost = 0.85 + max(doppler, -0.3) * 0.75;
    vColor = col * boost;

    // Occlude particles that pass behind the event horizon shadow sphere
    vec3 camToHole = -cameraPosition;
    float camDist = length(camToHole);
    vec3 viewDir = normalize(worldPos - cameraPosition);
    float proj = dot(camToHole, viewDir);
    float perpDist = length(camToHole - viewDir * proj);
    float behindHole = step(camDist, length(worldPos - cameraPosition));
    float shadowMask = 1.0 - behindHole * smoothstep(2.55, 2.05, perpDist);

    vAlpha = (0.28 + 0.45 * aSeed) * smoothstep(10.8, 7.2, aRadius) * smoothstep(2.3, 2.9, aRadius) * shadowMask;

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((16.0 + aSeed * 18.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.0, 5.5);
  }
`,Xs=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float d = dot(c, c);
    if (d > 1.0) discard;
    float soft = exp(-d * 3.4);
    gl_FragColor = vec4(vColor, soft * vAlpha);
  }
`;class qs{constructor(){o(this,"id","event-horizon");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.82,radius:.56,threshold:.62});o(this,"exposure",.96);o(this,"raymarchQuad",null);o(this,"raymarchGeo",null);o(this,"raymarchMat",null);o(this,"diskPoints",null);o(this,"diskGeo",null);o(this,"diskMat",null);o(this,"smoothPointer",new T);o(this,"activeParticleCount",ee);o(this,"camRight",new N);o(this,"camUp",new N);o(this,"camForward",new N);this.scene=new X,this.scene.background=new M(0),this.camera=new q(48,window.innerWidth/window.innerHeight,.1,100),this.camera.position.set(0,2.8,13.8)}init(e){this.raymarchGeo=new H(2,2),this.raymarchMat=new C({vertexShader:Is,fragmentShader:Us,uniforms:{uTime:{value:0},uResolution:{value:new T(window.innerWidth,window.innerHeight)},uCamPos:{value:new N},uCamRight:{value:new N(1,0,0)},uCamUp:{value:new N(0,1,0)},uCamForward:{value:new N(0,0,-1)},uTanHalfFov:{value:Math.tan(Oe.degToRad(this.camera.fov*.5))},uRaySteps:{value:96}},depthWrite:!1,depthTest:!1}),this.raymarchQuad=new S(this.raymarchGeo,this.raymarchMat),this.raymarchQuad.frustumCulled=!1,this.raymarchQuad.renderOrder=-10,this.scene.add(this.raymarchQuad),this.diskGeo=new J;const t=new Float32Array(ee*3),a=new Float32Array(ee),r=new Float32Array(ee),i=new Float32Array(ee),l=new Float32Array(ee);for(let n=0;n<ee;n++){const c=Math.random(),u=2.55+Math.pow(c,1.55)*7.8,f=Math.random()*Math.PI*2,m=(u-2.3)*.055+.05,v=(Math.random()-.5)*2*m;t[n*3+0]=Math.cos(f)*u,t[n*3+1]=v,t[n*3+2]=Math.sin(f)*u,a[n]=u,r[n]=f,i[n]=v,l[n]=Math.random()}this.diskGeo.setAttribute("position",new A(t,3)),this.diskGeo.setAttribute("aRadius",new A(a,1)),this.diskGeo.setAttribute("aAngle",new A(r,1)),this.diskGeo.setAttribute("aHeight",new A(i,1)),this.diskGeo.setAttribute("aSeed",new A(l,1)),this.diskMat=new C({vertexShader:Vs,fragmentShader:Xs,uniforms:{uTime:{value:0},uPixelRatio:{value:e.getPixelRatio()}},transparent:!0,depthWrite:!1,blending:I}),this.diskPoints=new re(this.diskGeo,this.diskMat),this.diskPoints.frustumCulled=!1,this.diskPoints.renderOrder=5,this.scene.add(this.diskPoints)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.8));const r=t*.08+this.smoothPointer.x*.55,i=18.6+Math.sin(t*.12)*1.4,l=2.6+Math.sin(t*.15)*1.25+this.smoothPointer.y*2.4;this.camera.position.set(Math.sin(r)*i,l,Math.cos(r)*i),this.camera.lookAt(0,0,0),this.camera.rotateZ(.16),this.camera.updateMatrixWorld(),this.camera.matrixWorld.extractBasis(this.camRight,this.camUp,this.camForward),this.camForward.negate(),this.raymarchMat&&(this.raymarchMat.uniforms.uTime.value=t,this.raymarchMat.uniforms.uCamPos.value.copy(this.camera.position),this.raymarchMat.uniforms.uCamRight.value.copy(this.camRight),this.raymarchMat.uniforms.uCamUp.value.copy(this.camUp),this.raymarchMat.uniforms.uCamForward.value.copy(this.camForward),this.raymarchMat.uniforms.uTanHalfFov.value=Math.tan(Oe.degToRad(this.camera.fov*.5))),this.diskMat&&(this.diskMat.uniforms.uTime.value=t)}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix(),this.raymarchMat&&this.raymarchMat.uniforms.uResolution.value.set(e,t)}setQuality(e){const t=Math.max(.35,Math.min(1,e));this.activeParticleCount=Math.floor(ee*t),this.diskGeo&&this.diskGeo.setDrawRange(0,this.activeParticleCount),this.raymarchMat&&(this.raymarchMat.uniforms.uRaySteps.value=Math.round(52+t*44))}getActiveInstanceCount(){return this.activeParticleCount}dispose(){this.raymarchQuad&&(this.scene.remove(this.raymarchQuad),this.raymarchQuad=null),this.raymarchGeo&&(this.raymarchGeo.dispose(),this.raymarchGeo=null),this.raymarchMat&&(this.raymarchMat.dispose(),this.raymarchMat=null),this.diskPoints&&(this.scene.remove(this.diskPoints),this.diskPoints=null),this.diskGeo&&(this.diskGeo.dispose(),this.diskGeo=null),this.diskMat&&(this.diskMat.dispose(),this.diskMat=null),this.scene.clear()}}const te=32e3,De=24,Ys=`
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aTwinkleSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Subtle twinkling luminosity modulation
    float twinkle = 0.65 + 0.35 * sin(uTime * aTwinkleSpeed + aPhase * 6.28318);
    float flare = pow(0.5 + 0.5 * sin(uTime * aTwinkleSpeed * 1.5 + aPhase), 8.0);

    vColor = aColor * (1.0 + flare * 1.6);
    vAlpha = (0.55 + 0.45 * twinkle);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp(aSize * uPixelRatio * (280.0 / -mvPos.z) * (0.8 + 0.4 * flare), 1.0, 7.0);
  }
`,Ks=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = dot(p, p);
    if (d > 1.0) discard;
    float core = exp(-d * 4.0);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`,Qs=`
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Zs=`
  uniform float uTime;
  uniform float uLayerIndex;
  uniform vec3 uColorA; // Deep Indigo
  uniform vec3 uColorB; // Cosmic Teal
  uniform vec3 uColorC; // Warm Amber Gold

  varying vec2 vUv;
  varying vec3 vWorldPos;

  // 3D Simplex-inspired hash noise
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amp = 0.52;
    for (int i = 0; i < 4; i++) {
      total += amp * snoise(p);
      p = p * 2.05 + vec3(4.2, -7.1, 11.3);
      amp *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    float softEdge = smoothstep(1.0, 0.15, dist);

    // Multi-scale 3D FBM sample through the interstellar dust volume
    vec3 samplePos = vWorldPos * 0.045 + vec3(uTime * 0.015, -uTime * 0.01, uLayerIndex * 0.42);
    float n1 = fbm(samplePos);
    float n2 = fbm(samplePos * 1.8 + vec3(9.2, -3.4, uTime * 0.02));

    float density = smoothstep(-0.25, 0.65, n1 + n2 * 0.45) * softEdge;

    // Color grading: Deep Indigo -> Cosmic Teal -> Warm Amber Gold
    float heat = clamp(n1 * 0.85 + n2 * 0.55 + 0.35, 0.0, 1.0);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.1, 0.55, heat));
    col = mix(col, uColorC, smoothstep(0.55, 0.95, heat));

    // Localized energetic core boost
    float coreSparkle = pow(clamp(heat, 0.0, 1.0), 3.0);
    col += uColorC * coreSparkle * 0.65;

    float alpha = density * 0.28;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;class Js{constructor(){o(this,"id","carina-nebula");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.92,radius:.65,threshold:.48});o(this,"exposure",1.06);o(this,"starPoints",null);o(this,"starGeo",null);o(this,"starMat",null);o(this,"nebulaPlanes",[]);o(this,"nebulaGeos",[]);o(this,"nebulaMats",[]);o(this,"smoothPointer",new T);o(this,"activeStarCount",te);o(this,"cameraZ",30);this.scene=new X,this.scene.background=new M(131850),this.camera=new q(54,window.innerWidth/window.innerHeight,.1,350),this.camera.position.set(0,0,30)}init(e){this.starGeo=new J;const t=new Float32Array(te*3),a=new Float32Array(te*3),r=new Float32Array(te),i=new Float32Array(te),l=new Float32Array(te),n=[new M(9684477),new M(12573694),new M(16777215),new M(16707722),new M(16486972),new M(16281969)];for(let m=0;m<te;m++){const v=8+Math.pow(Math.random(),.8)*85,h=Math.random()*Math.PI*2;t[m*3+0]=Math.cos(h)*v,t[m*3+1]=Math.sin(h)*v,t[m*3+2]=(Math.random()-.5)*260;const p=n[Math.floor(Math.random()*n.length)];a[m*3+0]=p.r,a[m*3+1]=p.g,a[m*3+2]=p.b,r[m]=.8+Math.random()*2.4,i[m]=.8+Math.random()*2.5,l[m]=Math.random()}this.starGeo.setAttribute("position",new A(t,3)),this.starGeo.setAttribute("aColor",new A(a,3)),this.starGeo.setAttribute("aSize",new A(r,1)),this.starGeo.setAttribute("aTwinkleSpeed",new A(i,1)),this.starGeo.setAttribute("aPhase",new A(l,1)),this.starMat=new C({vertexShader:Ys,fragmentShader:Ks,uniforms:{uTime:{value:0},uPixelRatio:{value:e.getPixelRatio()}},transparent:!0,depthWrite:!1,blending:I}),this.starPoints=new re(this.starGeo,this.starMat),this.starPoints.frustumCulled=!1,this.scene.add(this.starPoints);const c=new M(1973067),u=new M(889992),f=new M(16096779);for(let m=0;m<De;m++){const v=70+m%4*15,h=55+m%3*12,p=new H(v,h);this.nebulaGeos.push(p);const w=new C({vertexShader:Qs,fragmentShader:Zs,uniforms:{uTime:{value:0},uLayerIndex:{value:m},uColorA:{value:c},uColorB:{value:u},uColorC:{value:f}},transparent:!0,depthWrite:!1,blending:I,side:ue});this.nebulaMats.push(w);const b=new S(p,w),x=m/De*Math.PI*2+(Math.random()-.5)*.4,G=14+Math.random()*22;b.position.set(Math.cos(x)*G,Math.sin(x)*G*.75,-110+m*11),b.rotation.z=Math.random()*Math.PI,this.nebulaPlanes.push(b),this.scene.add(b)}}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.5)),this.cameraZ-=e*2.8,this.cameraZ<-80&&(this.cameraZ+=180);const r=Math.sin(t*.08)*.05+Math.cos(t*.035+1.2)*.025+this.smoothPointer.x*.05,i=Math.sin(t*.14)*4.2+Math.sin(t*.055+2.1)*1.6+this.smoothPointer.x*3.5,l=Math.cos(t*.11)*2.8+Math.sin(t*.042+.8)*1.3+this.smoothPointer.y*2.5;this.camera.position.set(i,l,this.cameraZ),this.camera.rotation.z=r,this.camera.lookAt(i*.35,l*.35,this.cameraZ-40),this.starMat&&(this.starMat.uniforms.uTime.value=t);for(let n=0;n<this.nebulaMats.length;n++){this.nebulaMats[n].uniforms.uTime.value=t;const c=this.nebulaPlanes[n];c.position.z>this.camera.position.z+20&&(c.position.z-=De*11)}}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){const t=Math.max(.35,Math.min(1,e));this.activeStarCount=Math.floor(te*t),this.starGeo&&this.starGeo.setDrawRange(0,this.activeStarCount)}getActiveInstanceCount(){return this.activeStarCount+De}dispose(){this.starPoints&&(this.scene.remove(this.starPoints),this.starPoints=null),this.starGeo&&(this.starGeo.dispose(),this.starGeo=null),this.starMat&&(this.starMat.dispose(),this.starMat=null),this.nebulaPlanes.forEach(e=>this.scene.remove(e)),this.nebulaGeos.forEach(e=>e.dispose()),this.nebulaMats.forEach(e=>e.dispose()),this.nebulaPlanes=[],this.nebulaGeos=[],this.nebulaMats=[],this.scene.clear()}}const se=16e3,Z=18e3,ht=`
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`,dt=`
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uLimbColor;
  uniform float uPulseRate;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel edge emission
    float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
    float rim = pow(fresnel, 2.8);

    // High-frequency magnetic turbulence ripple
    float ripple = 0.5 + 0.5 * sin(vUv.y * 36.0 + uTime * uPulseRate + sin(vUv.x * 24.0) * 2.0);
    float pulse = 0.85 + 0.35 * sin(uTime * uPulseRate * 1.8);

    vec3 emissive = mix(uCoreColor, uLimbColor, rim) * (1.8 + ripple * 0.8) * pulse;
    // Ultra-bright stellar core highlight
    emissive += vec3(1.0) * pow(max(dot(viewDir, normal), 0.0), 4.0) * 0.9;

    gl_FragColor = vec4(emissive, 1.0);
  }
`,_s=`
  attribute float aProgress;
  attribute float aAngle;
  attribute float aDirection; // +1 or -1 along polar axis
  attribute float aSeed;

  uniform float uTime;
  uniform vec3 uPulsarPos;
  uniform vec3 uJetAxis;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Relativistic velocity outward along magnetic polar axis
    float speed = 52.0 + aSeed * 22.0;
    float dist = mod(uTime * speed + aProgress * 65.0, 65.0);

    // Jet expansion cone with helical precession
    float coneRadius = 0.12 + dist * 0.065;
    float helixAngle = aAngle + dist * 0.45 + uTime * 6.0;

    // Build orthogonal basis relative to jet axis
    vec3 up = abs(uJetAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 sideA = normalize(cross(uJetAxis, up));
    vec3 sideB = cross(uJetAxis, sideA);

    vec3 radialOffset = (sideA * cos(helixAngle) + sideB * sin(helixAngle)) * coneRadius;
    vec3 worldPos = uPulsarPos + (uJetAxis * (dist * aDirection)) + radialOffset;

    // Shock diamond knots along jet axis
    float shockDiamond = 0.7 + 0.5 * sin(dist * 1.8 - uTime * 8.0);

    // Color gradient: Incandescent pure blue-white -> Electric cyan -> Violet shock sheath
    float distFade = 1.0 - (dist / 65.0);
    vec3 jetCol = mix(vec3(0.85, 0.95, 1.0), vec3(0.1, 0.85, 1.0), smoothstep(0.0, 24.0, dist));
    jetCol = mix(jetCol, vec3(0.65, 0.2, 1.0), smoothstep(24.0, 65.0, dist));

    vColor = jetCol * (1.6 + shockDiamond * 1.4);
    vAlpha = distFade * smoothstep(0.0, 3.5, dist) * (0.65 + aSeed * 0.35);

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((32.0 + aSeed * 22.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.2, 9.0);
  }
`,$s=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = dot(p, p);
    if (d > 1.0) discard;
    float core = exp(-d * 3.5);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`,ei=`
  attribute float aTrack;
  attribute float aOrbitAngle;
  attribute float aHeight;
  attribute float aSpeed;
  attribute float aSeed;

  uniform float uTime;
  uniform vec3 uStarA;
  uniform vec3 uStarB;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 worldPos;
    float angle = aOrbitAngle + uTime * aSpeed;

    if (aTrack < 0.45) {
      // Swirling circumbinary accretion disk encircling both stars
      float radius = 5.2 + aHeight * 3.2;
      worldPos = vec3(cos(angle) * radius, (aSeed - 0.5) * 0.8, sin(angle) * radius);
      vColor = mix(vec3(0.3, 0.75, 1.0), vec3(1.0, 0.55, 0.15), aSeed);
      vAlpha = 0.55 * smoothstep(8.5, 5.0, radius);
    } else {
      // Roche-lobe overflow plasma stream transferring mass from companion star B to Pulsar A
      float t = fract(aOrbitAngle + uTime * aSpeed * 0.45);
      vec3 p0 = uStarB;
      vec3 p1 = (uStarA + uStarB) * 0.5 + vec3(0.0, 1.2, 0.0);
      vec3 p2 = uStarA;
      // Quadratic bezier mass transfer arc
      worldPos = mix(mix(p0, p1, t), mix(p1, p2, t), t);
      worldPos += vec3((aSeed - 0.5) * 0.4, (aHeight - 0.5) * 0.4, (aSeed - 0.5) * 0.4);

      vColor = mix(vec3(1.0, 0.4, 0.1), vec3(0.3, 0.85, 1.0), t);
      vAlpha = 0.75;
    }

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((18.0 + aSeed * 18.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.0, 6.0);
  }
`,ti=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = dot(p, p);
    if (d > 1.0) discard;
    float soft = exp(-d * 3.8);
    gl_FragColor = vec4(vColor, soft * vAlpha);
  }
`;class si{constructor(){o(this,"id","binary-pulsar");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:1.2,radius:.68,threshold:.35});o(this,"exposure",1.08);o(this,"starAMesh",null);o(this,"starAGeo",null);o(this,"starAMat",null);o(this,"starBMesh",null);o(this,"starBGeo",null);o(this,"starBMat",null);o(this,"jetPoints",null);o(this,"jetGeo",null);o(this,"jetMat",null);o(this,"bridgePoints",null);o(this,"bridgeGeo",null);o(this,"bridgeMat",null);o(this,"starfieldPoints",null);o(this,"starfieldGeo",null);o(this,"starfieldMat",null);o(this,"smoothPointer",new T);o(this,"starAPos",new N);o(this,"starBPos",new N);o(this,"jetAxis",new N(.2,.95,.15).normalize());this.scene=new X,this.scene.background=new M(66056),this.camera=new q(52,window.innerWidth/window.innerHeight,.1,200),this.camera.position.set(0,5.5,18)}init(e){this.starfieldGeo=new J;const t=14e3,a=new Float32Array(t*3);for(let h=0;h<t;h++){const p=90+Math.random()*80,w=Math.random(),b=Math.random(),x=w*2*Math.PI,G=Math.acos(2*b-1);a[h*3+0]=p*Math.sin(G)*Math.cos(x),a[h*3+1]=p*Math.sin(G)*Math.sin(x),a[h*3+2]=p*Math.cos(G)}this.starfieldGeo.setAttribute("position",new A(a,3)),this.starfieldMat=new et({color:13426158,size:1.2,sizeAttenuation:!1}),this.starfieldPoints=new re(this.starfieldGeo,this.starfieldMat),this.scene.add(this.starfieldPoints),this.starAGeo=new Me(.85,32,32),this.starAMat=new C({vertexShader:ht,fragmentShader:dt,uniforms:{uTime:{value:0},uCoreColor:{value:new M(10875900)},uLimbColor:{value:new M(165063)},uPulseRate:{value:18}}}),this.starAMesh=new S(this.starAGeo,this.starAMat),this.scene.add(this.starAMesh),this.starBGeo=new Me(.68,32,32),this.starBMat=new C({vertexShader:ht,fragmentShader:dt,uniforms:{uTime:{value:0},uCoreColor:{value:new M(16707722)},uLimbColor:{value:new M(15357964)},uPulseRate:{value:12}}}),this.starBMesh=new S(this.starBGeo,this.starBMat),this.scene.add(this.starBMesh),this.jetGeo=new J;const r=new Float32Array(se),i=new Float32Array(se),l=new Float32Array(se),n=new Float32Array(se);for(let h=0;h<se;h++)r[h]=Math.random(),i[h]=Math.random()*Math.PI*2,l[h]=h%2===0?1:-1,n[h]=Math.random();this.jetGeo.setAttribute("position",new A(new Float32Array(se*3),3)),this.jetGeo.setAttribute("aProgress",new A(r,1)),this.jetGeo.setAttribute("aAngle",new A(i,1)),this.jetGeo.setAttribute("aDirection",new A(l,1)),this.jetGeo.setAttribute("aSeed",new A(n,1)),this.jetMat=new C({vertexShader:_s,fragmentShader:$s,uniforms:{uTime:{value:0},uPulsarPos:{value:this.starAPos},uJetAxis:{value:this.jetAxis},uPixelRatio:{value:e.getPixelRatio()}},transparent:!0,depthWrite:!1,blending:I}),this.jetPoints=new re(this.jetGeo,this.jetMat),this.jetPoints.frustumCulled=!1,this.scene.add(this.jetPoints),this.bridgeGeo=new J;const c=new Float32Array(Z),u=new Float32Array(Z),f=new Float32Array(Z),m=new Float32Array(Z),v=new Float32Array(Z);for(let h=0;h<Z;h++)c[h]=Math.random(),u[h]=Math.random()*Math.PI*2,f[h]=Math.random(),m[h]=.8+Math.random()*1.6,v[h]=Math.random();this.bridgeGeo.setAttribute("position",new A(new Float32Array(Z*3),3)),this.bridgeGeo.setAttribute("aTrack",new A(c,1)),this.bridgeGeo.setAttribute("aOrbitAngle",new A(u,1)),this.bridgeGeo.setAttribute("aHeight",new A(f,1)),this.bridgeGeo.setAttribute("aSpeed",new A(m,1)),this.bridgeGeo.setAttribute("aSeed",new A(v,1)),this.bridgeMat=new C({vertexShader:ei,fragmentShader:ti,uniforms:{uTime:{value:0},uStarA:{value:this.starAPos},uStarB:{value:this.starBPos},uPixelRatio:{value:e.getPixelRatio()}},transparent:!0,depthWrite:!1,blending:I}),this.bridgePoints=new re(this.bridgeGeo,this.bridgeMat),this.bridgePoints.frustumCulled=!1,this.scene.add(this.bridgePoints)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.8));const r=t*1.95,i=2.45;this.starAPos.set(Math.cos(r)*(i*.45),0,Math.sin(r)*(i*.45)),this.starBPos.set(-Math.cos(r)*(i*.55),0,-Math.sin(r)*(i*.55)),this.starAMesh&&this.starAMesh.position.copy(this.starAPos),this.starBMesh&&this.starBMesh.position.copy(this.starBPos);const l=t*.35;this.jetAxis.set(Math.sin(l)*.28,.95,Math.cos(l)*.28).normalize();const n=t*.075+Math.sin(t*.028)*.25+this.smoothPointer.x*.5,c=16.5+Math.sin(t*.11)*1.4+Math.cos(t*.045)*.9,u=4.2+Math.sin(t*.12)*1.8+Math.cos(t*.052+1.4)*.9+this.smoothPointer.y*2.2;this.camera.position.set(Math.sin(n)*c,u,Math.cos(n)*c),this.camera.lookAt(0,0,0),this.camera.rotation.z=Math.sin(t*.035)*.025,this.starAMat&&(this.starAMat.uniforms.uTime.value=t),this.starBMat&&(this.starBMat.uniforms.uTime.value=t),this.jetMat&&(this.jetMat.uniforms.uTime.value=t,this.jetMat.uniforms.uPulsarPos.value.copy(this.starAPos),this.jetMat.uniforms.uJetAxis.value.copy(this.jetAxis)),this.bridgeMat&&(this.bridgeMat.uniforms.uTime.value=t,this.bridgeMat.uniforms.uStarA.value.copy(this.starAPos),this.bridgeMat.uniforms.uStarB.value.copy(this.starBPos))}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){const t=Math.max(.35,Math.min(1,e));this.jetGeo&&this.jetGeo.setDrawRange(0,Math.floor(se*t)),this.bridgeGeo&&this.bridgeGeo.setDrawRange(0,Math.floor(Z*t))}getActiveInstanceCount(){return se+Z+2}dispose(){this.starAMesh&&(this.scene.remove(this.starAMesh),this.starAMesh=null),this.starAGeo&&(this.starAGeo.dispose(),this.starAGeo=null),this.starAMat&&(this.starAMat.dispose(),this.starAMat=null),this.starBMesh&&(this.scene.remove(this.starBMesh),this.starBMesh=null),this.starBGeo&&(this.starBGeo.dispose(),this.starBGeo=null),this.starBMat&&(this.starBMat.dispose(),this.starBMat=null),this.jetPoints&&(this.scene.remove(this.jetPoints),this.jetPoints=null),this.jetGeo&&(this.jetGeo.dispose(),this.jetGeo=null),this.jetMat&&(this.jetMat.dispose(),this.jetMat=null),this.bridgePoints&&(this.scene.remove(this.bridgePoints),this.bridgePoints=null),this.bridgeGeo&&(this.bridgeGeo.dispose(),this.bridgeGeo=null),this.bridgeMat&&(this.bridgeMat.dispose(),this.bridgeMat=null),this.starfieldPoints&&(this.scene.remove(this.starfieldPoints),this.starfieldPoints=null),this.starfieldGeo&&(this.starfieldGeo.dispose(),this.starfieldGeo=null),this.starfieldMat&&(this.starfieldMat.dispose(),this.starfieldMat=null),this.scene.clear()}}const ut=5.2,Ye=6.8,Ke=13.6,ii=`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,ai=`
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uPlanetPos;
  uniform float uRingInner;
  uniform float uRingOuter;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  // 3D Simplex-inspired value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.08 + vec2(5.2, 1.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDir);
    vec3 V = normalize(cameraPosition - vWorldPos);

    // Multi-octave banded atmospheric turbulence with zonal wind shear
    float lat = vUv.y * 38.0;
    float windOffset = sin(lat * 0.85) * uTime * 0.025;
    vec2 cloudCoord = vec2(vUv.x * 14.0 + windOffset, lat);
    float turbulence = fbm(cloudCoord) * 0.45 + fbm(cloudCoord * 2.5 - vec2(uTime * 0.015, 0.0)) * 0.25;

    // Saturnian atmospheric color bands: Pale ochre -> Warm butterscotch -> Soft cream -> Hazel amber
    vec3 colOchre = vec3(0.88, 0.78, 0.58);
    vec3 colButter = vec3(0.96, 0.86, 0.65);
    vec3 colCream = vec3(0.98, 0.94, 0.82);
    vec3 colAmber = vec3(0.72, 0.58, 0.42);

    float bandPattern = sin(lat + turbulence * 3.8);
    vec3 surfaceColor = mix(colOchre, colButter, smoothstep(-0.8, 0.1, bandPattern));
    surfaceColor = mix(surfaceColor, colCream, smoothstep(0.1, 0.65, bandPattern));
    surfaceColor = mix(surfaceColor, colAmber, smoothstep(0.65, 1.0, bandPattern));

    // Solar illumination with smooth terminator
    float NdotL = dot(N, L);
    float directLight = smoothstep(-0.05, 0.22, NdotL);

    // Calculate ring shadow projected onto planet sphere:
    // Cast ray from point toward sun; check if it intersects equatorial ring plane y=0
    float ringShadow = 1.0;
    if (abs(L.y) > 0.001) {
      float tRing = -vWorldPos.y / L.y;
      if (tRing > 0.0) {
        vec3 hit = vWorldPos + L * tRing;
        float rHit = length(hit.xz);
        if (rHit >= uRingInner && rHit <= uRingOuter) {
          // Inside ring shadow band; modulate by Cassini division gap
          float isCassini = smoothstep(0.04, 0.0, abs(rHit - (uRingInner + (uRingOuter - uRingInner) * 0.48)));
          ringShadow = mix(0.12, 0.85, isCassini);
        }
      }
    }

    // Rayleigh scattering atmospheric limb glow
    float fresnel = 1.0 - max(dot(N, V), 0.0);
    float rimGlow = pow(fresnel, 3.2) * max(NdotL + 0.35, 0.0);
    vec3 rimColor = mix(vec3(0.55, 0.82, 1.0), vec3(1.0, 0.85, 0.55), clamp(NdotL, 0.0, 1.0));

    // Ambient nightside starlight scatter
    vec3 nightAmbient = vec3(0.015, 0.018, 0.026);

    vec3 finalColor = surfaceColor * (directLight * ringShadow) + nightAmbient + (rimColor * rimGlow * 0.95);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`,oi=`
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,ri=`
  uniform vec3 uSunDir;
  uniform float uPlanetRadius;
  uniform float uRingInner;
  uniform float uRingOuter;

  varying vec3 vWorldPos;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float r = length(vWorldPos.xz);
    if (r < uRingInner || r > uRingOuter) discard;

    float normR = (r - uRingInner) / (uRingOuter - uRingInner);

    // Multiband ring albedo density & gaps
    // Cassini division at normR ~ 0.46..0.52
    float cassini = 1.0 - smoothstep(0.028, 0.005, abs(normR - 0.485));
    // Encke gap at normR ~ 0.82
    float encke = 1.0 - smoothstep(0.012, 0.002, abs(normR - 0.82));

    // High-frequency icy micro-ringlets
    float microRings = 0.5 + 0.5 * sin(normR * 280.0) + 0.25 * sin(normR * 680.0);

    float bandAlpha = (0.42 + 0.45 * microRings) * cassini * encke;

    // Check planet eclipse shadow cast onto rings:
    // Cylinder shadow along Sun direction: dot(P, SunDir) < 0 && distance to sun axis < PlanetRadius
    vec3 L = normalize(uSunDir);
    float proj = dot(vWorldPos, L);
    float perpDistSq = dot(vWorldPos, vWorldPos) - proj * proj;

    float planetShadow = 1.0;
    if (proj < 0.0 && perpDistSq < (uPlanetRadius * uPlanetRadius * 1.02)) {
      float distToEdge = uPlanetRadius - sqrt(max(perpDistSq, 0.0));
      planetShadow = smoothstep(0.0, 0.45, -distToEdge);
    }

    vec3 ringIceCol = mix(vec3(0.92, 0.84, 0.68), vec3(0.96, 0.92, 0.84), microRings);
    vec3 litColor = ringIceCol * (planetShadow * 0.92 + 0.08);

    gl_FragColor = vec4(litColor, bandAlpha);
  }
`;class ni{constructor(){o(this,"id","saturnian-orbit");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.78,radius:.54,threshold:.52});o(this,"exposure",1.04);o(this,"planetMesh",null);o(this,"planetGeo",null);o(this,"planetMat",null);o(this,"ringMesh",null);o(this,"ringGeo",null);o(this,"ringMat",null);o(this,"starfieldPoints",null);o(this,"starfieldGeo",null);o(this,"starfieldMat",null);o(this,"smoothPointer",new T);o(this,"sunDir",new N(.85,.24,-.45).normalize());this.scene=new X,this.scene.background=new M(66055),this.camera=new q(50,window.innerWidth/window.innerHeight,.1,300),this.camera.position.set(15.2,5.4,18.5)}init(e){this.starfieldGeo=new J;const t=26e3,a=new Float32Array(t*3),r=new Float32Array(t*3);for(let i=0;i<t;i++){const l=140+Math.random()*80,n=Math.random(),c=Math.random(),u=n*2*Math.PI,f=Math.acos(2*c-1),v=Math.abs(Math.sin(u+.4)*Math.sin(f))<.22?f*.45+Math.PI*.27:f;a[i*3+0]=l*Math.sin(v)*Math.cos(u),a[i*3+1]=l*Math.sin(v)*Math.sin(u),a[i*3+2]=l*Math.cos(v);const h=Math.random()>.7;r[i*3+0]=h?.75:1,r[i*3+1]=h?.88:.94,r[i*3+2]=h?1:.82}this.starfieldGeo.setAttribute("position",new A(a,3)),this.starfieldGeo.setAttribute("color",new A(r,3)),this.starfieldMat=new et({size:1.15,vertexColors:!0,sizeAttenuation:!1}),this.starfieldPoints=new re(this.starfieldGeo,this.starfieldMat),this.scene.add(this.starfieldPoints),this.planetGeo=new Me(ut,64,48),this.planetMat=new C({vertexShader:ii,fragmentShader:ai,uniforms:{uTime:{value:0},uSunDir:{value:this.sunDir},uPlanetPos:{value:new N(0,0,0)},uRingInner:{value:Ye},uRingOuter:{value:Ke}}}),this.planetMesh=new S(this.planetGeo,this.planetMat),this.planetMesh.rotation.z=Oe.degToRad(26.7),this.scene.add(this.planetMesh),this.ringGeo=new us(Ye,Ke,128),this.ringGeo.rotateX(-Math.PI/2),this.ringMat=new C({vertexShader:oi,fragmentShader:ri,uniforms:{uSunDir:{value:this.sunDir},uPlanetRadius:{value:ut},uRingInner:{value:Ye},uRingOuter:{value:Ke}},transparent:!0,depthWrite:!1,side:ue}),this.ringMesh=new S(this.ringGeo,this.ringMat),this.ringMesh.rotation.z=Oe.degToRad(26.7),this.scene.add(this.ringMesh)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.5));const r=.72+t*.022+Math.sin(t*.038)*.08+this.smoothPointer.x*.35,i=21+Math.sin(t*.075)*1.6+Math.cos(t*.032+1.2)*.8,l=4.8+Math.sin(t*.055)*1.5+Math.cos(t*.027+2.1)*.7+this.smoothPointer.y*2.2;this.camera.position.set(Math.cos(r)*i,l,Math.sin(r)*i),this.camera.lookAt(0,0,0),this.camera.rotation.z=Math.sin(t*.024)*.018,this.planetMat&&(this.planetMat.uniforms.uTime.value=t)}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){}getActiveInstanceCount(){return 26002}dispose(){this.planetMesh&&(this.scene.remove(this.planetMesh),this.planetMesh=null),this.planetGeo&&(this.planetGeo.dispose(),this.planetGeo=null),this.planetMat&&(this.planetMat.dispose(),this.planetMat=null),this.ringMesh&&(this.scene.remove(this.ringMesh),this.ringMesh=null),this.ringGeo&&(this.ringGeo.dispose(),this.ringGeo=null),this.ringMat&&(this.ringMat.dispose(),this.ringMat=null),this.starfieldPoints&&(this.scene.remove(this.starfieldPoints),this.starfieldPoints=null),this.starfieldGeo&&(this.starfieldGeo.dispose(),this.starfieldGeo=null),this.starfieldMat&&(this.starfieldMat.dispose(),this.starfieldMat=null),this.scene.clear()}}const ie=1400,li=`
  attribute vec3 aColor;
  attribute float aBaseSize;
  attribute float aPhase;
  attribute float aParallaxSpeed;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uCamPos;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 worldPos = position;

    // Relative distance vector from camera
    vec3 rel = worldPos - uCamPos;

    // Continuous depth wrap so stars infinitely drift through deep void without popping
    float zSpan = 450.0;
    float zRel = mod(rel.z + zSpan * 0.5, zSpan) - zSpan * 0.5;
    worldPos.z = uCamPos.z + zRel;

    // Organic slow twinkle
    float twinkle = 0.78 + 0.22 * sin(uTime * 0.65 + aPhase * 6.28318);

    // Smoothstep fade out before clipping camera near-plane (near threshold ~ 8.0)
    // Smoothstep fade in at distant boundary (far threshold ~ 340.0)
    float distZ = -zRel;
    float nearFade = smoothstep(6.0, 32.0, distZ);
    float farFade = smoothstep(360.0, 180.0, distZ);
    float fade = nearFade * farFade;

    vColor = aColor;
    vAlpha = fade * twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size with maximum cap to preserve crisp pinpoint aesthetic
    float size = aBaseSize * (160.0 / -mvPosition.z) * uPixelRatio;
    gl_PointSize = clamp(size, 1.2, 5.5);
  }
`,ci=`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d2 = dot(p, p);
    if (d2 > 0.25) discard;

    // Soft Gaussian pinpoint falloff with hot incandescent core
    float core = exp(-d2 * 28.0);
    float halo = exp(-d2 * 9.0) * 0.45;
    float intensity = core + halo;

    gl_FragColor = vec4(vColor * (1.0 + core * 0.8), vAlpha * intensity);
  }
`,hi=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`,di=`
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // 2D Hash & Value Noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.4, 2.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;

    // Barely perceptible deep-space dust gradient (mostly #010205)
    float dust = fbm(uv * 3.8 + vec2(uTime * 0.003, uTime * 0.002));
    float vignette = 1.0 - dot(centered, centered) * 1.6;

    // Faint interstellar dust veil: dark indigo/slate #02040c
    vec3 dustColor = vec3(0.008, 0.015, 0.035) * dust * 0.35;
    vec3 baseVoid = vec3(0.004, 0.008, 0.018) * clamp(vignette, 0.0, 1.0);

    vec3 finalColor = baseVoid + dustColor;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`,ui=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,mi=`
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;

    float angle = atan(p.y, p.x);
    // Logarithmic spiral arms
    float spiral = sin(angle * 2.0 - log(max(r, 0.02)) * 3.2 + uTime * 0.04);
    float arms = smoothstep(-0.2, 0.8, spiral) * exp(-r * 3.2);
    float core = exp(-r * 9.0) * 1.8;

    float alpha = (core + arms * 0.45) * smoothstep(1.0, 0.55, r);
    vec3 coreColor = vec3(0.95, 0.88, 0.72);
    vec3 armColor = vec3(0.35, 0.65, 0.95);
    vec3 col = mix(armColor, coreColor, core / max(core + arms, 0.001));

    gl_FragColor = vec4(col * 0.65, alpha * 0.42);
  }
`;class fi{constructor(){o(this,"id","deep-void-drift");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.62,radius:.45,threshold:.68});o(this,"exposure",1.02);o(this,"starGeo",null);o(this,"starMat",null);o(this,"starPoints",null);o(this,"activeStarCount",ie);o(this,"dustGeo",null);o(this,"dustMat",null);o(this,"dustMesh",null);o(this,"galaxyMesh",null);o(this,"binaryPairGroup",null);o(this,"redGiantMesh",null);o(this,"cameraZ",0);o(this,"smoothPointer",new T);this.scene=new X,this.scene.background=new M(66053),this.camera=new q(54,window.innerWidth/window.innerHeight,.1,500),this.camera.position.set(0,0,0)}init(e){this.dustGeo=new H(2,2),this.dustMat=new C({vertexShader:hi,fragmentShader:di,uniforms:{uTime:{value:0},uResolution:{value:new T(window.innerWidth,window.innerHeight)}},depthWrite:!1,depthTest:!1}),this.dustMesh=new S(this.dustGeo,this.dustMat),this.dustMesh.frustumCulled=!1,this.scene.add(this.dustMesh),this.starGeo=new J;const t=new Float32Array(ie*3),a=new Float32Array(ie*3),r=new Float32Array(ie),i=new Float32Array(ie),l=new Float32Array(ie),n=[new M(16281969),new M(16486972),new M(16710083),new M(8246268)];for(let x=0;x<ie;x++){t[x*3+0]=(Math.random()-.5)*240,t[x*3+1]=(Math.random()-.5)*160,t[x*3+2]=-Math.random()*450;const G=Math.random()<.4?0:Math.random()<.65?1:Math.random()<.85?2:3,D=n[G];a[x*3+0]=D.r,a[x*3+1]=D.g,a[x*3+2]=D.b,r[x]=.9+Math.random()*1.8,i[x]=Math.random(),l[x]=.85+Math.random()*.3}this.starGeo.setAttribute("position",new A(t,3)),this.starGeo.setAttribute("aColor",new A(a,3)),this.starGeo.setAttribute("aBaseSize",new A(r,1)),this.starGeo.setAttribute("aPhase",new A(i,1)),this.starGeo.setAttribute("aParallaxSpeed",new A(l,1)),this.starMat=new C({vertexShader:li,fragmentShader:ci,uniforms:{uTime:{value:0},uPixelRatio:{value:e.getPixelRatio()},uCamPos:{value:this.camera.position}},transparent:!0,depthWrite:!1,blending:I}),this.starPoints=new re(this.starGeo,this.starMat),this.starPoints.frustumCulled=!1,this.scene.add(this.starPoints);const c=new H(55,55),u=new C({vertexShader:ui,fragmentShader:mi,uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:I,side:ue});this.galaxyMesh=new S(c,u),this.galaxyMesh.position.set(-68,28,-260),this.galaxyMesh.rotation.z=.45,this.galaxyMesh.rotation.x=-.3,this.scene.add(this.galaxyMesh),this.binaryPairGroup=new ae,this.binaryPairGroup.position.set(74,-22,-180);const f=new Me(.35,12,12),m=new B({color:16707722}),v=new B({color:3718648}),h=new S(f,m),p=new S(f,v);h.position.x=1.2,p.position.x=-1.2,this.binaryPairGroup.add(h,p),this.scene.add(this.binaryPairGroup);const w=new Me(1.6,16,16),b=new B({color:16347926});this.redGiantMesh=new S(w,b),this.redGiantMesh.position.set(52,45,-340),this.scene.add(this.redGiantMesh)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2)),this.cameraZ-=e*1.4;const r=Math.sin(t*.031)*.022+Math.sin(t*.077+1.2)*.01+this.smoothPointer.y*.03,i=Math.cos(t*.023)*.03+Math.sin(t*.053+2.1)*.012+this.smoothPointer.x*.035,l=Math.sin(t*.018)*.008,n=Math.sin(t*.04)*2.2+this.smoothPointer.x*2.5,c=Math.cos(t*.032)*1.6+this.smoothPointer.y*1.8;if(this.camera.position.set(n,c,this.cameraZ),this.camera.rotation.set(r,i,l),this.dustMat&&(this.dustMat.uniforms.uTime.value=t),this.starMat&&(this.starMat.uniforms.uTime.value=t,this.starMat.uniforms.uCamPos.value.copy(this.camera.position)),this.galaxyMesh){const u=this.galaxyMesh.material;u.uniforms.uTime.value=t,this.galaxyMesh.position.z>this.camera.position.z+40&&(this.galaxyMesh.position.z-=420,this.galaxyMesh.position.x=(Math.random()-.5)*120,this.galaxyMesh.position.y=(Math.random()-.5)*80)}if(this.binaryPairGroup&&(this.binaryPairGroup.rotation.y=t*.8,this.binaryPairGroup.position.z>this.camera.position.z+40&&(this.binaryPairGroup.position.z-=380,this.binaryPairGroup.position.x=(Math.random()-.5)*140,this.binaryPairGroup.position.y=(Math.random()-.5)*80)),this.redGiantMesh){const u=1+Math.sin(t*.4)*.06;this.redGiantMesh.scale.setScalar(u),this.redGiantMesh.position.z>this.camera.position.z+40&&(this.redGiantMesh.position.z-=450,this.redGiantMesh.position.x=(Math.random()-.5)*150,this.redGiantMesh.position.y=(Math.random()-.5)*90)}}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix(),this.dustMat&&this.dustMat.uniforms.uResolution.value.set(e,t)}setQuality(e){const t=Math.max(.3,Math.min(1,e));this.activeStarCount=Math.floor(ie*t),this.starGeo&&this.starGeo.setDrawRange(0,this.activeStarCount)}getActiveInstanceCount(){return this.activeStarCount+4}dispose(){this.starPoints&&(this.scene.remove(this.starPoints),this.starPoints=null),this.starGeo&&(this.starGeo.dispose(),this.starGeo=null),this.starMat&&(this.starMat.dispose(),this.starMat=null),this.dustMesh&&(this.scene.remove(this.dustMesh),this.dustMesh=null),this.dustGeo&&(this.dustGeo.dispose(),this.dustGeo=null),this.dustMat&&(this.dustMat.dispose(),this.dustMat=null),this.galaxyMesh&&(this.scene.remove(this.galaxyMesh),this.galaxyMesh.geometry.dispose(),this.galaxyMesh.material.dispose(),this.galaxyMesh=null),this.binaryPairGroup&&(this.scene.remove(this.binaryPairGroup),this.binaryPairGroup.traverse(e=>{e instanceof S&&(e.geometry.dispose(),e.material.dispose())}),this.binaryPairGroup=null),this.redGiantMesh&&(this.scene.remove(this.redGiantMesh),this.redGiantMesh.geometry.dispose(),this.redGiantMesh.material.dispose(),this.redGiantMesh=null),this.scene.clear()}}const pi=18,mt=240,Re=14,ze=48,Ee=36,Le=45,vi=`
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,xi=`
  uniform float uTime;
  uniform vec3 uCarPos;
  uniform vec3 uLightPos[6];
  uniform vec3 uLightColor[6];

  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simple hash noise for asphalt micro-texture
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    // Scrolling road coordinates
    vec2 roadCoord = vec2(vWorldPos.x + uTime * 28.0, vWorldPos.z);

    // Asphalt dark base color
    float grain = hash(floor(roadCoord * 16.0)) * 0.08;
    vec3 asphalt = vec3(0.045 + grain, 0.05 + grain, 0.06 + grain);

    // Highway painted dashed center lane lines (Z = 0) and solid edge lines (Z = -5.5, +5.5)
    float centerDash = step(0.45, fract(roadCoord.x * 0.07)) * smoothstep(0.18, 0.08, abs(vWorldPos.z));
    float edgeLine1 = smoothstep(0.16, 0.06, abs(vWorldPos.z - 5.5));
    float edgeLine2 = smoothstep(0.16, 0.06, abs(vWorldPos.z + 5.5));
    float lines = clamp(centerDash * 0.85 + edgeLine1 * 0.75 + edgeLine2 * 0.75, 0.0, 1.0);

    vec3 roadColor = mix(asphalt, vec3(0.72, 0.75, 0.8), lines);

    // Wet asphalt mirror sheen & specular pools from passing streetlights
    vec3 lightAccum = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      vec3 lightPos = uLightPos[i];
      vec3 toLight = lightPos - vWorldPos;
      float dist2 = dot(toLight, toLight);
      float atten = 1.0 / (1.0 + dist2 * 0.045);

      // Elongated anisotropic specular wet reflection streak along road
      float spec = exp(-abs(vWorldPos.z - lightPos.z) * 1.8) * exp(-abs(vWorldPos.x - lightPos.x) * 0.28);
      lightAccum += uLightColor[i] * (atten * 0.55 + spec * 0.85);
    }

    // Car headlight pool on road ahead of car (car at X = 0, headlights cast to X > 0)
    vec3 headDir = vWorldPos - (uCarPos + vec3(2.5, 0.4, 0.0));
    float headDist = length(headDir);
    float headBeam = smoothstep(22.0, 4.0, headDist) * smoothstep(3.5, 0.0, abs(vWorldPos.z - uCarPos.z));
    vec3 headlightGlow = vec3(1.0, 0.95, 0.82) * headBeam * 0.65;

    // Red taillight reflection behind car (X < 0)
    vec3 tailDir = vWorldPos - (uCarPos + vec3(-2.4, 0.4, 0.0));
    float tailDist = length(tailDir);
    float tailBeam = smoothstep(9.0, 1.0, tailDist) * smoothstep(2.2, 0.0, abs(vWorldPos.z - uCarPos.z));
    vec3 taillightGlow = vec3(0.95, 0.08, 0.08) * tailBeam * 0.55;

    vec3 finalCol = roadColor + lightAccum + headlightGlow + taillightGlow;
    gl_FragColor = vec4(finalCol, 1.0);
  }
`,gi=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,wi=`
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float lengthFade = smoothstep(1.0, 0.08, vUv.x);
    float widthFade = smoothstep(0.5, 0.0, abs(vUv.y - 0.5));
    float dust = 0.85 + 0.15 * sin(vUv.x * 24.0 - uTime * 6.0);
    float alpha = lengthFade * widthFade * dust * 0.32;
    gl_FragColor = vec4(1.0, 0.95, 0.85, alpha);
  }
`;class bi{constructor(){o(this,"id","midnight-cruise");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.85,radius:.58,threshold:.55});o(this,"exposure",1.04);o(this,"carGroup",new ae);o(this,"carBodyMesh",null);o(this,"wheels",[]);o(this,"headlightCone",null);o(this,"roadMesh",null);o(this,"roadMat",null);o(this,"streetlightGroup",new ae);o(this,"activeLightPositions",[]);o(this,"activeLightColors",[]);o(this,"guardrailGroup",new ae);o(this,"treeGroup",new ae);o(this,"skylineGroup",new ae);o(this,"moonMesh",null);o(this,"disposableGeometries",[]);o(this,"disposableMaterials",[]);o(this,"smoothPointer",new T);this.scene=new X,this.scene.background=new M(461847),this.scene.fog=new Fe(593950,.011),this.camera=new q(46,window.innerWidth/window.innerHeight,.1,450),this.camera.position.set(-2.2,2.1,9.4)}init(e){const t=new _e(8246268,593949,.45);this.scene.add(t);const a=new $e(10875900,.75);a.position.set(-40,60,-80),this.scene.add(a),this.buildCar();const r=new H(mt,pi,12,12);r.rotateX(-Math.PI/2),this.disposableGeometries.push(r);for(let i=0;i<6;i++){this.activeLightPositions.push(new N((i-2.5)*32,5.2,-6.5));const l=i%2===0;this.activeLightColors.push(l?new N(1,.65,.22):new N(.55,.85,1))}this.roadMat=new C({vertexShader:vi,fragmentShader:xi,uniforms:{uTime:{value:0},uCarPos:{value:this.carGroup.position},uLightPos:{value:this.activeLightPositions},uLightColor:{value:this.activeLightColors}}}),this.disposableMaterials.push(this.roadMat),this.roadMesh=new S(r,this.roadMat),this.roadMesh.position.set(0,0,0),this.scene.add(this.roadMesh),this.buildStreetlights(),this.buildGuardrails(),this.buildTrees(),this.buildSkyline()}buildCar(){const e=new W(4.4,.85,1.95),t=new oe({color:790812,roughness:.18,metalness:.88});this.disposableGeometries.push(e),this.disposableMaterials.push(t),this.carBodyMesh=new S(e,t),this.carBodyMesh.position.set(0,.72,0),this.carGroup.add(this.carBodyMesh);const a=new W(2.3,.58,1.62),r=new oe({color:395536,roughness:.08,metalness:.95,transparent:!0,opacity:.88});this.disposableGeometries.push(a),this.disposableMaterials.push(r);const i=new S(a,r);i.position.set(-.25,1.32,0),this.carGroup.add(i);const l=new W(.12,.18,.42),n=new B({color:16775917});this.disposableGeometries.push(l),this.disposableMaterials.push(n);const c=new S(l,n);c.position.set(2.22,.72,.65);const u=c.clone();u.position.z=-.65,this.carGroup.add(c,u);const f=new W(.1,.14,1.8),m=new B({color:16719399});this.disposableGeometries.push(f),this.disposableMaterials.push(m);const v=new S(f,m);v.position.set(-2.22,.78,0),this.carGroup.add(v);const h=new H(16,5.2);h.rotateZ(Math.PI/2),h.rotateY(Math.PI/2),this.disposableGeometries.push(h);const p=new C({vertexShader:gi,fragmentShader:wi,uniforms:{uTime:{value:0}},transparent:!0,depthWrite:!1,blending:I,side:ue});this.disposableMaterials.push(p),this.headlightCone=new S(h,p),this.headlightCone.position.set(10.2,.65,0),this.carGroup.add(this.headlightCone);const w=new Ie(.38,.38,.32,16);w.rotateX(Math.PI/2);const b=new oe({color:1119778,roughness:.45,metalness:.65});this.disposableGeometries.push(w),this.disposableMaterials.push(b);const x=[[1.35,.38,.95],[1.35,.38,-.95],[-1.35,.38,.95],[-1.35,.38,-.95]];for(const[G,D,j]of x){const k=new S(w,b);k.position.set(G,D,j),this.wheels.push(k),this.carGroup.add(k)}this.carGroup.position.set(0,0,0),this.scene.add(this.carGroup)}buildStreetlights(){const e=new Ie(.08,.12,7.5,8),t=new W(2.4,.08,.08),a=new W(.8,.15,.35),r=new oe({color:1581104,roughness:.6,metalness:.8});this.disposableGeometries.push(e,t,a),this.disposableMaterials.push(r);for(let i=0;i<Re;i++){const l=new ae,n=new S(e,r);n.position.y=3.75,l.add(n);const c=new S(t,r);c.position.set(.9,7.3,0),l.add(c);const u=i%2===0,f=new B({color:u?16755251:9684477}),m=new S(a,f);m.position.set(1.9,7.2,0),l.add(m),l.position.set((i-Re*.5)*24,0,-6.8),this.streetlightGroup.add(l)}this.scene.add(this.streetlightGroup)}buildGuardrails(){const e=new W(.12,.9,.12),t=new W(mt,.22,.08),a=new oe({color:2042167,roughness:.45,metalness:.75});this.disposableGeometries.push(e,t),this.disposableMaterials.push(a);for(let i=0;i<ze;i++){const l=new S(e,a);l.position.set((i-ze*.5)*5.5,.45,6.2),this.guardrailGroup.add(l)}const r=new S(t,a);r.position.set(0,.65,6.2),this.guardrailGroup.add(r),this.scene.add(this.guardrailGroup)}buildTrees(){const e=new Ie(.2,.35,4.2,6),t=new ms(2.2,6.5,6),a=new oe({color:330002,roughness:.9});this.disposableGeometries.push(e,t),this.disposableMaterials.push(a);for(let r=0;r<Ee;r++){const i=new ae,l=new S(e,a);l.position.y=2.1;const n=new S(t,a);n.position.y=5.8,i.add(l,n);const c=(r-Ee*.5)*8.5,u=-12.5-Math.random()*8;i.position.set(c,0,u),this.treeGroup.add(i)}this.scene.add(this.treeGroup)}buildSkyline(){const e=new W(1,1,1),t=new B({color:461848});this.disposableGeometries.push(e),this.disposableMaterials.push(t);for(let i=0;i<Le;i++){const l=new S(e,t),n=6+Math.random()*9,c=18+Math.random()*38,u=6+Math.random()*9;l.scale.set(n,c,u),l.position.set((i-Le*.5)*11,c*.5,-95-i%3*18),this.skylineGroup.add(l)}this.scene.add(this.skylineGroup);const a=new Ze(4.2,24),r=new B({color:14742270});this.disposableGeometries.push(a),this.disposableMaterials.push(r),this.moonMesh=new S(a,r),this.moonMesh.position.set(38,36,-140),this.scene.add(this.moonMesh)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.5));const r=28,i=Math.sin(t*13)*.012+Math.sin(t*23+1.2)*.007+Math.sin(t*7.5)*.009;this.carBodyMesh&&(this.carBodyMesh.position.y=.72+i);for(const h of this.wheels)h.rotation.x-=r*e*1.5;const l=Math.sin(t*.18)*.45+this.smoothPointer.x*1.2,n=Math.sin(t*.22)*.25+this.smoothPointer.y*.8,c=Math.cos(t*.15)*.4;this.camera.position.set(-2.2+l,2.1+n,9.4+c),this.camera.lookAt(1.8+this.smoothPointer.x*.8,1.2,0);const u=Re*24;for(const h of this.streetlightGroup.children)h.position.x-=r*e,h.position.x<-u*.5&&(h.position.x+=u);for(let h=0;h<6;h++){const p=this.streetlightGroup.children[h%this.streetlightGroup.children.length];p&&this.activeLightPositions[h].set(p.position.x,7.2,p.position.z)}const f=ze*5.5;for(const h of this.guardrailGroup.children)h instanceof S&&h.geometry instanceof W&&h.geometry.parameters.width<1&&(h.position.x-=r*e,h.position.x<-f*.5&&(h.position.x+=f));const m=Ee*8.5;for(const h of this.treeGroup.children)h.position.x-=r*e*.75,h.position.x<-m*.5&&(h.position.x+=m);const v=Le*11;for(const h of this.skylineGroup.children)h.position.x-=r*e*.18,h.position.x<-v*.5&&(h.position.x+=v);if(this.roadMat&&(this.roadMat.uniforms.uTime.value=t,this.roadMat.uniforms.uCarPos.value.copy(this.carGroup.position)),this.headlightCone){const h=this.headlightCone.material;h.uniforms.uTime.value=t}}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){}getActiveInstanceCount(){return Re+ze+Ee+Le+this.wheels.length+6}dispose(){this.scene.remove(this.carGroup),this.scene.remove(this.streetlightGroup),this.scene.remove(this.guardrailGroup),this.scene.remove(this.treeGroup),this.scene.remove(this.skylineGroup),this.roadMesh&&(this.scene.remove(this.roadMesh),this.roadMesh=null),this.moonMesh&&(this.scene.remove(this.moonMesh),this.moonMesh=null);for(const e of this.disposableGeometries)e.dispose();for(const e of this.disposableMaterials)e.dispose();this.disposableGeometries=[],this.disposableMaterials=[],this.scene.clear()}}const yi=`
  uniform float uTime;
  uniform vec3 uMoonPos;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vWaveCrest;
  varying float vWaterDepth;

  struct Wave {
    vec2 dir;
    float amp;
    float len;
    float speed;
    float steepness;
  };

  void main() {
    vUv = uv;
    vec3 p = position;

    // 8 Gerstner Wave Components (layered swells rolling towards shore Z > 0 + cross-ripples)
    Wave waves[8];
    waves[0] = Wave(normalize(vec2(0.05, 0.99)), 1.15, 38.0, 1.45, 0.55);
    waves[1] = Wave(normalize(vec2(-0.15, 0.98)), 0.72, 22.0, 1.85, 0.50);
    waves[2] = Wave(normalize(vec2(0.22, 0.97)), 0.48, 14.0, 2.15, 0.45);
    waves[3] = Wave(normalize(vec2(-0.08, 0.99)), 0.32, 9.5, 2.55, 0.40);
    waves[4] = Wave(normalize(vec2(0.35, 0.93)), 0.22, 6.2, 3.10, 0.35);
    waves[5] = Wave(normalize(vec2(-0.32, 0.94)), 0.16, 4.4, 3.65, 0.30);
    waves[6] = Wave(normalize(vec2(0.55, 0.83)), 0.09, 2.8, 4.20, 0.25);
    waves[7] = Wave(normalize(vec2(-0.48, 0.87)), 0.06, 1.9, 4.80, 0.20);

    vec3 displaced = p;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    // Shoreline damping factor: waves crest higher in shallow water then break on sand slope
    // Beach slopes up as Z increases (Z > 5 is shallow, Z > 18 is shoreline)
    float shoreDamping = smoothstep(24.0, 8.0, p.z);
    float totalDisplacementY = 0.0;

    for (int i = 0; i < 8; i++) {
      Wave w = waves[i];
      float k = 6.2831853 / w.len;
      float c = sqrt(9.8 / k) * w.speed;
      float phase = k * (dot(w.dir, p.xz) - c * uTime * 0.42);

      float amp = w.amp * (0.65 + shoreDamping * 0.45);
      float q = w.steepness / (k * amp * 8.0 + 1e-4);

      displaced.x += w.dir.x * (q * amp * cos(phase));
      displaced.z += w.dir.y * (q * amp * cos(phase));
      displaced.y += amp * sin(phase);

      totalDisplacementY += amp * sin(phase);

      // Partial derivatives for exact analytic surface normal
      float wa = k * amp;
      float s = sin(phase);
      float c_val = cos(phase);

      tangent += vec3(
        -w.dir.x * w.dir.x * (q * wa * s),
        w.dir.x * (wa * c_val),
        -w.dir.x * w.dir.y * (q * wa * s)
      );

      binormal += vec3(
        -w.dir.x * w.dir.y * (q * wa * s),
        w.dir.y * (wa * c_val),
        -w.dir.y * w.dir.y * (q * wa * s)
      );
    }

    vec3 normal = normalize(cross(binormal, tangent));
    vNormal = normal;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;

    // Beach sand bed height calculation: gentle slope from Y = -14 at Z = -80 up to Y = 1.2 at Z = 24
    float sandBedY = -14.0 + (worldPos.z + 80.0) * (15.2 / 104.0);
    vWaterDepth = max(0.0, worldPos.y - sandBedY);

    // Wave crest indicator for foam generation
    vWaveCrest = clamp((totalDisplacementY - 0.35) / 1.6, 0.0, 1.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Mi=`
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uMoonPos;
  uniform vec3 uMoonColor;
  uniform vec3 uDeepWaterColor;
  uniform vec3 uShallowWaterColor;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vWaveCrest;
  varying float vWaterDepth;

  // 2D Hash Noise for Organic Foam Bubbles
  float hash(vec2 p) {
    p = fract(p * vec2(213.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.2 + vec2(1.2, 3.4);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 L = normalize(uMoonPos - vWorldPos);
    vec3 H = normalize(L + V);

    // 1. Fresnel Reflectance (Schlick's approximation)
    float NdotV = max(0.0, dot(N, V));
    float R0 = 0.025; // Water base reflectance at normal incidence
    float fresnel = R0 + (1.0 - R0) * pow(1.0 - NdotV, 5.0);

    // 2. Water Body Color (Deep Indigo/Teal gradient based on depth)
    float depthFactor = smoothstep(0.0, 5.5, vWaterDepth);
    vec3 waterBody = mix(uShallowWaterColor, uDeepWaterColor, depthFactor);

    // 3. Subsurface Scattering through Thin Wave Crests (Delicate Deep Teal Translucency)
    vec3 sssDir = normalize(L + N * 0.4);
    float sssFactor = pow(clamp(dot(V, -sssDir), 0.0, 1.0), 3.0) * vWaveCrest;
    vec3 sssColor = vec3(0.06, 0.52, 0.58) * sssFactor * 1.45;

    // 4. Shimmering Broken Moon Specular Track (Blinn-Phong Glint across rolling swells)
    float NdotH = max(0.0, dot(N, H));
    float specSharp = pow(NdotH, 180.0) * 2.2;
    float specBroad = pow(NdotH, 24.0) * 0.35;
    vec3 moonSpecular = uMoonColor * (specSharp + specBroad);

    // 5. Procedural Breaking Waves & Shoreline Foam
    vec2 foamCoord = vWorldPos.xz * 1.8 + vec2(uTime * 0.25, -uTime * 0.15);
    float foamNoise = fbm(foamCoord);

    // Foam at rolling wave crests + shallow shoreline wash
    float crestFoam = smoothstep(0.55, 0.95, vWaveCrest) * step(0.38, foamNoise);
    float shoreFoam = smoothstep(0.45, 0.02, vWaterDepth) * smoothstep(0.25, 0.75, foamNoise);
    float totalFoam = clamp(crestFoam * 1.2 + shoreFoam * 1.4, 0.0, 1.0);

    vec3 foamColor = vec3(0.92, 0.96, 1.0) * (1.0 + totalFoam * 0.5);

    // Combine Shading Elements
    vec3 waterColor = waterBody * (1.0 - fresnel * 0.5) + sssColor + moonSpecular * fresnel;
    vec3 finalColor = mix(waterColor, foamColor, totalFoam * 0.88);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`,Si=`
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`,Pi=`
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uMoonPos;
  uniform vec3 uMoonColor;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  // Simple noise for sand grain texture
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 L = normalize(uMoonPos - vWorldPos);
    vec3 H = normalize(L + V);

    // Sand grain micro-texture
    float grain = hash(floor(vWorldPos.xz * 28.0)) * 0.06;
    vec3 drySand = vec3(0.14 + grain, 0.12 + grain, 0.10 + grain);

    // Dynamic wave wash wetness mask: oscillates with shoreline wave period
    float washCycle = sin(vWorldPos.z * 0.45 - uTime * 0.85);
    float isShoreline = smoothstep(14.0, 22.0, vWorldPos.z);
    float wetness = clamp(isShoreline * (0.65 + 0.35 * washCycle), 0.0, 1.0);

    // Wet sand darkens significantly and becomes mirror-reflective
    vec3 wetSand = drySand * 0.32;
    vec3 sandAlbedo = mix(drySand, wetSand, wetness);

    // Mirror-like wet sand specular reflection of moon
    float NdotH = max(0.0, dot(N, H));
    float wetSpec = pow(NdotH, 64.0) * wetness * 1.8;
    vec3 moonGlint = uMoonColor * wetSpec;

    vec3 finalColor = sandAlbedo + moonGlint;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;class Ai{constructor(){o(this,"id","moonlit-shore");o(this,"scene");o(this,"camera");o(this,"bloomPreset",{strength:.82,radius:.52,threshold:.52});o(this,"exposure",1.04);o(this,"oceanMesh",null);o(this,"oceanGeo",null);o(this,"oceanMat",null);o(this,"beachMesh",null);o(this,"beachGeo",null);o(this,"beachMat",null);o(this,"moonMesh",null);o(this,"moonHaloMesh",null);o(this,"starfieldPoints",null);o(this,"disposableGeometries",[]);o(this,"disposableMaterials",[]);o(this,"smoothPointer",new T);this.scene=new X,this.scene.background=new M(264211),this.scene.fog=new Fe(396312,.0095),this.camera=new q(48,window.innerWidth/window.innerHeight,.1,450),this.camera.position.set(0,3.8,26.5)}init(e){const t=new N(0,24,-120),a=new _e(3718648,329745,.45);this.scene.add(a);const r=new $e(14742270,.85);r.position.copy(t),this.scene.add(r),this.oceanGeo=new H(160,160,220,220),this.oceanGeo.rotateX(-Math.PI/2),this.disposableGeometries.push(this.oceanGeo),this.oceanMat=new C({vertexShader:yi,fragmentShader:Mi,uniforms:{uTime:{value:0},uCamPos:{value:this.camera.position},uMoonPos:{value:t},uMoonColor:{value:new N(.92,.96,1)},uDeepWaterColor:{value:new N(.02,.06,.16)},uShallowWaterColor:{value:new N(.04,.18,.28)}}}),this.disposableMaterials.push(this.oceanMat),this.oceanMesh=new S(this.oceanGeo,this.oceanMat),this.oceanMesh.position.set(0,0,-35),this.scene.add(this.oceanMesh),this.beachGeo=new H(160,80,48,48),this.beachGeo.rotateX(-Math.PI/2);const i=this.beachGeo.attributes.position;for(let p=0;p<i.count;p++){const w=i.getY(p);i.setZ(p,-w*.12)}i.needsUpdate=!0,this.beachGeo.computeVertexNormals(),this.disposableGeometries.push(this.beachGeo),this.beachMat=new C({vertexShader:Si,fragmentShader:Pi,uniforms:{uTime:{value:0},uCamPos:{value:this.camera.position},uMoonPos:{value:t},uMoonColor:{value:new N(.92,.96,1)}}}),this.disposableMaterials.push(this.beachMat),this.beachMesh=new S(this.beachGeo,this.beachMat),this.beachMesh.position.set(0,-.6,15),this.scene.add(this.beachMesh);const l=new Ze(5.2,32),n=new B({color:15792639});this.disposableGeometries.push(l),this.disposableMaterials.push(n),this.moonMesh=new S(l,n),this.moonMesh.position.copy(t),this.scene.add(this.moonMesh);const c=new Ze(16.5,32),u=new B({color:12248829,transparent:!0,opacity:.18});this.disposableGeometries.push(c),this.disposableMaterials.push(u),this.moonHaloMesh=new S(c,u),this.moonHaloMesh.position.set(t.x,t.y,t.z-.5),this.scene.add(this.moonHaloMesh);const f=1800,m=new J,v=new Float32Array(f*3);for(let p=0;p<f;p++)v[p*3+0]=(Math.random()-.5)*360,v[p*3+1]=12+Math.random()*95,v[p*3+2]=-80-Math.random()*160;m.setAttribute("position",new A(v,3));const h=new et({color:14742270,size:1.4,transparent:!0,opacity:.65});this.disposableGeometries.push(m),this.disposableMaterials.push(h),this.starfieldPoints=new re(m,h),this.scene.add(this.starfieldPoints)}update(e,t,a){this.smoothPointer.lerp(a,Math.min(1,e*2.5));const r=Math.sin(t*.12)*1.6+this.smoothPointer.x*2.8,i=3.8+Math.sin(t*.15)*.35+Math.cos(t*.062)*.2+this.smoothPointer.y*1.4,l=26.5+Math.sin(t*.08)*.9;this.camera.position.set(r,i,l),this.camera.lookAt(this.smoothPointer.x*3.5,1.2+this.smoothPointer.y*.8,-35),this.camera.rotation.z=Math.sin(t*.04)*.012,this.oceanMat&&(this.oceanMat.uniforms.uTime.value=t,this.oceanMat.uniforms.uCamPos.value.copy(this.camera.position)),this.beachMat&&(this.beachMat.uniforms.uTime.value=t,this.beachMat.uniforms.uCamPos.value.copy(this.camera.position))}resize(e,t){this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix()}setQuality(e){this.oceanMesh&&(this.oceanMesh.visible=e>.1)}getActiveInstanceCount(){return 48400}dispose(){this.oceanMesh&&(this.scene.remove(this.oceanMesh),this.oceanMesh=null),this.beachMesh&&(this.scene.remove(this.beachMesh),this.beachMesh=null),this.moonMesh&&(this.scene.remove(this.moonMesh),this.moonMesh=null),this.moonHaloMesh&&(this.scene.remove(this.moonHaloMesh),this.moonHaloMesh=null),this.starfieldPoints&&(this.scene.remove(this.starfieldPoints),this.starfieldPoints=null);for(const e of this.disposableGeometries)e.dispose();for(const e of this.disposableMaterials)e.dispose();this.disposableGeometries=[],this.disposableMaterials=[],this.scene.clear()}}class Ci{constructor(e,t,a){o(this,"renderer");o(this,"composer");o(this,"renderPass");o(this,"bloomPass");o(this,"cinematicPass");o(this,"outputPass");o(this,"smaaPass");o(this,"activeScene",null);o(this,"activeSceneId");o(this,"animFrameId",null);o(this,"clock",new gt);o(this,"elapsed",0);o(this,"pointer",new T(0,0));o(this,"width",window.innerWidth);o(this,"height",window.innerHeight);o(this,"nativeDpr",Math.min(window.devicePixelRatio||1,2));o(this,"currentDpr",Math.min(window.devicePixelRatio||1,2));o(this,"qualityScale",1);o(this,"frameCounter",0);o(this,"lastFpsSample",performance.now());o(this,"currentFps",60);o(this,"highFpsStreak",0);o(this,"isPaused",!1);o(this,"isOledVoidActive",!1);o(this,"postFX",{bloomMultiplier:1,filmGrain:.024,chromaticAberration:.0018,dynamicResolution:!0});o(this,"onTelemetry");o(this,"tick",()=>{if(this.isOledVoidActive||(this.animFrameId=requestAnimationFrame(this.tick),this.isPaused||!this.activeScene))return;const e=Math.min(this.clock.getDelta(),.05);this.elapsed+=e,this.activeScene.update(e,this.elapsed,this.pointer),this.cinematicPass.uniforms.uTime.value=this.elapsed,this.composer.render(),this.runPerformanceGovernor(performance.now())});o(this,"handleResize",()=>{var e;this.width=window.innerWidth,this.height=window.innerHeight,this.nativeDpr=Math.min(window.devicePixelRatio||1,2),this.currentDpr=Math.min(this.currentDpr,this.nativeDpr),this.renderer.setPixelRatio(this.currentDpr),this.renderer.setSize(this.width,this.height,!1),this.composer.setPixelRatio(this.currentDpr),this.composer.setSize(this.width,this.height),this.bloomPass.setSize(this.width,this.height),this.smaaPass.setSize(Math.floor(this.width*this.currentDpr),Math.floor(this.height*this.currentDpr)),(e=this.activeScene)==null||e.resize(this.width,this.height)});o(this,"handlePointerMove",e=>{this.pointer.x=e.clientX/Math.max(1,window.innerWidth)*2-1,this.pointer.y=-(e.clientY/Math.max(1,window.innerHeight))*2+1});o(this,"handleVisibilityChange",()=>{document.hidden?this.setPaused(!0):this.setPaused(!1)});this.onTelemetry=a,this.activeSceneId=t,this.renderer=new fs({canvas:e,antialias:!0,powerPreference:"high-performance",alpha:!1,stencil:!1}),this.renderer.setPixelRatio(this.currentDpr),this.renderer.setSize(this.width,this.height,!1),this.renderer.toneMapping=wt,this.renderer.toneMappingExposure=1.08,this.renderer.outputColorSpace=yt,this.composer=new As(this.renderer),this.composer.setPixelRatio(this.currentDpr),this.composer.setSize(this.width,this.height);const r=new X,i=new q(50,this.width/this.height,.1,100);this.renderPass=new Cs(r,i),this.composer.addPass(this.renderPass),this.bloomPass=new we(new T(this.width,this.height),1.1,.65,.32),this.composer.addPass(this.bloomPass),this.cinematicPass=new At(Rs),this.composer.addPass(this.cinematicPass),this.outputPass=new Gs,this.composer.addPass(this.outputPass),this.smaaPass=new Ds(Math.floor(this.width*this.currentDpr),Math.floor(this.height*this.currentDpr)),this.composer.addPass(this.smaaPass),window.addEventListener("resize",this.handleResize),window.addEventListener("pointermove",this.handlePointerMove,{passive:!0}),document.addEventListener("visibilitychange",this.handleVisibilityChange),this.loadScene(t)}instantiateScene(e){switch(e){case"fluid-data":return new ct;case"volumetric-megacity":return new Hs;case"event-horizon":return new qs;case"carina-nebula":return new Js;case"binary-pulsar":return new si;case"saturnian-orbit":return new ni;case"deep-void-drift":return new fi;case"midnight-cruise":return new bi;case"moonlit-shore":return new Ai;case"oled-void":return null;default:return new ct}}loadScene(e){if(this.activeSceneId=e,this.activeScene&&(this.activeScene.dispose(),this.activeScene=null,this.renderer.renderLists.dispose()),e==="oled-void"){this.isOledVoidActive=!0,this.stop(),this.renderer.clear(),this.onTelemetry&&this.onTelemetry({fps:0,pixelRatio:this.currentDpr,qualityScale:1,activeInstances:0,drawCalls:0,triangles:0,geometries:0,textures:0,sceneId:"oled-void",isOledVoid:!0});return}this.isOledVoidActive&&(this.isOledVoidActive=!1,this.start());const t=this.instantiateScene(e);t&&(t.init(this.renderer),t.resize(this.width,this.height),t.setQuality(this.qualityScale),this.activeScene=t,this.renderPass.scene=t.scene,this.renderPass.camera=t.camera,this.renderer.toneMappingExposure=t.exposure,this.applyPostFXUniforms(),this.clock.getDelta(),this.animFrameId===null&&this.start())}updatePostFX(e){this.postFX={...this.postFX,...e},this.applyPostFXUniforms(),e.dynamicResolution===!1&&this.setAdaptiveScale(this.nativeDpr,1)}applyPostFXUniforms(){if(this.activeScene){const e=this.activeScene.bloomPreset;this.bloomPass.strength=e.strength*this.postFX.bloomMultiplier,this.bloomPass.radius=e.radius,this.bloomPass.threshold=e.threshold}this.cinematicPass.uniforms.uGrainAmount.value=this.postFX.filmGrain,this.cinematicPass.uniforms.uAberration.value=this.postFX.chromaticAberration}setAdaptiveScale(e,t){var i;const a=Math.abs(e-this.currentDpr)>.02,r=Math.abs(t-this.qualityScale)>.02;a&&(this.currentDpr=e,this.renderer.setPixelRatio(this.currentDpr),this.composer.setPixelRatio(this.currentDpr),this.composer.setSize(this.width,this.height),this.smaaPass.setSize(Math.floor(this.width*this.currentDpr),Math.floor(this.height*this.currentDpr))),r&&(this.qualityScale=t,(i=this.activeScene)==null||i.setQuality(this.qualityScale))}runPerformanceGovernor(e){this.frameCounter++;const t=e-this.lastFpsSample;if(!(t<1e3)){if(this.currentFps=Math.round(this.frameCounter*1e3/t),this.frameCounter=0,this.lastFpsSample=e,this.postFX.dynamicResolution&&!this.isOledVoidActive)if(this.currentFps<45){this.highFpsStreak=0;const a=Math.max(.65,Number((this.currentDpr-.15).toFixed(2))),r=Math.max(.38,Number((this.qualityScale-.15).toFixed(2)));this.setAdaptiveScale(a,r)}else if(this.currentFps>=57){if(this.highFpsStreak++,this.highFpsStreak>=3){this.highFpsStreak=0;const a=Math.min(this.nativeDpr,Number((this.currentDpr+.1).toFixed(2))),r=Math.min(1,Number((this.qualityScale+.1).toFixed(2)));this.setAdaptiveScale(a,r)}}else this.highFpsStreak=0;if(this.onTelemetry&&this.activeScene){const a=this.renderer.info;this.onTelemetry({fps:this.currentFps,pixelRatio:this.currentDpr,qualityScale:this.qualityScale,activeInstances:this.activeScene.getActiveInstanceCount(),drawCalls:a.render.calls,triangles:a.render.triangles,geometries:a.memory.geometries,textures:a.memory.textures,sceneId:this.activeScene.id,isOledVoid:!1})}}}start(){this.isOledVoidActive||this.animFrameId!==null||(this.clock.start(),this.lastFpsSample=performance.now(),this.frameCounter=0,this.tick())}stop(){this.animFrameId!==null&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null)}setPaused(e){this.isPaused=e,!e&&!this.isOledVoidActive&&(this.clock.getDelta(),this.lastFpsSample=performance.now(),this.frameCounter=0)}destroy(){this.stop(),window.removeEventListener("resize",this.handleResize),window.removeEventListener("pointermove",this.handlePointerMove),document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.activeScene&&(this.activeScene.dispose(),this.activeScene=null),this.bloomPass.dispose(),this.cinematicPass.dispose(),this.outputPass.dispose(),this.smaaPass.dispose(),this.composer.dispose(),this.renderer.renderLists.dispose(),this.renderer.dispose()}}const Ti=()=>{const d=P.useRef(null),e=P.useRef(null),t=F(n=>n.activeScene),a=F(n=>n.postFX),r=F(n=>n.brightness),i=F(n=>n.setTelemetry);P.useEffect(()=>{const n=d.current;if(!n)return;const c=new Ci(n,F.getState().activeScene,u=>{i(u)});return c.updatePostFX(F.getState().postFX),e.current=c,()=>{c.destroy(),e.current=null}},[i]),P.useEffect(()=>{var n;(n=e.current)==null||n.loadScene(t)},[t]),P.useEffect(()=>{var n;(n=e.current)==null||n.updatePostFX(a)},[a]);const l=Math.max(0,Math.min(.82,(100-r)/100));return s.jsxs("div",{className:"fixed inset-0 z-0 w-full h-full bg-black overflow-hidden",children:[s.jsx("canvas",{ref:d,className:"block w-full h-full outline-none transition-opacity duration-500",style:{opacity:t==="oled-void"?0:1,display:t==="oled-void"?"none":"block"},"aria-label":"AWAKEN Spatial WebGL Viewport"}),l>.005&&s.jsx("div",{className:"fixed inset-0 pointer-events-none bg-black transition-opacity duration-300",style:{opacity:l}})]})},Ni=({scene:d,isActive:e,index:t,onPreview:a,onLaunch:r})=>{const i=P.useRef(null),l=Pe(0),n=Pe(0),c=Pe(0),u=Pe(0),f={stiffness:260,damping:22,mass:.5},m=Ae(l,f),v=Ae(n,f),h=Ae(c,f),p=Ae(u,f),w=G=>{const D=i.current;if(!D)return;const j=D.getBoundingClientRect(),k=G.clientX-j.left,R=G.clientY-j.top;D.style.setProperty("--mouse-x",`${k}px`),D.style.setProperty("--mouse-y",`${R}px`);const y=k/j.width*2-1,O=R/j.height*2-1;l.set(-O*8.5),n.set(y*8.5),c.set(y*7),u.set(O*7)},b=()=>{a(d.id)},x=()=>{l.set(0),n.set(0),c.set(0),u.set(0)};return s.jsx(L.div,{initial:{opacity:0,y:28,scale:.96},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,scale:.94,filter:"blur(14px)"},transition:{duration:.55,delay:t*.08,ease:[.16,1,.3,1]},style:{perspective:1100},className:"w-full",children:s.jsxs(L.div,{ref:i,layoutId:`spatial-portal-${d.id}`,"data-active":e?"true":"false",onPointerMove:w,onPointerEnter:b,onPointerLeave:x,onClick:()=>r(d.id),whileTap:{scale:.975},style:{rotateX:m,rotateY:v,x:h,y:p,"--accent-primary":d.accentPrimary,"--accent-secondary":d.accentSecondary},className:"spatial-card group cursor-pointer p-6 sm:p-7 flex flex-col justify-between min-h-[310px] sm:min-h-[340px]",children:[s.jsx("div",{className:"absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500",style:{background:`radial-gradient(circle, ${d.accentPrimary}, transparent 70%)`,opacity:e?.34:.14}}),s.jsxs("div",{className:"relative z-10 flex items-center justify-between gap-3",children:[s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"w-2 h-2 rounded-full",style:{backgroundColor:d.accentPrimary,boxShadow:`0 0 12px ${d.accentPrimary}`}}),s.jsx("span",{className:"spatial-micro text-slate-300 font-semibold",children:d.category})]}),s.jsx("span",{className:"spatial-micro px-2.5 py-1 rounded-full border font-semibold backdrop-blur-md",style:{color:d.accentPrimary,borderColor:`${d.accentPrimary}55`,backgroundColor:`${d.accentPrimary}18`},children:d.badge})]}),s.jsxs("div",{className:"relative z-10 my-6 space-y-2.5",children:[s.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-white/70",children:[s.jsx(Je,{className:"w-3.5 h-3.5",style:{color:d.accentPrimary}}),s.jsx("span",{children:d.subtitle})]}),s.jsx("h2",{className:"spatial-card-title",children:d.title}),s.jsx("p",{className:"spatial-card-body",children:d.description})]}),s.jsxs("div",{className:"relative z-10 pt-4 border-t border-white/10 space-y-3",children:[s.jsx("div",{className:"flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300/90",children:s.jsxs("span",{className:"flex items-center gap-1.5",children:[s.jsx(pt,{className:"w-3.5 h-3.5",style:{color:d.accentPrimary}}),d.shaderTech]})}),s.jsxs("div",{className:"flex items-center justify-between gap-3",children:[s.jsxs("span",{className:"flex items-center gap-1.5 text-[11px] font-mono text-emerald-300/90",children:[s.jsx(zt,{className:"w-3.5 h-3.5 text-emerald-400"}),d.oledProfile]}),s.jsxs("div",{className:"spatial-btn-sheen flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-semibold tracking-wide text-white border transition-all duration-300 group-hover:translate-x-0.5",style:{background:e?`linear-gradient(135deg, ${d.accentPrimary}44, ${d.accentSecondary}44)`:"rgba(255, 255, 255, 0.08)",borderColor:e?`${d.accentPrimary}88`:"rgba(255, 255, 255, 0.18)",boxShadow:e?`0 0 24px ${d.accentPrimary}35`:"none"},children:[s.jsx("span",{children:"Enter"}),s.jsx(Et,{className:"w-3.5 h-3.5"})]})]})]})]})})};function Gi(){const d=P.useRef(null),{wakeLockStatus:e,wakeLockPreferred:t,setWakeLockStatus:a,setWakeLockPreferred:r}=F(),i=P.useCallback(async()=>{if(!("wakeLock"in navigator)){a("unsupported");return}try{if(d.current&&!d.current.released){a("active");return}const c=await navigator.wakeLock.request("screen");d.current=c,a("active"),c.addEventListener("release",()=>{d.current===c&&(d.current=null,a("inactive"))})}catch{a("inactive")}},[a]),l=P.useCallback(async()=>{if(d.current){try{await d.current.release()}catch{}d.current=null}a("inactive")},[a]),n=P.useCallback(async()=>{e==="active"?(r(!1),await l()):(r(!0),await i())},[e,r,l,i]);return P.useEffect(()=>{t&&i();const c=()=>{document.visibilityState==="visible"&&F.getState().wakeLockPreferred&&i()};return document.addEventListener("visibilitychange",c),()=>{document.removeEventListener("visibilitychange",c)}},[t,i]),{wakeLockStatus:e,toggleWakeLock:n,requestLock:i,releaseLock:l}}function Di(){const[d,e]=P.useState(!1);P.useEffect(()=>{const i=()=>{e(!!document.fullscreenElement)};return document.addEventListener("fullscreenchange",i),()=>{document.removeEventListener("fullscreenchange",i)}},[]);const t=P.useCallback(async()=>{try{document.documentElement.requestFullscreen&&await document.documentElement.requestFullscreen()}catch(i){console.warn("[Fullscreen] Request failed",i)}},[]),a=P.useCallback(async()=>{try{document.fullscreenElement&&document.exitFullscreen&&await document.exitFullscreen()}catch(i){console.warn("[Fullscreen] Exit failed",i)}},[]),r=P.useCallback(async()=>{d?await a():await t()},[d,t,a]);return{isFullscreen:d,enterFullscreen:t,exitFullscreen:a,toggleFullscreen:r}}class Ri{constructor(){o(this,"ctx",null);o(this,"masterGain",null);o(this,"activeNodes",[]);o(this,"isPlaying",!1)}ensureContext(){if(!this.ctx){const e=window.AudioContext||window.webkitAudioContext;if(!e)return!1;this.ctx=new e,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=0,this.masterGain.connect(this.ctx.destination)}return this.ctx.state==="suspended"&&this.ctx.resume(),!0}start(e,t=.35){if(this.stop(),e==="oled-void"||!this.ensureContext()||!this.ctx||!this.masterGain)return;const a=this.ctx.currentTime;if(this.masterGain.gain.cancelScheduledValues(a),this.masterGain.gain.setValueAtTime(.001,a),this.masterGain.gain.linearRampToValueAtTime(Math.max(0,Math.min(1,t))*.32,a+.9),this.isPlaying=!0,e==="volumetric-megacity"){const r=this.ctx.sampleRate*3,i=this.ctx.createBuffer(1,r,this.ctx.sampleRate),l=i.getChannelData(0);let n=0,c=0,u=0;for(let w=0;w<r;w++){const b=Math.random()*2-1;n=.997*n+b*.05,c=.985*c+b*.07,u=.95*u+b*.14,l[w]=(n+c+u)*.25}const f=this.ctx.createBufferSource();f.buffer=i,f.loop=!0;const m=this.ctx.createBiquadFilter();m.type="bandpass",m.frequency.setValueAtTime(950,a),m.Q.setValueAtTime(.65,a);const v=this.ctx.createOscillator();v.type="sawtooth",v.frequency.setValueAtTime(55,a);const h=this.ctx.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(140,a);const p=this.ctx.createGain();p.gain.setValueAtTime(.18,a),f.connect(m).connect(this.masterGain),v.connect(h).connect(p).connect(this.masterGain),f.start(),v.start(),this.activeNodes.push(f,m,v,h,p)}else if(e==="event-horizon"){const r=[43.65,65.41,87.31,130.81];for(const i of r){const l=this.ctx.createOscillator();l.type="sine",l.frequency.setValueAtTime(i,a);const n=this.ctx.createGain();n.gain.setValueAtTime(i<70?.26:.1,a),l.connect(n).connect(this.masterGain),l.start(),this.activeNodes.push(l,n)}}else if(e==="binary-pulsar"){const r=[58.27,116.54,233.08];for(const i of r){const l=this.ctx.createOscillator();l.type="triangle",l.frequency.setValueAtTime(i,a);const n=this.ctx.createOscillator();n.type="sine",n.frequency.setValueAtTime(3.2,a);const c=this.ctx.createGain();c.gain.setValueAtTime(.12,a);const u=this.ctx.createGain();u.gain.setValueAtTime(.16,a),n.connect(c).connect(u.gain),l.connect(u).connect(this.masterGain),l.start(),n.start(),this.activeNodes.push(l,n,c,u)}}else if(e==="saturnian-orbit"){const r=[55,110,165,277.18];for(const i of r){const l=this.ctx.createOscillator();l.type="sine",l.frequency.setValueAtTime(i,a);const n=this.ctx.createBiquadFilter();n.type="bandpass",n.frequency.setValueAtTime(i*2.2,a),n.Q.setValueAtTime(2.5,a);const c=this.ctx.createGain();c.gain.setValueAtTime(.11,a),l.connect(n).connect(c).connect(this.masterGain),l.start(),this.activeNodes.push(l,n,c)}}else if(e==="carina-nebula"){const r=[52,78,104,156,208];for(const i of r){const l=this.ctx.createOscillator();l.type="sine",l.frequency.setValueAtTime(i,a);const n=this.ctx.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(420,a);const c=this.ctx.createGain();c.gain.setValueAtTime(.12,a),l.connect(n).connect(c).connect(this.masterGain),l.start(),this.activeNodes.push(l,n,c)}}else if(e==="deep-void-drift"){const r=[38.89,58.33,77.78,116.54];for(const i of r){const l=this.ctx.createOscillator();l.type="sine",l.frequency.setValueAtTime(i,a);const n=this.ctx.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(180,a);const c=this.ctx.createGain();c.gain.setValueAtTime(i<50?.28:.08,a),l.connect(n).connect(c).connect(this.masterGain),l.start(),this.activeNodes.push(l,n,c)}}else if(e==="midnight-cruise"){const r=this.ctx.sampleRate*2,i=this.ctx.createBuffer(1,r,this.ctx.sampleRate),l=i.getChannelData(0);for(let m=0;m<r;m++)l[m]=(Math.random()*2-1)*.18;const n=this.ctx.createBufferSource();n.buffer=i,n.loop=!0;const c=this.ctx.createBiquadFilter();c.type="lowpass",c.frequency.setValueAtTime(260,a);const u=this.ctx.createGain();u.gain.setValueAtTime(.18,a),n.connect(c).connect(u).connect(this.masterGain),n.start(),this.activeNodes.push(n,c,u);const f=[146.83,174.61,220,261.63];for(const m of f){const v=this.ctx.createOscillator();v.type="triangle",v.frequency.setValueAtTime(m,a);const h=this.ctx.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(380,a);const p=this.ctx.createGain();p.gain.setValueAtTime(.08,a),v.connect(h).connect(p).connect(this.masterGain),v.start(),this.activeNodes.push(v,h,p)}}else if(e==="moonlit-shore"){const r=this.ctx.sampleRate*4,i=this.ctx.createBuffer(1,r,this.ctx.sampleRate),l=i.getChannelData(0);let n=0;for(let w=0;w<r;w++){const b=Math.random()*2-1;n=(n+.02*b)/1.02,l[w]=n*3.5}const c=this.ctx.createBufferSource();c.buffer=i,c.loop=!0;const u=this.ctx.createBiquadFilter();u.type="lowpass",u.frequency.setValueAtTime(650,a);const f=this.ctx.createOscillator();f.type="sine",f.frequency.setValueAtTime(.125,a);const m=this.ctx.createGain();m.gain.setValueAtTime(.14,a);const v=this.ctx.createGain();v.gain.setValueAtTime(.18,a),f.connect(m).connect(v.gain),c.connect(u).connect(v).connect(this.masterGain),c.start(),f.start(),this.activeNodes.push(c,u,f,m,v);const h=this.ctx.createOscillator();h.type="sine",h.frequency.setValueAtTime(48,a);const p=this.ctx.createGain();p.gain.setValueAtTime(.16,a),h.connect(p).connect(this.masterGain),h.start(),this.activeNodes.push(h,p)}else{const r=[110,164.81,220,329.63,440.5];for(const i of r){const l=this.ctx.createOscillator();l.type="triangle",l.frequency.setValueAtTime(i,a);const n=this.ctx.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(520,a);const c=this.ctx.createGain();c.gain.setValueAtTime(.09,a),l.connect(n).connect(c).connect(this.masterGain),l.start(),this.activeNodes.push(l,n,c)}}}stop(){this.isPlaying=!1;for(const e of this.activeNodes)try{"stop"in e&&typeof e.stop=="function"&&e.stop(),e.disconnect()}catch{}this.activeNodes=[]}getIsPlaying(){return this.isPlaying}}const Qe=new Ri,zi=()=>{const{activeScene:d,setActiveScene:e,isImmersed:t,toggleImmersed:a,setImmersed:r,settingsOpen:i,setSettingsOpen:l,audioEnabled:n,setAudioEnabled:c,telemetry:u,noHud:f,toggleNoHud:m,noHudRevealed:v,strictNoHud:h}=F(),{wakeLockStatus:p,toggleWakeLock:w}=Gi(),{isFullscreen:b,toggleFullscreen:x}=Di(),[G,D]=P.useState(!0),[j,k]=P.useState(!1),R=P.useRef(null),y=St(d),O=d==="oled-void"||u.isOledVoid,Y=f&&(h||!v);P.useEffect(()=>(n?Qe.start(d,.42):Qe.stop(),()=>{F.getState().audioEnabled||Qe.stop()}),[n,d]),P.useEffect(()=>{const E=()=>{D(!0),R.current!==null&&window.clearTimeout(R.current),R.current=window.setTimeout(()=>{F.getState().settingsOpen||D(!1)},3800)};return E(),window.addEventListener("pointermove",E,{passive:!0}),window.addEventListener("keydown",E),()=>{window.removeEventListener("pointermove",E),window.removeEventListener("keydown",E),R.current!==null&&window.clearTimeout(R.current)}},[t]);const U=G||j||i;return s.jsx("div",{className:`fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center max-w-[96vw] transition-all duration-500 ${Y?"opacity-0 pointer-events-none translate-y-4":"opacity-100 pointer-events-none translate-y-0"}`,children:s.jsxs(L.div,{layout:!0,onPointerEnter:()=>k(!0),onPointerLeave:()=>k(!1),onClick:()=>{U||D(!0)},transition:{layout:{type:"spring",stiffness:380,damping:32}},style:{"--island-accent":y.accentPrimary,"--island-accent-2":y.accentSecondary},className:`dynamic-island pointer-events-auto flex items-center rounded-full ${U?"px-2.5 sm:px-3.5 py-2 gap-1.5 sm:gap-2.5":"px-4 py-2 gap-3 cursor-pointer"}`,children:[s.jsxs(L.div,{layout:"position",className:"flex items-center gap-2 pl-1",children:[s.jsx("span",{className:"w-2.5 h-2.5 rounded-full flex-shrink-0",style:{backgroundColor:y.accentPrimary,boxShadow:`0 0 14px ${y.accentPrimary}`}}),!U&&s.jsxs(L.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"flex items-center gap-2.5 whitespace-nowrap",children:[s.jsx("span",{className:"font-display font-semibold text-xs text-white tracking-wide",children:y.title}),s.jsx("span",{className:"w-1 h-1 rounded-full bg-white/30"}),O?s.jsxs("span",{className:"font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1",children:[s.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"}),"0% GPU • IDLE"]}):s.jsxs("span",{className:"font-mono text-[10px] text-cyan-300 font-semibold",children:[u.fps," FPS"]}),p==="active"&&s.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]",title:"Screen Wake Lock Active"})]})]}),s.jsx(je,{mode:"popLayout",children:U&&s.jsxs(L.div,{initial:{opacity:0,scale:.92},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.92},transition:{duration:.22},className:"flex items-center gap-1.5 sm:gap-2",children:[s.jsx("div",{className:"hidden md:flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 max-w-[48vw] xl:max-w-[56vw] 2xl:max-w-none overflow-x-auto scrollbar-none flex-nowrap",children:ke.map(E=>{const K=E.id===d;return s.jsxs("button",{onClick:()=>e(E.id),className:`relative px-2.5 py-1 rounded-full text-[11px] font-display font-semibold transition-colors cursor-pointer whitespace-nowrap ${K?"text-white":"text-slate-300/75 hover:text-white"}`,children:[K&&s.jsx(L.span,{layoutId:"islandActiveScenePill",className:"absolute inset-0 rounded-full border",style:{backgroundColor:`${E.accentPrimary}28`,borderColor:`${E.accentPrimary}88`,boxShadow:`0 0 16px ${E.accentPrimary}35`},transition:{type:"spring",stiffness:420,damping:30}}),s.jsxs("span",{className:"relative z-10 flex items-center gap-1.5",children:[E.id==="oled-void"&&s.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400"}),E.title]})]},E.id)})}),s.jsx("div",{className:"hidden md:block w-px h-5 bg-white/15"}),s.jsx(L.button,{whileHover:{scale:1.04},whileTap:{scale:.95},onClick:a,className:"spatial-btn-sheen flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold tracking-wide text-white border cursor-pointer whitespace-nowrap",style:{background:t?"rgba(255, 255, 255, 0.12)":`linear-gradient(135deg, ${y.accentPrimary}, ${y.accentSecondary})`,borderColor:t?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.35)",boxShadow:t?"none":`0 0 22px ${y.accentPrimary}55`},children:t?s.jsxs(s.Fragment,{children:[s.jsx(Lt,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"Spaces"})]}):s.jsxs(s.Fragment,{children:[s.jsx(jt,{className:"w-3.5 h-3.5 fill-white stroke-none"}),s.jsx("span",{children:"Launch"})]})}),s.jsx(L.button,{whileHover:{scale:1.04},whileTap:{scale:.95},onClick:()=>void w(),className:`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer whitespace-nowrap ${p==="active"?"bg-emerald-500/20 border-emerald-400/70 text-emerald-200 wake-halo-active":"bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12"}`,title:"Toggle Screen Wake Lock API",children:p==="active"?s.jsxs(s.Fragment,{children:[s.jsx(Ft,{className:"w-3.5 h-3.5 text-emerald-300"}),s.jsx("span",{className:"hidden sm:inline",children:"Wake Lock"})]}):s.jsxs(s.Fragment,{children:[s.jsx(Ot,{className:"w-3.5 h-3.5 text-slate-400"}),s.jsx("span",{className:"hidden sm:inline",children:"Unlocked"})]})}),s.jsx(L.button,{whileHover:{scale:1.08},whileTap:{scale:.92},onClick:()=>c(!n),className:`p-2 rounded-full border transition-colors cursor-pointer ${n?"bg-cyan-500/20 border-cyan-400/60 text-cyan-200":"bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12"}`,title:"Toggle Spatial Ambient Audio","aria-label":"Toggle Ambient Audio",children:n?s.jsx(kt,{className:"w-3.5 h-3.5"}):s.jsx(Wt,{className:"w-3.5 h-3.5"})}),s.jsx(L.button,{whileHover:{scale:1.08},whileTap:{scale:.92},onClick:()=>{m(),!f&&!t&&r(!0)},className:`p-2 rounded-full border transition-colors cursor-pointer ${f?"bg-amber-500/25 border-amber-400/80 text-amber-200":"bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12"}`,title:"No-HUD / Pure Cinema Mode (H)","aria-label":"No-HUD / Pure Cinema Mode",children:f?s.jsx(vt,{className:"w-3.5 h-3.5 text-amber-300"}):s.jsx(xt,{className:"w-3.5 h-3.5"})}),s.jsx(L.button,{whileHover:{scale:1.08},whileTap:{scale:.92},onClick:x,className:"p-2 rounded-full bg-white/[0.06] border border-white/12 text-slate-300 hover:text-white hover:bg-white/12 transition-colors cursor-pointer",title:"Toggle Fullscreen (F)","aria-label":"Toggle Fullscreen",children:b?s.jsx(Bt,{className:"w-3.5 h-3.5 text-cyan-300"}):s.jsx(Ht,{className:"w-3.5 h-3.5"})}),s.jsx(L.button,{whileHover:{scale:1.08,rotate:28},whileTap:{scale:.92},onClick:()=>l(!i),className:`p-2 rounded-full border transition-colors cursor-pointer ${i?"bg-white/20 border-white/40 text-white":"bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12"}`,title:"Render Pipeline Settings (S)","aria-label":"Render Settings",children:s.jsx(It,{className:"w-3.5 h-3.5"})}),O?s.jsxs("div",{className:"hidden lg:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-black/40 border border-emerald-500/40 font-mono text-[10px] text-emerald-300 whitespace-nowrap",children:[s.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"}),s.jsx("span",{className:"font-bold text-emerald-300",children:"0% GPU • IDLE"}),s.jsx("span",{className:"text-white/25",children:"•"}),s.jsx("span",{className:"text-emerald-400/80",children:"RAF STOPPED"})]}):s.jsxs("div",{className:"hidden lg:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-black/35 border border-white/10 font-mono text-[10px] text-slate-300 whitespace-nowrap",children:[s.jsxs("span",{className:u.fps<45?"text-amber-300 font-bold":"text-emerald-300 font-bold",children:[u.fps," FPS"]}),s.jsx("span",{className:"text-white/25",children:"•"}),s.jsxs("span",{className:"text-cyan-300",children:[u.pixelRatio.toFixed(1),"x"]}),s.jsx("span",{className:"text-white/25",children:"•"}),s.jsxs("span",{children:[(u.activeInstances/1e3).toFixed(0),"K"]})]})]},"island-controls")})]})})},Ei=()=>{const{settingsOpen:d,setSettingsOpen:e,postFX:t,updatePostFX:a,showClockInImmersion:r,setShowClockInImmersion:i,clock24h:l,setClock24h:n,brightness:c,setBrightness:u,telemetry:f,strictNoHud:m,setStrictNoHud:v,oledClockOpacity:h,setOledClockOpacity:p,activeScene:w}=F(),b=w==="oled-void"||f.isOledVoid;return s.jsx(je,{children:d&&s.jsxs(L.div,{initial:{opacity:0,y:18,scale:.94,filter:"blur(12px)"},animate:{opacity:1,y:0,scale:1,filter:"blur(0px)"},exit:{opacity:0,y:14,scale:.94,filter:"blur(10px)"},transition:{type:"spring",stiffness:360,damping:28},className:"spatial-popover fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,440px)] rounded-3xl p-5 sm:p-6 text-xs text-white",children:[s.jsxs("div",{className:"flex items-center justify-between pb-3.5 border-b border-white/10",children:[s.jsxs("div",{className:"flex items-center gap-2.5",children:[s.jsx("div",{className:"w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-300/35 flex items-center justify-center text-cyan-300",children:s.jsx(Ut,{className:"w-4 h-4"})}),s.jsxs("div",{children:[s.jsx("h3",{className:"font-display font-bold text-sm tracking-tight text-white",children:"Spatial Render Pipeline"}),s.jsx("p",{className:"font-mono text-[10px] text-slate-400 uppercase tracking-wider",children:"ACESFilmic • UnrealBloom • SMAA"})]})]}),s.jsx("button",{onClick:()=>e(!1),className:"p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer","aria-label":"Close Settings",children:s.jsx(Vt,{className:"w-4 h-4"})})]}),s.jsxs("div",{className:"mt-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1",children:[s.jsxs("div",{className:"space-y-3",children:[s.jsxs("div",{className:"flex items-center gap-1.5 spatial-micro text-cyan-300 font-semibold",children:[s.jsx(Je,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"Post-Processing Shaders"})]}),s.jsxs("div",{className:"space-y-1.5",children:[s.jsxs("div",{className:"flex justify-between font-mono text-[11px]",children:[s.jsx("span",{className:"text-slate-300",children:"UnrealBloom Radiance"}),s.jsxs("span",{className:"text-white font-semibold",children:[t.bloomMultiplier.toFixed(2),"x"]})]}),s.jsx("input",{type:"range",min:.25,max:1.75,step:.05,value:t.bloomMultiplier,onChange:x=>a({bloomMultiplier:Number(x.target.value)}),className:"w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"})]}),s.jsxs("div",{className:"space-y-1.5",children:[s.jsxs("div",{className:"flex justify-between font-mono text-[11px]",children:[s.jsx("span",{className:"text-slate-300",children:"Radial Chromatic Aberration"}),s.jsx("span",{className:"text-white font-semibold",children:(t.chromaticAberration*1e3).toFixed(1)})]}),s.jsx("input",{type:"range",min:0,max:.005,step:2e-4,value:t.chromaticAberration,onChange:x=>a({chromaticAberration:Number(x.target.value)}),className:"w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"})]}),s.jsxs("div",{className:"space-y-1.5",children:[s.jsxs("div",{className:"flex justify-between font-mono text-[11px]",children:[s.jsx("span",{className:"text-slate-300",children:"Organic Film Grain"}),s.jsxs("span",{className:"text-white font-semibold",children:[Math.round(t.filmGrain*1e3),"%"]})]}),s.jsx("input",{type:"range",min:0,max:.06,step:.002,value:t.filmGrain,onChange:x=>a({filmGrain:Number(x.target.value)}),className:"w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"})]})]}),s.jsxs("div",{className:"pt-3 border-t border-white/10 space-y-3",children:[s.jsxs("div",{className:"flex items-center gap-1.5 spatial-micro text-violet-300 font-semibold",children:[s.jsx(Xt,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"Hardware Governor & Display"})]}),s.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[s.jsxs("div",{children:[s.jsx("div",{className:"font-medium text-white",children:"Dynamic Resolution (< 45 FPS)"}),s.jsx("div",{className:"text-[11px] text-slate-400",children:"Auto-scales DPR & InstancedMesh count"})]}),s.jsx("input",{type:"checkbox",checked:t.dynamicResolution,onChange:x=>a({dynamicResolution:x.target.checked}),className:"w-4 h-4 accent-cyan-400 rounded cursor-pointer"})]}),s.jsxs("div",{className:"space-y-1.5",children:[s.jsxs("div",{className:"flex justify-between font-mono text-[11px]",children:[s.jsxs("span",{className:"text-slate-300 flex items-center gap-1.5",children:[s.jsx(qt,{className:"w-3.5 h-3.5 text-amber-300"})," Display Dimmer"]}),s.jsxs("span",{className:"text-white font-semibold",children:[c,"%"]})]}),s.jsx("input",{type:"range",min:20,max:100,step:1,value:c,onChange:x=>u(Number(x.target.value)),className:"w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-amber-400"})]}),s.jsxs("label",{className:"flex items-center justify-between cursor-pointer",children:[s.jsxs("span",{className:"flex items-center gap-1.5 text-slate-200",children:[s.jsx(Yt,{className:"w-3.5 h-3.5 text-cyan-300"})," Immersive Clock"]}),s.jsx("input",{type:"checkbox",checked:r,onChange:x=>i(x.target.checked),className:"w-4 h-4 accent-cyan-400 rounded cursor-pointer"})]}),r&&s.jsxs("label",{className:"flex items-center justify-between cursor-pointer pl-5",children:[s.jsx("span",{className:"text-slate-300",children:"24-Hour Format"}),s.jsx("input",{type:"checkbox",checked:l,onChange:x=>n(x.target.checked),className:"w-4 h-4 accent-cyan-400 rounded cursor-pointer"})]}),s.jsxs("div",{className:"space-y-1.5 pt-1",children:[s.jsxs("div",{className:"flex justify-between font-mono text-[11px]",children:[s.jsx("span",{className:"text-slate-300",children:"OLED Void Clock Opacity"}),s.jsxs("span",{className:"text-white font-semibold",children:[Math.round(h*100),"%"]})]}),s.jsx("input",{type:"range",min:.15,max:.6,step:.05,value:h,onChange:x=>p(Number(x.target.value)),className:"w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-emerald-400"})]}),s.jsxs("label",{className:"flex items-center justify-between cursor-pointer pt-1",children:[s.jsxs("div",{children:[s.jsxs("div",{className:"font-medium text-white flex items-center gap-1.5",children:[s.jsx(xt,{className:"w-3.5 h-3.5 text-amber-300"})," Strict No-HUD Mode"]}),s.jsx("div",{className:"text-[11px] text-slate-400",children:"Stay hidden until H or Esc (no reveal on mouse move)"})]}),s.jsx("input",{type:"checkbox",checked:m,onChange:x=>v(x.target.checked),className:"w-4 h-4 accent-amber-400 rounded cursor-pointer"})]})]}),s.jsxs("div",{className:"pt-3 border-t border-white/10",children:[s.jsxs("div",{className:"flex items-center gap-1.5 spatial-micro text-emerald-300 font-semibold mb-2",children:[s.jsx(pt,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"Engine Lifecycle & Telemetry"})]}),b?s.jsxs("div",{className:"p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-[11px] text-emerald-200 space-y-1.5",children:[s.jsxs("div",{className:"flex items-center justify-between font-bold text-emerald-300",children:[s.jsxs("span",{className:"flex items-center gap-1.5",children:[s.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-pulse"}),"OLED VOID (IDLE)"]}),s.jsx("span",{children:"0% GPU"})]}),s.jsx("p",{className:"text-[10px] text-emerald-400/80 leading-relaxed",children:"WebGL canvas unmounted • RAF animation cancelled • Zero GPU memory allocations • 9-zone burn-in protection active."})]}):s.jsxs("div",{className:"grid grid-cols-2 gap-2 font-mono text-[11px]",children:[s.jsxs("div",{className:"px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between",children:[s.jsx("span",{className:"text-slate-400",children:"FPS"}),s.jsx("span",{className:"text-emerald-300 font-bold",children:f.fps})]}),s.jsxs("div",{className:"px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between",children:[s.jsx("span",{className:"text-slate-400",children:"DPR"}),s.jsxs("span",{className:"text-cyan-300 font-bold",children:[f.pixelRatio.toFixed(2),"x"]})]}),s.jsxs("div",{className:"px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between",children:[s.jsx("span",{className:"text-slate-400",children:"Geometries"}),s.jsx("span",{className:"text-white font-bold",children:f.geometries})]}),s.jsxs("div",{className:"px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between",children:[s.jsx("span",{className:"text-slate-400",children:"Textures"}),s.jsx("span",{className:"text-white font-bold",children:f.textures})]})]})]})]})]})})},Li=()=>{const{showClockInImmersion:d,clock24h:e,isImmersed:t,noHud:a,activeScene:r}=F(),[i,l]=P.useState(""),[n,c]=P.useState(""),[u,f]=P.useState({x:0,y:0});return P.useEffect(()=>{const m=()=>{const h=new Date;let p=h.getHours();const w=String(h.getMinutes()).padStart(2,"0");let b="";e||(b=p>=12?" PM":" AM",p=p%12||12),l(`${String(p).padStart(2,"0")}:${w}${b}`),c(h.toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"}))};m();const v=window.setInterval(m,1e3);return()=>window.clearInterval(v)},[e]),P.useEffect(()=>{const m=window.setInterval(()=>{f({x:Math.round((Math.random()-.5)*44),y:Math.round((Math.random()-.5)*28)})},9e4);return()=>window.clearInterval(m)},[]),!t||!d||a||r==="oled-void"?null:s.jsxs(L.div,{initial:{opacity:0,y:-12},animate:{opacity:.72,x:u.x,y:u.y},exit:{opacity:0,y:-12},transition:{duration:1.2,ease:[.16,1,.3,1]},className:"fixed top-9 left-9 sm:top-12 sm:left-12 z-20 pointer-events-none select-none",children:[s.jsx("div",{className:"font-display font-light tracking-[-0.04em] text-white/90 leading-none",style:{fontSize:"clamp(2.5rem, 5.2vw, 4.75rem)",textShadow:"0 4px 28px rgba(0, 0, 0, 0.72)"},children:i}),s.jsx("div",{className:"font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-white/60 mt-1.5",style:{textShadow:"0 2px 14px rgba(0, 0, 0, 0.8)"},children:n})]})},ft=[{x:"7vw",y:"8vh",align:"left"},{x:"42vw",y:"8vh",align:"center"},{x:"68vw",y:"8vh",align:"right"},{x:"7vw",y:"42vh",align:"left"},{x:"42vw",y:"42vh",align:"center"},{x:"68vw",y:"42vh",align:"right"},{x:"7vw",y:"72vh",align:"left"},{x:"42vw",y:"72vh",align:"center"},{x:"68vw",y:"72vh",align:"right"}],ji=()=>{const{clock24h:d,oledClockOpacity:e,activeScene:t}=F(),[a,r]=P.useState(0),[i,l]=P.useState(()=>{const c=new Date;let u=c.getHours();const f=String(c.getMinutes()).padStart(2,"0");let m="";return d||(m=u>=12?" PM":" AM",u=u%12||12),{time:`${String(u).padStart(2,"0")}:${f}${m}`,date:c.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})}});if(P.useEffect(()=>{let c=null;const u=()=>{const h=new Date;let p=h.getHours();const w=String(h.getMinutes()).padStart(2,"0");let b="";d||(b=p>=12?" PM":" AM",p=p%12||12),l({time:`${String(p).padStart(2,"0")}:${w}${b}`,date:h.toLocaleDateString(void 0,{weekday:"short",month:"short",day:"numeric"})})},f=new Date,m=(60-f.getSeconds())*1e3-f.getMilliseconds()+25,v=window.setTimeout(()=>{u(),c=window.setInterval(u,6e4)},m);return()=>{window.clearTimeout(v),c!==null&&window.clearInterval(c)}},[d]),P.useEffect(()=>{const c=window.setInterval(()=>{r(u=>(u+1)%ft.length)},21e4);return()=>window.clearInterval(c)},[]),t!=="oled-void")return null;const n=ft[a];return s.jsx("div",{className:"fixed inset-0 bg-[#000000] z-10 pointer-events-none select-none overflow-hidden",style:{backgroundColor:"#000000"},children:s.jsxs(L.div,{animate:{left:n.x,top:n.y,opacity:e},transition:{duration:3.2,ease:[.22,1,.36,1]},className:"absolute flex flex-col",style:{textAlign:n.align,alignItems:n.align==="center"?"center":n.align==="right"?"flex-end":"flex-start"},children:[s.jsx("div",{className:"font-display font-extralight tracking-tight text-white leading-none tabular-nums",style:{fontSize:"clamp(2.75rem, 6vw, 5.5rem)"},children:i.time}),s.jsx("div",{className:"font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-white/70 mt-2",children:i.date}),s.jsxs("div",{className:"flex items-center gap-2 mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-emerald-400/60",children:[s.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse"}),s.jsxs("span",{children:["0% GPU • IDLE • OLED SAFEGUARD #",a+1,"/9"]})]})]})})},Fi=()=>{const{activeScene:d,setActiveScene:e,isImmersed:t,expandingSceneId:a,launchSceneWithFlip:r,setImmersed:i,toggleImmersed:l,settingsOpen:n,setSettingsOpen:c,telemetry:u,noHud:f,setNoHud:m,toggleNoHud:v,noHudRevealed:h,setNoHudRevealed:p,strictNoHud:w}=F(),[b,x]=P.useState(!1),G=P.useRef(null);P.useEffect(()=>{if(!t&&!f){x(!1);return}let R=window.setTimeout(()=>x(!0),2e3);const y=()=>{x(!1),window.clearTimeout(R),R=window.setTimeout(()=>x(!0),2e3)};return window.addEventListener("pointermove",y,{passive:!0}),()=>{window.removeEventListener("pointermove",y),window.clearTimeout(R)}},[t,f]);const D=P.useCallback(()=>{!f||w||(p(!0),G.current!==null&&window.clearTimeout(G.current),G.current=window.setTimeout(()=>{p(!1)},3e3))},[f,w,p]);P.useEffect(()=>{if(!f){p(!1),G.current!==null&&window.clearTimeout(G.current);return}return window.addEventListener("pointermove",D,{passive:!0}),window.addEventListener("pointerdown",D,{passive:!0}),()=>{window.removeEventListener("pointermove",D),window.removeEventListener("pointerdown",D),G.current!==null&&window.clearTimeout(G.current)}},[f,D,p]),P.useEffect(()=>{const R=y=>{var O,Y,U,E;y.target instanceof HTMLInputElement||y.target instanceof HTMLTextAreaElement||(y.code==="Space"?(y.preventDefault(),l()):y.key==="Escape"?f?m(!1):n?c(!1):document.fullscreenElement?(O=document.exitFullscreen)==null||O.call(document):t&&i(!1):y.key==="h"||y.key==="H"?(y.preventDefault(),v()):y.key==="s"||y.key==="S"?c(!n):y.key==="f"||y.key==="F"?(y.preventDefault(),document.fullscreenElement?(E=document.exitFullscreen)==null||E.call(document).catch(K=>{console.warn("[Fullscreen] exit error:",K)}):(U=(Y=document.documentElement).requestFullscreen)==null||U.call(Y).catch(K=>{console.warn("[Fullscreen] request error:",K)})):y.key==="1"?e("fluid-data"):y.key==="2"?e("volumetric-megacity"):y.key==="3"?e("event-horizon"):y.key==="4"?e("carina-nebula"):y.key==="5"?e("binary-pulsar"):y.key==="6"?e("saturnian-orbit"):y.key==="7"?e("deep-void-drift"):y.key==="8"?e("midnight-cruise"):y.key==="9"?e("moonlit-shore"):y.key==="0"&&e("oled-void"))};return window.addEventListener("keydown",R),()=>window.removeEventListener("keydown",R)},[t,n,f,i,c,l,v,m,e]);const j=St(d),k=d==="oled-void"||u.isOledVoid;return s.jsxs("div",{className:`relative w-full h-full overflow-hidden bg-black text-white select-none ${b?"spatial-hide-cursor":""}`,children:[s.jsx(Ti,{}),s.jsx(ji,{}),s.jsx(je,{children:f&&h&&!w&&s.jsxs(L.button,{initial:{opacity:0,y:-24},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{duration:.3,ease:"easeOut"},onClick:()=>m(!1),className:"fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 border border-white/20 backdrop-blur-xl shadow-2xl text-xs font-mono font-medium text-white/90 hover:bg-white/10 hover:border-white/35 transition-all cursor-pointer",children:[s.jsx(vt,{className:"w-3.5 h-3.5 text-cyan-300"}),s.jsx("span",{children:"EXIT NO-HUD (H / ESC)"})]})}),s.jsx(Kt,{children:s.jsx(je,{mode:"sync",children:!t&&!f?s.jsxs(L.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0,transition:{duration:.52,ease:[.16,1,.3,1]}},transition:{duration:.45,ease:[.16,1,.3,1]},className:"spatial-backdrop-layer fixed inset-0 z-10 flex flex-col justify-between overflow-y-auto px-5 sm:px-10 lg:px-14 pt-6 sm:pt-9 pb-28",children:[s.jsxs("header",{className:"w-full max-w-7xl mx-auto flex items-center justify-between gap-4",children:[s.jsxs("div",{className:"flex items-center gap-3",children:[s.jsx("div",{className:"w-9 h-9 rounded-2xl flex items-center justify-center border border-white/25 backdrop-blur-xl shadow-lg",style:{background:`linear-gradient(135deg, ${j.accentPrimary}55, ${j.accentSecondary}55)`,boxShadow:`0 0 28px ${j.accentPrimary}44`},children:s.jsx(Je,{className:"w-4 h-4 text-white"})}),s.jsxs("div",{className:"flex items-baseline gap-2",children:[s.jsx("span",{className:"font-display font-bold text-base sm:text-lg tracking-tight text-white",style:{textShadow:"0 2px 14px rgba(0,0,0,0.75)"},children:"AWAKEN"}),s.jsx("span",{className:"spatial-micro text-white/65 font-semibold",children:"SPATIAL 5.0"})]})]}),s.jsxs("div",{className:"flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl font-mono text-[11px] text-white/85",children:[s.jsx(Qt,{className:"w-3.5 h-3.5 animate-pulse",style:{color:j.accentPrimary}}),s.jsx("span",{className:"hidden sm:inline text-white/60",children:"LIVE CANVAS:"}),s.jsx("span",{className:"font-semibold text-white",children:j.title}),s.jsx("span",{className:"text-white/25 hidden md:inline",children:"•"}),k?s.jsx("span",{className:"hidden md:inline text-emerald-400 font-semibold",children:"0% GPU • IDLE"}):s.jsxs("span",{className:"hidden md:inline text-emerald-300 font-semibold",children:[u.fps," FPS"]})]})]}),s.jsxs("main",{className:"w-full max-w-7xl mx-auto my-auto py-8 sm:py-10 space-y-8 sm:space-y-10",children:[s.jsxs("div",{className:"max-w-2xl space-y-3",children:[s.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md",children:[s.jsx("span",{className:"w-1.5 h-1.5 rounded-full",style:{backgroundColor:j.accentPrimary,boxShadow:`0 0 10px ${j.accentPrimary}`}}),s.jsx("span",{className:"spatial-micro text-white/85 font-semibold",children:"ACESFilmic WebGL2 • UnrealBloom • SMAA • Adaptive DPR • OLED Void"})]}),s.jsx("h1",{className:"spatial-hero-title",children:"Spatial Ambient Environments"}),s.jsx("p",{className:"spatial-subtitle",children:"Hover any portal to shift the live WebGL atmosphere beneath the glass. Click a portal to expand seamlessly into pure fullscreen immersion. Press [H] for Pure Cinema No-HUD mode."})]}),s.jsx("section",{"aria-label":"Flagship Spatial Environments",className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6",children:ke.map((R,y)=>s.jsx(Ni,{scene:R,isActive:d===R.id,index:y,onPreview:e,onLaunch:r},R.id))})]}),s.jsx("div",{className:"h-4"})]},"spatial-browser-layer"):a&&s.jsx(L.div,{layoutId:`spatial-portal-${a}`,initial:{opacity:.72,borderRadius:28},animate:{opacity:0,borderRadius:0,transition:{layout:{duration:.55,ease:[.16,1,.3,1]},opacity:{duration:.62,delay:.08,ease:"easeOut"},borderRadius:{duration:.45}}},exit:{opacity:0},className:"fixed inset-0 z-10 pointer-events-none border border-white/25 bg-white/[0.08] backdrop-blur-2xl"},`flip-expansion-${a}`)})}),s.jsx(Li,{}),s.jsx(Ei,{}),s.jsx(zi,{})]})};xs.createRoot(document.getElementById("root")).render(s.jsx(Zt.StrictMode,{children:s.jsx(Fi,{})}));
