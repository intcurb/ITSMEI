import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Row, message } from 'antd';
import * as Nominatim from 'nominatim-browser';
import GoogleMaps from './components/GoogleMaps';
import Menu from './components/Menu';
import styles from './style.less';
import firebase from '@/utils/firebase';
import moment from 'moment';

@connect(({ map }) => ({
  map,
}))
class Map extends Component {
  state = {
    markers: [],
    location1: '',
    location2: '',
    beginDate: null,
    endDate: null,
    user: null,
    description: null,
    interdictions: [],
  };

  componentDidMount() {
    try {
      const interdictionsRef = firebase.database().ref('interdictions');
      interdictionsRef.on('value', snapshot => {
        const value = snapshot.val();
        const newState = [];

        if (value !== null) {
          Object.keys(value).forEach(o => {
            const data = value[o];
            newState.push(data);
          });


          console.log(newState);
          this.setState(state => ({
            interdictions: [...state.interdictions, ...newState],
          }));
        }
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

  handleDblClick = async (markers = []) => {
    const location1 = await this.getAddressByCoordinate(markers[0].lat, markers[0].lng).then(
      value => value,
    );
    let location2 = '';

    if (markers.length === 2) {
      location2 = await this.getAddressByCoordinate(markers[1].lat, markers[1].lng);
    }

    this.setState({ markers, location1, location2 });
  };

  handleAddInterdiction = values => {
    const { markers: m, location1, location2 } = this.state;
    const { dispatch } = this.props;
    console.log(values);
    const data = {
      origin: {
        street: location1,
        lat: m[0].lat,
        lng: m[0].lng,
      },
      destination: {
        street: location2,
        lat: m[1].lat,
        lng: m[1].lng,
      },
      description: values.description,
      status: false,
      beginDate: values.interval[0].format('YYYY-MM-DD HH:mm:ss'),
      endDate: values.interval[1].format('YYYY-MM-DD HH:mm:ss'),
    };

    dispatch({
      type: 'map/addInterdiction',
      payload: data,
      callback: () => {
        message.success('Interdição adicionada com sucesso');
      },
    });
  };

  getAddressByCoordinate = (lat, lon) =>
    Nominatim.reverseGeocode({ lat, lon, addressdetails: true })
      .then(res => res.display_name)
      .catch(error => {
        throw error;
      });

  setValues = values => {
    const { description, beginDate, endDate, user } = values;

    this.setState({
      location1: values.origin.street,
      location2: values.destination.street,
      description,
      beginDate: moment(beginDate),
      endDate: moment(endDate),
      user,
    })
  }

  render() {
    const { location1, location2, interdictions = [], description = null, beginDate = null, endDate = null, user = null } = this.state;
    const values = { location1, location2, description, beginDate, endDate, user };

    return (
      <>
        <Row style={{ height: 'fit-content' }}>
          <Col className={styles.menu} sm={7} md={7}>
            <Menu onSubmit={this.handleAddInterdiction} values={values} />
          </Col>
          <Col sm={17} md={17}>
            <GoogleMaps interdictions={interdictions} onDblClick={this.handleDblClick} onGetValues={this.setValues} />
          </Col>
        </Row>
      </>
    );
  }
}

export default Map;
