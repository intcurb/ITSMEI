import { Form, Input, Modal, Select } from 'antd';

import React from 'react';
import { isValidObject, isValidArray, isValidDate, isValidString } from '@/utils/isValidVariable';
import moment from 'moment';

const FormItem = Form.Item;
const { Option } = Select;

const CreateForm = props => {
  const {
    modalVisible,
    form,
    handleAdd,
    handleUpdate,
    handleModalVisible,
    action,
    values = {},
  } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();

      if (action === 'new') {
        handleAdd(fieldsValue);
      } else {
        handleUpdate(fieldsValue);
      }
    });
  };


  let originStreet;
  let destinationStreet;

  if (isValidObject(values.origin)) {
    originStreet = values.origin.street;
  }
  if (isValidObject(values.destination)) {
    destinationStreet = values.destination.street;
  }

  return (
    <Modal
      destroyOnClose
      title="Interdição"
      style={{ top: 20 }}
      width={1000}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Descrição">
        {form.getFieldDecorator('description', {
          initialValue: values.description,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Ponto Inicial">
        {form.getFieldDecorator('origin.street', {
          initialValue: originStreet,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Ponto Final">
        {form.getFieldDecorator('destination.street', {
          initialValue: destinationStreet,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Data Inicial">
        {form.getFieldDecorator('beginDate', {
          initialValue: isValidDate(values.beginDate) ? moment(values.beginDate).format('DD/MM/YYYY HH:mm:ss') : '',
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Data Final">
        {form.getFieldDecorator('endDate', {
          initialValue: isValidDate(values.endDate) ? moment(values.endDate).format('DD/MM/YYYY HH:mm:ss') : '',
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Criado Por">
        {form.getFieldDecorator('user', {
          initialValue: values.user,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" disabled />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Criado Em">
        {form.getFieldDecorator('createdAt', {
          initialValue: isValidString(values.createdAt) ? moment(values.createdAt).format('DD/MM/YYYY HH:mm:ss') : '',
        })(<Input disabled />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create()(CreateForm);
