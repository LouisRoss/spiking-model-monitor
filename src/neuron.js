import * as THREE from 'three';
import React, { useRef } from 'react';

const Neuron = ({position, index, color, tetrahedron, mountTrigger, handleClick}) => {
  const fireColor = new THREE.Color(/*1, 0, 0*/color);
  const baseColor = new THREE.Color(/*color*/0x144414);
  const normalOpacity = 0.3;
  const mesh1Ref = useRef();
  //const mesh2Ref = useRef();

  const trigger = () => {
    mesh1Ref.current.color = fireColor;
    //mesh2Ref.current.color = fireColor;
    mesh1Ref.current.opacity = 1.0;
    //mesh2Ref.current.opacity = 1.0;
    setTimeout(() => {
      mesh1Ref.current.color = baseColor;
      //mesh2Ref.current.color = baseColor;
      mesh1Ref.current.opacity = normalOpacity;
      //mesh2Ref.current.opacity = normalOpacity;
      }, 17 * 4);
  }

  mountTrigger(trigger, index);

  const xRot = Math.atan(1 / Math.sqrt(2));
  const yRot = 2 * Math.PI / 8;
  const zRot = /*Math.PI/2*/0;

  return (
    <mesh onClick={() => { handleClick(index); }} position={position} >
      <mesh castShadow geometry={tetrahedron} rotation={[-xRot, zRot, yRot]}>
        <meshStandardMaterial attach='material' color={baseColor} opacity={normalOpacity} transparent ref={mesh1Ref} />
      </mesh>
    </mesh>
  );
}
/* 
<mesh castShadow geometry={tetrahedron} rotation={[-xRot, -zRot, yRot]}>
<meshStandardMaterial attach='material' color={baseColor} opacity={normalOpacity} transparent ref={mesh2Ref} />
</mesh>
 */
export { Neuron };
