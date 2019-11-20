import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Row, message } from 'antd';
import * as Nominatim from 'nominatim-browser';
import GoogleMaps from './components/GoogleMaps';
import styles from './style.less';
import firebase from '@/utils/firebase';

@connect(({ map }) => ({
  map,
}))
class Map extends Component {
  state = {
    markers: [],
    location1: '',
    location2: '',
    interdictions: [],
  };

  componentDidMount() {
    try {
      const interdictionsRef = firebase.database().ref('interdictions');
      console.log(interdictionsRef);
      interdictionsRef.on('value', snapshot => {
        const value = snapshot.val();
        let newState = [];

        Object.keys(value).forEach(o => {
          const data = value[o];
          console.log(data);
          newState.push(data);
        });

        newState = newState.filter(o => o.status === true);

        this.setState(state => ({
          interdictions: [...state.interdictions, ...newState],
        }));
      });
    } catch (error) {
      console.error(error);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboardAnalysis/clear',
    });
    cancelAnimationFrame(this.reqRef);
    clearTimeout(this.timeoutId);
  }

  getAddressByCoordinate = (lat, lon) =>
    Nominatim.reverseGeocode({ lat, lon, addressdetails: true })
      .then(res => res.display_name)
      .catch(error => {
        throw error;
      });

  render() {
    const { location1, location2, interdictions = [] } = this.state;

    return (
      <>
        <Row style={{ height: 'fit-content' }}>
          <Col sm={24} md={24}>
            <GoogleMaps interdictions={interdictions} />
          </Col>
        </Row>
      </>
    );
  }
}

export default Map;
