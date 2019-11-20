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
      defaultZoom: 14,
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

  handleDblClick = e => {
    const { onDblClick } = this.props;

    this.setState(
      state => ({
        marker: true,
        markers: [...state.markers, { lat: e.latLng.lat(), lng: e.latLng.lng() }],
      }),
      () => {
        const { markers } = this.state;

        if (onDblClick) {
          onDblClick(markers);
        }

        if (markers.length === 2) {
          const location = {
            origin: {
              lat: markers[0].lat,
              lng: markers[0].lng,
              street: '1',
            },
            destination: {
              lat: markers[1].lat,
              lng: markers[1].lng,
              street: '2',
            },
            description: '',
            beginDate: '',
            endDate: '',
            new: true,
          };

          this.setState(state => ({
            marker: false,
            markers: [],
            locations: [...state.locations, location],
          }));
        }
      },
    );
  };

  getDirectionsValue = direction => {
    this.props.onGetValues(direction);
  }

  render() {
    const { marker, markers, locations, defaultZoom, center } = this.state;
    return (
      <GMap
        defaultZoom={defaultZoom}
        center={center}
        onDblClick={e => this.handleDblClick(e)}
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
        {locations.map((o, i) => {
          console.log(o);
          return (
            <DirectionRenderComponent
              key={i} // eslint-disable-line react/no-array-index-key
              index={i + 1}
              strokeColor="#000"
              status={o.status}
              origin={o.origin}
              destination={o.destination}
              onMarkerClick={() => this.getDirectionsValue(o) }
            />
          )
        })}
      </GMap>
    );
  }
}

// eslint-disable-next-line no-class-assign
GoogleMaps = compose(
  withProps({
    googleMapURL: G_API_URL,
    loadingElement: <div style={{ height: '100%' }} />,
    containerElement: <div style={{ height: '570px' }} />,
    mapElement: <div style={{ height: '100%' }} />,
  }),
  withScriptjs,
  withGoogleMap,
)(GoogleMaps);

export default GoogleMaps;
