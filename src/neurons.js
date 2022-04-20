import './App.scss';
import * as THREE from 'three';
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Neuron } from './neuron';
import { LayerHandle } from './layerhandle';
import { ModelLoader } from './modelloader';
import configuration from './configfiles/configuration.json';

const baseRealtimeShimUrl = configuration.services.realtimeShim.host + ':' + configuration.services.realtimeShim.wsport;

const Neurons = () => {
  let { model } = useParams();
  console.log(model);

  const tetrahedron = new THREE.TetrahedronBufferGeometry(1);
  
  const neurons = useRef([]);
  const layerHandles = useRef([]);
  const [initialized, setInitialized] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    const loader = new ModelLoader(model);
    loader.Initialize((models, handles) => {
      //console.log(models);
      neurons.current = models;
      layerHandles.current = handles;
      socket.current = new WebSocket('ws://' + baseRealtimeShimUrl);
      socket.current.onopen = function () {
        console.log(`Opened websocket with ws://${baseRealtimeShimUrl}`);
        setInitialized(true);
      };

      socket.current.onmessage = function (message) {
        //console.log(`Received websocket message ${message.data}`);
        const spikes = JSON.parse(message.data);
        spikes.forEach(spike => {
          const index = spike[1];
          //console.log(`Triggering neuron ${index} of ${neurons.current.length}`);
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

  const ToggleLayer = (range) => {
    for (var index = range[0]; index < range[1]; index++) {
      if (index < neurons.current.length) {
        if(neurons.current[index].trigger) {
          neurons.current[index].trigger(true);
        }
      }
    };
  }

  const captureTrigger = (trigger, index) => {
    neurons.current[index].trigger = trigger;
  }

  return (
    <>
      {layerHandles.current.map((props, index) => (
        <LayerHandle position={props.position} color={props.color} key={index} index={index} range={props.range} tetrahedron={tetrahedron} handleClick={ToggleLayer} />
      ))}
      {neurons.current.map((props, index) => (
        <Neuron position={props.position} color={props.color} mountTrigger={captureTrigger} key={index} index={index} tetrahedron={tetrahedron} handleClick={SendSpike} />
      ))}
    </>
  )
}

export { Neurons };
