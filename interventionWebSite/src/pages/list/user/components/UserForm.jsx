// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react/jsx-boolean-value */
import { Form, Input, Modal, Select } from 'antd';

import React from 'react';

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
  return (
    <Modal
      destroyOnClose
      title="Cadastro de Usuários"
      style={{ top: 20 }}
      width={600}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Nome">
        {form.getFieldDecorator('nome', {
          initialValue: values.nome,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="CNPJ">
        {form.getFieldDecorator('cnpj', {
          initialValue: values.cnpj,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Login">
        {form.getFieldDecorator('login', {
          initialValue: values.login,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(<Input placeholder="Por favor insira" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Senha">
        {form.getFieldDecorator('senha', {
          initialValue: values.senha,
          rules: [
            { required: true, message: 'Campo requerido!' },
            { min: 6, message: 'Digite uma senha com mais de 6 caracteres!' }
          ]
        })(<Input.Password placeholder="Por favor insira" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Privilégios">
        {form.getFieldDecorator('currentAuthority', {
          initialValue: values.currentAuthority,
          rules: [{ required: true, message: 'Campo requerido!' }],
        })(
          <Select style={{ width: '100%' }} placeholder="Selecione">
            <Option value="user">User</Option>
            <Option value="admin">Root</Option>
          </Select>,
        )}
      </FormItem>
      {action === 'update' && (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Status">
          {form.getFieldDecorator('status', {
            initialValue: values.status,
          })(
            <Select style={{ width: '100%' }} placeholder="Selecione">
              <Option value={true}>Ativo</Option>
              <Option value={false}>Desativado</Option>
            </Select>,
          )}
        </FormItem>
      )}
    </Modal>
  );
};

export default Form.create()(CreateForm);
