import React, { Component } from 'react';
import { compose, withProps } from 'recompose';
import isEqual from 'lodash/isEqual';
import { withScriptjs, withGoogleMap, GoogleMap as GMap, Marker } from 'react-google-maps';
import { G_API_URL } from '@/utils/constants';
import DirectionRenderComponent from './DirectionRenderComponent';

class GoogleMaps extends Component {
  constructor(props) {
    super(props);

    const { interdictions = [] } = props;

    this.state = {
      marker: false,
      markers: [],
      locations: interdictions,
      defaultZoom: 5,
      center: {
        lat: -21.135524,
        lng: -48.972712,
      },
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { interdictions = [] } = nextProps;
    const nextState = {
      locations: [],
    };

    if (prevState.locations.map(o => o.new === true)) {
      const location = prevState.locations.find(o => o.new === true);
      if (typeof location !== 'undefined') {
        delete location.new;
        nextState.locations.push(location);
      }
    }

    if (!isEqual(prevState.locations, interdictions)) {
      nextState.locations = [...nextState.locations, ...interdictions];
    }

    if (nextState.locations.length > 0) {
      return nextState;
    }
    return null;
  }

  render() {
    const { marker, markers, locations, defaultZoom, center } = this.state;
    return (
      <GMap
        defaultZoom={defaultZoom}
        center={center}
        defaultCenter={new window.google.maps.LatLng(23.21632, 72.641219)}
      >
        {marker &&
          markers.map((o, i) => (
            <Marker
              key={i} // eslint-disable-line react/no-array-index-key
              label={i.toString()}
              position={{ lat: o.lat, lng: o.lng }}
            />
          ))}
        {locations.map((o, i) => (
          <DirectionRenderComponent
            key={i} // eslint-disable-line react/no-array-index-key
            index={i + 1}
            strokeColor="#000"
            from={o.from}
            to={o.to}
          />
        ))}
      </GMap>
    );
  }
}

// eslint-disable-next-line no-class-assign
GoogleMaps = compose(
  withProps({
    googleMapURL: G_API_URL,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '100vh' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  withScriptjs,
  withGoogleMap,
)(GoogleMaps);

export default GoogleMaps;
