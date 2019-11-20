import React, { Component } from 'react';

const { Marker, DirectionsRenderer } = require('react-google-maps');

const convertLatLngToObj = (lat, lng) => ({
  lat,
  lng,
});

class DirectionRenderComponent extends Component {
  state = {
    directions: null,
    wayPoints: null,
    currentLocation: null,
  };

  delayFactor = 0;

  componentDidMount() {
    const { origin = {}, destination = {} } = this.props;

    const startLoc = `${origin.lat}, ${origin.lng}`;
    const destinationLoc = `${destination.lat}, ${destination.lng}`;
    this.getDirections(startLoc, destinationLoc);
    // this.setCurrentLocation();
  }

  async getDirections(startLoc, destinationLoc, wayPoints = []) {
    const waypts = [];
    if (wayPoints.length > 0) {
      waypts.push({
        location: new window.google.maps.LatLng(wayPoints[0].lat, wayPoints[0].lng),
        stopover: true,
      });
    }
    const directionService = new window.google.maps.DirectionsService();
    directionService.route(
      {
        origin: startLoc,
        destination: destinationLoc,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
            wayPoints: result.routes[0].overview_path.filter((elem, index) => index % 30 === 0),
          });
        } else if (status === window.google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
          this.delayFactor += 0.2;
          // if (this.delayFactor <= 10) this.delayFactor = 0.2;
          setTimeout(() => {
            this.getDirections(startLoc, destinationLoc, wayPoints);
          }, this.delayFactor * 200);
        } else {
          console.error(`error fetching directions ${JSON.stringify(result)}`);
        }
      },
    );
  }

  setCurrentLocation = () => {
    let count = 0;
    const refreshIntervalId = setInterval(() => {
      const locations = this.state.wayPoints;
      if (locations) {
        if (count <= locations.length - 1) {
          const currentLocation = convertLatLngToObj(
            locations[count].lat(),
            locations[count].lng(),
          );
          this.setState({ currentLocation });

          const wayPts = [];
          wayPts.push(currentLocation);
          const startLoc = `${this.props.origin.lat}, ${this.props.origin.lng}`;
          const destinationLoc = `${this.props.destination.lat}, ${this.props.destination.lng}`;
          this.delayFactor = 0;
          this.getDirections(startLoc, destinationLoc, wayPts);
          count += 1;
        } else {
          clearInterval(refreshIntervalId);
        }
      }
    }, 1000);
  };

  render() {
    let originMarker = null;
    let destinationMarker = null;
    const { directions } = this.state;

    if (directions && this.props.index) {
      originMarker = (
        <Marker
          defaultLabel={this.props.index.toString()}
          defaultIcon={null}
          position={{
            lat: this.props.origin.lat,
            lng: this.props.origin.lng,
          }}
        />
      );
      destinationMarker = (
        <Marker
          label={this.props.index.toString()}
          defaultIcon={null}
          position={{
            lat: this.props.destination.lat,
            lng: this.props.destination.lng,
          }}
        />
      );
    }

    return (
      <div>
        {originMarker}
        {destinationMarker}
        {this.state.currentLocation && (
          <Marker
            label={this.props.index.toString()}
            position={{
              lat: this.state.currentLocation.lat,
              lng: this.state.currentLocation.lng,
            }}
          />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                storkeColor: this.props.storkeColor,
                strokeOpacity: 0.4,
                strokeWeight: 4,
              },
              preserveViewport: true,
              suppressMarkers: true,
              icon: { scale: 3 },
            }}
          />
        )}
      </div>
    );
  }
}

export default DirectionRenderComponent;
