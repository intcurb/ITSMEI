import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Icon,
  Input,
  InputNumber,
  Menu,
  Row,
  Select,
  message,
  Tooltip,
} from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import moment from 'moment';
import InterdictionsForm from './components/InterdictionsForm';
import StandardTable from './components/StandardTable';
import styles from './style.less';
import { isValidArray } from '@/utils/isValidVariable';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const statusMap = { true: 'success', false: 'default' };
const status = { true: 'Ativo', false: 'Desativado' };

/* eslint react/no-multi-comp:0 */
@connect(({ interdictions, loading, user }) => ({
  interdictions,
  loading: loading.models.interdictions,
  currentUser: user.currentUser,
}))
class TableList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      expandForm: false,
      selectedRows: [],
      formValues: {},
      action: '',
    };

    this.columns = [
      {
        title: 'Descrição',
        dataIndex: 'description',
        width: '100px',
        onCell: () => ({
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 150,
          },
        }),
        render: (text, record) => (
          <Tooltip title={text}>
            <a
              style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
              onClick={() => this.handleModalVisible(true, record, 'update')}
            >
              {text}
            </a>
          </Tooltip>
        ),
      },

      {
        title: 'Ponto Inicial',
        dataIndex: 'origin.street',
        onCell: () => ({
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 150,
          },
        }),
        render: text => (
          <Tooltip title={text}>
            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: 'Ponto Final',
        dataIndex: 'destination.street',
        onCell: () => ({
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 150,
          },
        }),
        render: text => (
          <Tooltip title={text}>
            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{text}</div>
          </Tooltip>
        ),
      },
      {
        title: 'Organização',
        dataIndex: 'user',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: '130px',
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: 'Criado Em',
        dataIndex: 'createdAt',
        width: '175px',
        render: val => <span>{moment(val).format('DD/MM/YYYY HH:mm:ss')}</span>,
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'interdictions/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };

    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'interdictions/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'interdictions/fetch',
      payload: {},
    });
  };

  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    switch (e.key) {
      case 'approval':
        dispatch({
          type: 'interdictions/aprove',
          key: selectedRows.map(row => row.key),
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      case 'remove':
        dispatch({
          type: 'interdictions/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'interdictions/fetch',
        payload: values,
      });
    });
  };

  handleModalVisible = (flag, record, action) => {
    this.setState({
      modalVisible: !!flag,
      formValues: record || {},
      action,
    });
  };

  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'interdictions/add',
      payload: { ...fields, status: false },
      callback: () => {
        message.success('Adicionado com sucesso');
      },
    });

    this.handleModalVisible();
  };

  handleUpdate = fields => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    dispatch({
      type: 'interdictions/update',
      payload: {
        ...fields,
      },
      key: formValues.key,
      callback: () => {
        message.success('Alterado com sucesso');
      },
    });

    this.handleModalVisible();
  };

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={19}>
          <Col md={8} sm={24} />
          <Col md={7} sm={24}>
            <FormItem label="Nome">
              {getFieldDecorator('nome')(<Input placeholder="Pesquisar..." />)}
            </FormItem>
          </Col>
          <Col md={5} sm={24}>
            <FormItem label="Status">
              {getFieldDecorator('status', {
                initialValue: true,
              })(
                <Select placeholder="Por favor escolha" style={{ width: '100%' }}>
                  <Option value>
                    <Badge status={statusMap.true} text={status.true} />
                  </Option>
                  <Option value={false}>
                    <Badge status={statusMap.false} text={status.false} />
                  </Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={4} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                Consulta
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                Reset
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Nome da regra">
              {getFieldDecorator('name')(<Input placeholder="Por favor insira" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Status de uso">
              {getFieldDecorator('status')(
                <Select placeholder="Por favor escolha" style={{ width: '100%' }}>
                  <Option value="0">Fechar</Option>
                  <Option value="1">Running</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Número de chamadas">
              {getFieldDecorator('number')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="Data de atualização">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="__/__/____" />,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Status de uso">
              {getFieldDecorator('status3')(
                <Select placeholder="Por favor escolha" style={{ width: '100%' }}>
                  <Option value="0">Fechar</Option>
                  <Option value="1">Running</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Status de uso">
              {getFieldDecorator('status4')(
                <Select placeholder="Por favor escolha" style={{ width: '100%' }}>
                  <Option value="0">Fechar</Option>
                  <Option value="1">Running</Option>
                </Select>,
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              Consulta
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              Reset
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              Reduzir <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const {
      interdictions: { data },
      loading,
      currentUser: { currentAuthority },
    } = this.props;

    const { selectedRows, modalVisible, action, formValues } = this.state;

    const parentMethods = {
      values: formValues,
      action,
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      handleUpdate: this.handleUpdate,
    };

    return (
      <div style={{ padding: '24px' }}>
        <PageHeaderWrapper>
          <Card bordered={false}>
            <div className={styles.tableList}>
              <div className={styles.tableListForm}>{this.renderForm()}</div>
              <div className={styles.tableListOperator}>
                {selectedRows.length > 0 && (
                  <span>
                    {currentAuthority === 'admin' && (
                      <Button onClick={() => this.handleMenuClick({ key: 'approval' })}>
                        Aprovação em lote
                      </Button>
                    )}
                    {(currentAuthority === 'admin' || currentAuthority === 'user') && (
                      <Button onClick={() => this.handleMenuClick({ key: 'remove' })}>
                        Excluir
                      </Button>
                    )}
                  </span>
                )}
              </div>
              <StandardTable
                selectedRows={selectedRows}
                loading={loading}
                data={data}
                columns={this.columns}
                onSelectRow={this.handleSelectRows}
                onChange={this.handleStandardTableChange}
              />
            </div>
          </Card>
          <InterdictionsForm {...parentMethods} modalVisible={modalVisible} />
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Form.create()(TableList);
