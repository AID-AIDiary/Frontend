import React, { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import SearchBox from './SearchBox'; 


const apiOptions = {
  apiKey: process.env.MAP_API,
  version: "beta"
};

const Map = () => {
  const [currentLocation, setCurrentLocation] = useState({
    center: { lat: 0, lng: 0 },
    tilt: 0,
    heading: 0,
    zoom: 18
  });
  const [map, setMap] = useState(null);

  useEffect(() => {
    const getUserLocation = () => {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            resolve({ lat: latitude, lng: longitude });
          }, reject, { timeout: 10000 });
        } else {
          reject(new Error('Geolocation is not supported by this browser.'));
        }
      });
    };

    const initMapAndWebGLOverlay = async (location) => {
      const mapDiv = document.getElementById("map");
      const apiLoader = new Loader(apiOptions);
      await apiLoader.load();
      
      const map = new window.google.maps.Map(mapDiv, {
        center: location,
        zoom: 18,
        mapId: "a149ab8fb8ef2d69"
      });

      //setMap(map); //SearchBox 

      let scene, renderer, camera, loader, gltfObject;
      const webGLOverlayView = new window.google.maps.WebGLOverlayView();
      
      webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        loader = new GLTFLoader();
        const url = 
          "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";
        
        loader.load(url, (gltf) => {
          gltfObject = gltf.scene;
          gltfObject.rotation.y = Math.PI; // y축 주위로 180도 회전
          scene.add(gltfObject);
        });
      };
      
      webGLOverlayView.onDraw = ({ gl, transformer }) => {
        const latLngAltitudeLiteral = {
          lat: location.lat,
          lng: location.lng,
          altitude: 80
        };

        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

        if (gltfObject) {
          // Calculate the scale factor based on map zoom level
          const zoomLevel = map.getZoom();
          const scaleFactor = 10 / Math.pow(1.8, zoomLevel - 18); // Adjust the scale factor as needed
          gltfObject.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      };

      webGLOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });

        renderer.autoClear = false;

        loader.manager.onLoad = () => {
          renderer.setAnimationLoop(() => {
            map.moveCamera({
              "tilt": currentLocation.tilt,
              "heading": currentLocation.heading,
              "zoom": currentLocation.zoom
            });

            if (currentLocation.tilt < 67.5) {
              currentLocation.tilt += 0.5
            } else if (currentLocation.heading <= 360) {
              currentLocation.heading += 0.2;
            } else {
              renderer.setAnimationLoop(null)
            }
          });
        }
      }
      webGLOverlayView.setMap(map);
    };

    getUserLocation().then(location => {
      setCurrentLocation({
        ...currentLocation,
        center: { lat: location.lat, lng: location.lng }
      });
      initMapAndWebGLOverlay(location);
    }).catch(error => {
      console.error("Error getting user's location: ", error);
      // Initialize map with a default location if geolocation fails
      initMapAndWebGLOverlay(currentLocation.center);
    });

  }, []);

  return (
    <div>
      {map && <SearchBox map={map} />}
      <div id="map" style={{ width: '100%', height: '100vh' }}></div>
    </div>
  );
};

export default Map;
