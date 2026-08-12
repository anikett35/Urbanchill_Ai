"use client";

import * as React from 'react';
import Map, { Source, Layer, FillExtrusionLayer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Read the mapbox token from env
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// 3D Building Extrusion Layer configuration
const buildingLayer: FillExtrusionLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': '#aaa',

    // use an 'interpolate' expression to add a smooth transition effect to the
    // buildings as the user zooms in
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.6
  }
};

export default function Map3D() {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-500 p-4 text-center rounded-lg border border-slate-200">
        <p>
          <strong>Mapbox Token Missing</strong><br/>
          Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env file to view the map.
        </p>
      </div>
    );
  }

  return (
    <Map
      initialViewState={{
        latitude: 40.7128,
        longitude: -74.0060, // NYC
        zoom: 15.5,
        bearing: -17.6,
        pitch: 45
      }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: '100%', height: '100%' }}
    >
      <Layer {...buildingLayer} />
    </Map>
  );
}
