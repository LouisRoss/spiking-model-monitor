import './App.scss';
import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { useParams, BrowserRouter as Router, Route } from 'react-router-dom';
import { Canvas, useFrame } from "@react-three/fiber";
import { softShadows, MeshWobbleMaterial, OrbitControls, useHelper } from '@react-three/drei';

import { Neuron } from './neuron';
import { ModelLoader } from './modelloader';
import configuration from './configfiles/configuration.json';
const baseRealtimeShimUrl = configuration.services.realtimeShim.host + ':' + configuration.services.realtimeShim.wsport;


softShadows();

const Neurons = () => {
  let { model } = useParams();
  console.log(model);

  const tetrahedron = new THREE.TetrahedronBufferGeometry(1);
  
  const neurons = useRef([]);
  const [initialized, setInitialized] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    const loader = new ModelLoader(model);
    loader.LoadConfiguration(models => {
      console.log(models);
      neurons.current = models;
      socket.current = new WebSocket('ws://' + baseRealtimeShimUrl);
      socket.current.onopen = function () {
        console.log(`Opened websocket with ws://${baseRealtimeShimUrl}`);
        setInitialized(true);
      };

      socket.current.onmessage = function (message) {
        console.log(`Received websocket message ${message.data}`);
        const spikes = JSON.parse(message.data);
        spikes.forEach(spike => {
          const index = spike[1];
          console.log(`Triggering neuron ${index} of ${neurons.current.length}`);
          if (index < neurons.current.length) {
            if(neurons.current[index].trigger) {
              neurons.current[index].trigger();
            }
          }
        });
      };

      socket.current.onerror = function (error) {
          console.log('WebSocket error: ' + error);
      };
    });
  }, [model]);

  const SendSpike = (index) => {
    if (initialized) {
      console.log(`Sending spike for neuron ${index}`);

      if (socket.current) {
        socket.current.send(JSON.stringify([[0, index]]));
      }
    }
  }

  const captureTrigger = (trigger, index) => {
    neurons.current[index].trigger = trigger;
  }

  return (
    <>
      {neurons.current.map((props, index) => (
        <Neuron position={props.position} color={props.color} mountTrigger={captureTrigger} key={index} index={index} tetrahedron={tetrahedron} handleClick={SendSpike} />
      ))}
    </>
  )
}

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
      <Canvas shadows colorManagement camera={{position: [-5, 2, 50], fov: 100}}>
        <Router>
          <Route path='/:model' children={<Neurons />} />
        </Router>
        <Light />
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default App;
