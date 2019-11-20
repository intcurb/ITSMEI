import React, { Component } from 'react';
import { DatePicker, Col, Form, Row, Input, Button, Icon } from 'antd';
import { connect } from 'dva';

const { RangePicker } = DatePicker;

const FormItem = Form.Item;

// eslint-disable-next-line react/prefer-stateless-function
@connect(({ user, map }) => ({
  currentUser: user.currentUser,
  map,
}))
@Form.create()
class Menu extends Component {
  handleSubmit = () => {
    const { form, onSubmit } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();

      onSubmit(fieldsValue);
    });
  };

  render() {
    const { form, values, currentUser } = this.props;

    return (
      <div style={{ padding: '20px 10px 10px 10px' }}>
        <Row gutter={12} type="flex" justify="center" align="middle">
          <Col sm={24} md={24}>
            <Row gutter={12}>
              <Col sm={24} md={24}>
                {form.getFieldDecorator('location1', {
                  initialValue: values.location1,
                })(<Input placeholder="Ponto de Partida" prefix={<Icon type="environment" />} />)}
              </Col>
            </Row>
            <br />
            <Row gutter={12}>
              <Col sm={24} md={24}>
                {form.getFieldDecorator('location2', {
                  initialValue: values.location2,
                })(<Input placeholder="Ponto de Destino" prefix={<Icon type="environment" />} />)}
              </Col>
            </Row>
          </Col>
        </Row>
        <br />
        <Row gutter={12}>
          <Col sm={24} md={24}>
            <FormItem>
              {form.getFieldDecorator('description', {
                initialValue: values.description,
              })(<Input placeholder="Descrição" />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col sm={24} md={24}>
            <FormItem>
              {form.getFieldDecorator('interval', {
                initialValue: [values.beginDate, values.endDate],
              })(
                <RangePicker
                  showTime={{ format: 'HH:mm' }}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY HH:mm"
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col sm={24} md={24}>
            <FormItem>
              {form.getFieldDecorator('user', {
                initialValue: values.user || currentUser.name,
              })(<Input placeholder="Criado Por" disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col sm={24} md={24}>
            <Button onClick={this.handleSubmit} type="primary" block>
              Adicionar Interdição
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Menu;
