import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { useParams, BrowserRouter as Router, Route } from 'react-router-dom';
import { Canvas, useFrame } from "@react-three/fiber";
import { softShadows, MeshWobbleMaterial, OrbitControls, useHelper } from '@react-three/drei';

import { Neuron } from './neuron';
import { ModelLoader } from './modelloader';
import { Configuration } from './configuration/configuration.js';

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

const Neurons = () => {
  let { model } = useParams();
  console.log(model);

  const tetrahedron = new THREE.TetrahedronBufferGeometry(1);
  
  const neurons = useRef([]);
  const [initialized, setInitialized] = useState(false);
  const baseRealtimeShimUrl = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    /*
    Configuration.getInstance(config => {
      const configuration = config;
      const realtimeShimHost = configuration.services.realtimeShim.host;
      const realtimeShimPort = configuration.services.realtimeShim.port;
      baseRealtimeShimUrl.current = 'http://' + realtimeShimHost + ':' + realtimeShimPort;
      console.log(`Using ${baseRealtimeShimUrl.current} to fetch realtime records`);
    });
    */
  
    const loader = new ModelLoader(model);
    loader.LoadConfiguration(models => {
      console.log(models);
      neurons.current = models;
      // TODO - get address from configuration.
      socket.current = new WebSocket('ws://192.168.1.150:5003');
      socket.current.onopen = function () {
        console.log(`Opened websocket with ws://192.168.1.150:5003`);
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
