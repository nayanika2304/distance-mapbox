import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker';

const MAPBOX_TOKEN ='pk.eyJ1IjoibmIyMzA0IiwiYSI6ImNrdXppeHp0bjIxc3oyd3A2dDlyM2Y4dWgifQ.AN1SVHhfWVXUYtAhOjCbOg'

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = MAPBOX_TOKEN


const App = () =>{
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77.034);
  const [lat, setLat] = useState(38.899);
  //const [bounds,setBounds] = useState(null)
  //const [zoom, setZoom] = useState(9);
  const urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
  const profiles = [{name:'Walking',value:'walking'},{name:'Cycling',value:'cycling'},{name:'Driving',value:'driving'}]
  const durations = [{name:'10 min',value:'10'},{name:'20 min',value:'20'},{name:'30 min',value:'30'}]
  const [profile,setProfile] = useState('cycling'); // Set the default routing profile
  const [duration,setDuration] = useState('10')
  const marker = new mapboxgl.Marker({
    color: '#314ccd'
  });


  async function getIso() {
    const query = await fetch(
      `${urlBase}${profile}/${lng},${lat}?contours_minutes=${duration}&polygons=true&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    );
    const data = await query.json();

    //var coordinates = data.features[0].geometry.coordinates[0]

    // setBounds(coordinates.reduce(function (bounds, coord) {
    //   return bounds.extend(coord);
    // }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])))
    
    if(map.current.getSource('iso')){
      map.current.getSource('iso').setData(data);
      
    }
    
  }

  const add_marker= (event) =>  {
    var coordinates = event.lngLat;
    //console.log('Lng:', coordinates.lng, 'Lat:', coordinates.lat);
    setLat(coordinates.lat)
    setLng(coordinates.lng)
    marker.setLngLat(coordinates).addTo(map.current);
    
  }

  //intialize the map
  useEffect(() => {
    if (!map.current)  // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 12
    });
    const lngLat = {
      lon: lng,
      lat: lat
    };
    marker.setLngLat(lngLat).addTo(map.current);
  },[map]);

  useEffect(() => {
      if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        //setZoom(map.current.getZoom().toFixed(8));
      });
      map.current.on('load', () => {
        // When the map loads, add the source and layer
        map.current.addSource('iso', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
      
        map.current.addLayer(
          {
            id: 'isoLayer',
            type: 'fill',
            // Use "iso" as the data source for this layer
            source: 'iso',
            layout: {},
            paint: {
              // The fill color for the layer is set to a light purple
              'fill-color': '#5a3fc0',
              'fill-opacity': 0.3
            }
          },
          'poi-label'
        );
      
        // Make the API call
        getIso();
      
        map.current.on('click',add_marker)
      });

      getIso();
      
    },[duration,profile,lng,lat]);
    
    const onHandleTravelModeChange = (e)  =>{
      setProfile(e.target.value)
    }

    const onHandleDurationChange = (e)  =>{
      setDuration(e.target.value)
    }
    


    return (
      <div>
        <div className="sidebar">
          <div className='fl my24 mx24 py24 px24 bg-gray-faint round'>
            <form id='params'>
              <h4 className='txt-m txt-bold mb6'>Choose a travel mode:</h4>
              <div className='mb12 mr12 toggle-group align-center' onChange={e => onHandleTravelModeChange(e)}>
                {profiles.map((travel_mode,i) =>{
                  return (
                    <div key={i}>
                      <label className='toggle-container'>
                        <input name='profile' type='radio' value={travel_mode.value} defaultChecked={profile === travel_mode.value}/>
                        <div className='toggle toggle--active-null toggle--null'>{travel_mode.name}</div>
                      </label>
                    </div>
                  )
                })}
              </div>
              <h4 className='txt-m txt-bold mb6'>Choose a maximum duration:</h4>
              <div className='mb12 mr12 toggle-group align-center' onChange={e => onHandleDurationChange(e)}>
                {durations.map((duration_time,i) =>{
                  return (
                    <div key={i}>
                      <label className='toggle-container'>
                      <input name='duration' type='radio' value={duration_time.value} defaultChecked={duration === duration_time.value}/>
                      <div className='toggle toggle--active-null toggle--null'>{duration_time.name}</div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </form>
          </div>
        </div>
        <div ref={mapContainer} className="map-container" />
      </div>
    );
}

export default App;
