import * as THREE from 'three';
import React, { useRef } from 'react';

const LayerHandle = ({position, index, range, color, tetrahedron, handleClick}) => {
  const fireColor = new THREE.Color(/*1, 0, 0*/color);
  const baseColor = new THREE.Color(/*color*/0xc46424);
  const normalOpacity = 1.0;
  const mesh1Ref = useRef();
  //const mesh2Ref = useRef();

  const handle = new THREE.BoxGeometry(3.8, 0.5, 1.8);

  const xRot = Math.atan(1 / Math.sqrt(2));
  const yRot = 2 * Math.PI / 8;
  const zRot = /*Math.PI/2*/0;
/*
      <mesh castShadow geometry={handle} rotation={[-xRot, zRot, yRot]}>
*/
  return (
    <mesh onClick={() => { handleClick(range); }} position={position} >
      <mesh castShadow geometry={handle} >
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
export { LayerHandle };
