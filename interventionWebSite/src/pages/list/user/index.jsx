import { Badge, Button, Card, Col, Form, Input, Row, Select, message } from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import moment from 'moment';
import UserForm from './components/UserForm';
import StandardTable from './components/StandardTable';

import styles from './style.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const statusMap = { true: 'success', false: 'default' };
const status = { true: 'Ativo', false: 'Desativado' };

/* eslint react/no-multi-comp:0 */
@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
class TableList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      selectedRows: [],
      formValues: {},
      searchValues: {
        state: true,
      },
      action: '',
    };

    this.columns = [
      {
        title: 'Nome',
        dataIndex: 'nome',
        render: (val, record) => (
          <a onClick={() => this.handleModalVisible(true, record, 'update')}>{val}</a>
        ),
      },
      {
        title: 'CNPJ',
        dataIndex: 'cnpj',
      },
      {
        title: 'Login',
        dataIndex: 'login',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(val) {
          return <Badge status={statusMap[val]} text={status[val]} />;
        },
      },
      {
        title: 'Última atualização',
        dataIndex: 'updatedAt',
        render: val => <span>{moment(val).format('DD/MM/YYYY HH:mm:ss')}</span>,
      },
    ];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { searchValues } = this.state;

    dispatch({
      type: 'user/fetch',
      payload: searchValues,
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { searchValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...searchValues,
      ...filters,
    };

    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'user/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();

    this.setState({
      searchValues: {},
    });

    dispatch({
      type: 'user/fetch',
      payload: {},
    });
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
        searchValues: values,
      });

      dispatch({
        type: 'user/fetch',
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
      type: 'user/add',
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
    console.log('UPDATE');
    dispatch({
      type: 'user/update',
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

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    dispatch({
      type: 'user/remove',
      payload: {
        key: selectedRows.map(row => row.key),
      },
      callback: () => {
        this.setState({
          selectedRows: [],
        });
      },
    });
  };

  renderForm() {
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

  render() {
    const {
      user: { data },
      loading,
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
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => this.handleModalVisible(true, {}, 'new')}
                >
                  Novo
                </Button>
                {selectedRows.length > 0 && (
                  <Button onClick={() => this.handleRemove()}>Excluir</Button>
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
          <UserForm {...parentMethods} modalVisible={modalVisible} />
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Form.create()(TableList);
