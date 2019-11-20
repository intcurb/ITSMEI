import { Button, DatePicker, Form, Input, Modal, Radio, Select, Steps } from 'antd';
import React, { Component } from 'react';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

class UpdateForm extends Component {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  formLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 13 },
  };

  constructor(props) {
    super(props);

    this.state = {
      formVals: {
        name: props.values.name,
        desc: props.values.desc,
        key: props.values.key,
        target: '0',
        template: '0',
        type: '1',
        time: '',
        frequency: 'month',
      },
      currentStep: 0,
    };
  }

  handleNext = currentStep => {
    const { form, handleUpdate } = this.props;
    const { formVals: oldValue } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const formVals = { ...oldValue, ...fieldsValue };
      this.setState(
        {
          formVals,
        },
        () => {
          if (currentStep < 2) {
            this.forward();
          } else {
            handleUpdate(formVals);
          }
        },
      );
    });
  };

  backward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep - 1,
    });
  };

  forward = () => {
    const { currentStep } = this.state;
    this.setState({
      currentStep: currentStep + 1,
    });
  };

  renderContent = (currentStep, formVals) => {
    const { form } = this.props;
    if (currentStep === 1) {
      return [
        <FormItem key="target" {...this.formLayout} label="Objeto de monitoramento">
          {form.getFieldDecorator('target', {
            initialValue: formVals.target,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">Quadro 1</Option>
              <Option value="1">Quadro 2</Option>
            </Select>,
          )}
        </FormItem>,
        <FormItem key="template" {...this.formLayout} label="Modelo de regra">
          {form.getFieldDecorator('template', {
            initialValue: formVals.template,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="0">Modelo de regra 1</Option>
              <Option value="1">Modelo de regra 2</Option>
            </Select>,
          )}
        </FormItem>,
        <FormItem key="type" {...this.formLayout} label="Tipo de regra">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
          })(
            <RadioGroup>
              <Radio value="0">Forte</Radio>
              <Radio value="1">Fraco</Radio>
            </RadioGroup>,
          )}
        </FormItem>,
      ];
    }
    if (currentStep === 2) {
      return [
        <FormItem key="time" {...this.formLayout} label="Hora de início">
          {form.getFieldDecorator('time', {
            rules: [{ required: true, message: 'Por favor, escolha a hora de início!' }],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Escolha a hora de início"
            />,
          )}
        </FormItem>,
        <FormItem key="frequency" {...this.formLayout} label="Ciclo de agendamento">
          {form.getFieldDecorator('frequency', {
            initialValue: formVals.frequency,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="month">Mês</Option>
              <Option value="week">Semana</Option>
            </Select>,
          )}
        </FormItem>,
      ];
    }
    return [
      <FormItem key="name" {...this.formLayout} label="Nome da regra">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: 'Digite um nome de regra!' }],
          initialValue: formVals.name,
        })(<Input placeholder="Por favor insira" />)}
      </FormItem>,
      <FormItem key="desc" {...this.formLayout} label="Descrição da regra">
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Digite uma descrição da regra com pelo menos cinco caracteres!', min: 5 }],
          initialValue: formVals.desc,
        })(<TextArea rows={4} placeholder="Digite pelo menos cinco caracteres" />)}
      </FormItem>,
    ];
  };

  renderFooter = currentStep => {
    const { handleUpdateModalVisible, values } = this.props;
    if (currentStep === 1) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          Etapa anterior
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          Cancelar
        </Button>,
        <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
          Próximo passo
        </Button>,
      ];
    }
    if (currentStep === 2) {
      return [
        <Button key="back" style={{ float: 'left' }} onClick={this.backward}>
          Etapa anterior
        </Button>,
        <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={() => this.handleNext(currentStep)}>
          Concluir
        </Button>,
      ];
    }
    return [
      <Button key="cancel" onClick={() => handleUpdateModalVisible(false, values)}>
        Cancelar
      </Button>,
      <Button key="forward" type="primary" onClick={() => this.handleNext(currentStep)}>
        Próximo passo
      </Button>,
    ];
  };

  render() {
    const { updateModalVisible, handleUpdateModalVisible, values } = this.props;
    const { currentStep, formVals } = this.state;

    return (
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title="Configuração de regra"
        visible={updateModalVisible}
        footer={this.renderFooter(currentStep)}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
          <Step title="Informação básica" />
          <Step title="Configurando propriedades da regra" />
          <Step title="Defina o período de agendamento" />
        </Steps>
        {this.renderContent(currentStep, formVals)}
      </Modal>
    );
  }
}

export default Form.create()(UpdateForm);
