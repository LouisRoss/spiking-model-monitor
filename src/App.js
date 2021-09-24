import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { softShadows, MeshWobbleMaterial, OrbitControls, useHelper } from '@react-three/drei';
import { useSpring, a } from "@react-spring/three";

import { Neuron } from './neuron';
import { ModelLoader } from './modelloader';

import './App.scss';

softShadows();
/*
const SpinningMesh = ({position, args, color, speed}) => {
  const mesh = useRef()
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.04));

  const [expand, setExpand] = useState(false);
  const props = useSpring({
    scale: expand ? [1.4,1.4,1.4]: [1,1,1],
  })

  return (
    <a.mesh onClick={() => setExpand(!expand)} scale={props.scale} castShadow position={position} ref={mesh}>
      <boxBufferGeometry attach='geometry' args={args} />
      <MeshWobbleMaterial attach='material' color={color} speed={speed} factor={0.6} />
    </a.mesh>
  );
}
*/

const FiringTest = ({ trigger }) => {
  var nexti = 0;
  var frameCount = 30;

  useFrame((state, delta) => {
    frameCount--;
    if (frameCount > 0) return;

    frameCount = 10;
    nexti = trigger(nexti);
  });

  return (
    <></>
  )
}

const Light = () => {
  const lightRef = useRef();
  useHelper(lightRef, THREE.DirectionalLightHelper, 1);

  return (
    <>
      <ambientLight intensity={0.3}/>
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
  const tetrahedron = new THREE.TetrahedronBufferGeometry(1);
  
  const [neurons, setNeurons] = useState([]);

  useEffect(() => {
    const loader = new ModelLoader('layer');
    loader.LoadConfiguration(models => { console.log(models); setNeurons(models); });
  }, []);

  const TriggerNeuron = (index) => {
    if (index < neurons.length) {
      if(neurons[index].trigger) {
        neurons[index].trigger();
      }
    }

    index++;
    if (index >= neurons.length) { 
      index = 0;
    }

    return index;
  }

  const captureTrigger = (trigger, index) => {
    neurons[index].trigger = trigger;
  }


  return (
    <>
      <Canvas shadows colorManagement camera={{position: [-5, 2, 50], fov: 100}}>
        <FiringTest trigger={TriggerNeuron}/>
        <Light />
        <ShadowPlane />
        {neurons.map((props, index) => (
          <Neuron position={props.position} color={props.color} mountTrigger={captureTrigger} key={index} index={index} tetrahedron={tetrahedron} />
        ))}
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default App;
