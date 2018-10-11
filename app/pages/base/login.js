
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory, Link } from 'react-router'
import { Spin, Form, Icon, Input, Button, Row, Col, message } from 'antd'
import { regExpConfig } from '@reg'
import { brandName } from '@config'
import { clearGformCache2, login } from '@actions/common'
import { /* login,  */staff, menu } from '@apis/common'
import Logo from '@components/logo/logo'
import QueuiAnim from 'rc-queue-anim'
const _ = require('lodash')
const forge = require('node-forge');
// import '@styles/base.less'
import '@styles/login.less'
import RegistrationForm from './register';

const FormItem = Form.Item

@connect((state, props) => ({
  config: state.config,
  loginResponse: state.loginResponse,
}))
@Form.create({
  onFieldsChange(props, items) { },
})

export default class Login extends Component {
  // 初始化页面常量 绑定事件方法
  constructor(props, context) {
    super(props)
    this.state = {
      loading: false,
      registerForm: false,
      isCertificates: false,
      show: true,
    }
  }

  componentWillMount() {
    this.props.dispatch(clearGformCache2({}))
  }
  // 点击跳转注册
  handleRegister = (id) => {
    this.setState({
      show: false,
      moduletype: 'edit',
      moduletitle: '详情',
      currPeopleId: id,
    })
  }
  // region 收缩业务代码功能

  handleSubmit(e, isCertificates) {
    e.preventDefault()
    if (isCertificates) {
      message.warning('证书登录功能未开通')
      return
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const query = this.props.form.getFieldsValue()
        // 对密码进行加密，然后传递到后端
        let value = _.get(values, 'password')
        _.set(values, 'password', forge.md.md5.create().update(value).digest().toHex());
        this.setState({ loading: true })
        this.props.dispatch(login(values, (res) => {
          sessionStorage.setItem('token', res.data.token)
          sessionStorage.setItem('ticket', res.data.ticket)
          menu({}, (response) => {
            const nav = response.data.list || []
            if (nav && nav[0]) {
              sessionStorage.setItem('gMenuList', JSON.stringify(nav))
              sessionStorage.setItem('topMenuReskey', nav[0].resKey)
              sessionStorage.setItem('leftNav', JSON.stringify(nav))
              staff({ usercode: query.username }, (resp) => {
                hashHistory.push('/')
              }, (r) => {
                message.warning(r.msg)
                this.setState({
                  loading: false,
                })
              })
            }
          }, (r) => {
            // message.warning(r.msg)
            this.setState({
              loading: false,
            })
          })
        }, (res) => {
          message.warning(res.msg)
          this.setState({
            loading: false,
          })
        }))
      }
    })
  }

  // endregion

  render() {
    const { getFieldDecorator } = this.props.form
    console.log(this.props.loginResponse)
    return (
      <div className="login-container">
        <div className="flexcolumn">
          <div className="login-header" key="header">
            <div className="slogan">
              <QueuiAnim className="flexcolumn" type={['right', 'left']} key="p">
                {
                  this.state.show ? [
                    <p key="0" className="title">{brandName}
                      {/* <span className="en">BIG DATA</span> */}
                    </p>,
                  ] : null
                }
              </QueuiAnim>
            </div>
            <Logo />
          </div>
          <div className="login-main">
            <QueuiAnim delay={300} type="bottom" key="row">
              {
                this.state.show ? [
                  <Row key="row0">
                    <Col span={8} />
                    <Col span={8}>
                      <Spin spinning={this.state.loading}>
                        <Form onSubmit={e => this.handleSubmit(e, this.state.isCertificates)}>
                          <div>
                            <FormItem hasFeedback>
                              {getFieldDecorator('username', {
                                rules: [
                                  {
                                    required: true, min: 4, max: 10, message: '用户名为4-10个字符',
                                  },
                                  { pattern: regExpConfig.policeNo, message: '账号4-10位数字或字母组成' },
                                ],
                              })(<Input addonBefore={<Icon type="user" />} placeholder="请输入用户名" type="text" />)}
                            </FormItem>
                            <FormItem hasFeedback>
                              {getFieldDecorator('password', {
                                rules: [
                                  {
                                    required: true, min: 6, max: 16, message: '密码为6-16个字符',
                                  },
                                  { pattern: regExpConfig.pwd, message: '密码由6-16位数字或者字母组成' },
                                ],
                              })(<Input addonBefore={<Icon type="lock" />} placeholder="请输入密码" type="password" />)}
                            </FormItem>
                            <FormItem>
                              <Button type="primary" htmlType="submit" className="cert-btn">登录</Button>
                            </FormItem>
                            <FormItem>
                              <Button type="primary" onClick={() => this.handleRegister()} className="cert-btn">注册</Button>
                            </FormItem>
                          </div>)
                        </Form>
                      </Spin>
                    </Col>
                    <Col span={8} />
                  </Row>,
                ] : [
                    <Row key="row1" type="flex" justify="center">
                      <Col span={12} >
                        <RegistrationForm
                          visible={this.state.registerForm}
                        />
                      </Col>
                    </Row>,
                  ]
              }
            </QueuiAnim>

          </div>
        </div>
      </div>
    )
  }
}
