import './App.scss';
import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { useParams, BrowserRouter as Router, Route } from 'react-router-dom';
import { Canvas, useFrame } from "@react-three/fiber";
import { softShadows, MeshWobbleMaterial, OrbitControls, useHelper } from '@react-three/drei';

import { Neurons } from './neurons';
import configuration from './configfiles/configuration.json';
const baseRealtimeShimUrl = configuration.services.realtimeShim.host + ':' + configuration.services.realtimeShim.wsport;


softShadows();
/*
const FiringTest = ({ trigger }) => {
  var nexti = 0;
  var frameCount = 30;

  useFrame(() => {
    frameCount--;
    if (frameCount > 0) return;

    frameCount = 10;
    nexti = trigger(nexti);
  });

  return (
    <>
    </>
  )
}
*/

const Light = () => {
  const lightRef = useRef();
  useHelper(lightRef, THREE.DirectionalLightHelper, 1);
/* 
  <directionalLight 
  ref={lightRef}
  castShadow
  position={[0, 10, 10]}
  intensity={1.5 }
  shadow-mapSize-width={1024}
  shadow-mapSize-height={1024}
  shadow-camera-far={50}
  shadow-camera-left={-10}
  shadow-camera-right={10}
  shadow-camera-bottom={-10}
/>
 */
return (
    <>
      <ambientLight intensity={0.3}/>
      <pointLight position={[-10, 0, -20]} intensity='.5' />
      <pointLight position={[0, -10, 0]} intensity='1.5' />
    </>
  );
}

const ShadowPlane = () => {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 200]} args={[1000, 1000]} >
      <planeBufferGeometry attach='geometry' args={[20, 500]} />
      <shadowMaterial attach='material' opacity={0.8}/>
    </mesh>
  );
}

const App = () => {
/* 
  <ShadowPlane />
 */
  return (
    <>
      <section>
      <div>
      <div>
      <Canvas shadows colorManagement camera={{position: [-5, 2, 50], fov: 100}}>
        <Router>
          <Route path='/:model' children={<Neurons />} />
        </Router>
        <Light />
        <OrbitControls />
      </Canvas>
      </div>
      </div>
      </section>
    </>
  );
}

export default App;
