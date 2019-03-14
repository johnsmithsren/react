import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd';
import React, { Component } from 'react'
const FormItem = Form.Item;
import { connect } from 'react-redux'
const Option = Select.Option;
import { register } from '@apis/common'
import { clearGformCache2, login } from '@actions/common'
const moment = require('moment')
const forge = require('node-forge');
const AutoCompleteOption = AutoComplete.Option;

// const residences = [{
//     value: 'zhejiang',
//     label: 'Zhejiang',
//     children: [{
//         value: 'hangzhou',
//         label: 'Hangzhou',
//         children: [{
//             value: 'xihu',
//             label: 'West Lake',
//         }],
//     }],
// }, {
//     value: 'jiangsu',
//     label: 'Jiangsu',
//     children: [{
//         value: 'nanjing',
//         label: 'Nanjing',
//         children: [{
//             value: 'zhonghuamen',
//             label: 'Zhong Hua Men',
//         }],
//     }],
// }];
@connect((state, props) => ({
    config: state.config,
}))
@Form.create({})

export default class RegistrationForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            confirmDirty: false,
            autoCompleteResult: [],
        }
    }
    // 组件已经加载到dom中
    componentWillMount() {
        this.props.dispatch(clearGformCache2({}))
    }

    // 表单提交后处理事件
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, formParams) => {
            if (!err) {
                console.log('表单参数: ', formParams);
            }
            this.setState({ loading: true })
            let userPassword = _.get(formParams, 'password', '')
            _.set(formParams, 'createTime', moment().unix())
            _.set(formParams, 'password', forge.md.md5.create().update(userPassword).digest().toHex())
            _.set(formParams, 'confirm', forge.md.md5.create().update(userPassword).digest().toHex())
            this.props.dispatch(register(formParams, (res) => {
                if (!_.isEmpty(res.error)) {
                    message.warning(r.msg)
                }
                sessionStorage.setItem('token', res.data.token)
                sessionStorage.setItem('ticket', res.data.ticket)
            }), (r) => {
                message.warning(r.msg)
                this.setState({
                    loading: false,
                })
            });
        });
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }

    handleWebsiteChange = (value) => {
        let autoCompleteResult;
        if (!value) {
            autoCompleteResult = [];
        } else {
            autoCompleteResult = ['.com', '.org', '.net'].map(domain => `${value}${domain}`);
        }
        this.setState({ autoCompleteResult });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { autoCompleteResult } = this.state;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };
        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: '86',
        })(
            <Select style={{ width: 70 }}>
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
            </Select>
        );

        const websiteOptions = autoCompleteResult.map(website => (
            <AutoCompleteOption key={website}>{website}</AutoCompleteOption>
        ));

        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="邮箱"
                >
                    {getFieldDecorator('email', {
                        rules: [{
                            type: 'email', message: '邮箱不合法!',
                        }, {
                            required: true, message: '请输入你的邮箱!',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="密码"
                >
                    {getFieldDecorator('password', {
                        rules: [{
                            required: true, message: '请输入你的密码!',
                        }, {
                            validator: this.validateToNextPassword,
                        }],
                    })(
                        <Input type="password" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="再次确认"
                >
                    {getFieldDecorator('confirm', {
                        rules: [{
                            required: true, message: '请确认密码!',
                        }, {
                            validator: this.compareToFirstPassword,
                        }],
                    })(
                        <Input type="password" onBlur={this.handleConfirmBlur} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={(
                        <span>
                            昵称&nbsp;
                            <Tooltip title="想要怎么称呼你?">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </span>
                    )}
                >
                    {getFieldDecorator('nickname', {
                        rules: [{ required: true, message: '请输入你的昵称!', whitespace: true }],
                    })(
                        <Input />
                    )}
                </FormItem>
                {/* <FormItem
                    {...formItemLayout}
                    label="Habitual Residence"
                >
                    {getFieldDecorator('residence', {
                        initialValue: ['zhejiang', 'hangzhou', 'xihu'],
                        rules: [{ type: 'array', required: true, message: 'Please select your habitual residence!' }],
                    })(
                        <Cascader options={residences} />
                    )}
                </FormItem> */}
                <FormItem
                    {...formItemLayout}
                    label="电话号码"
                >
                    {getFieldDecorator('phone', {
                        rules: [{ required: true, message: '请输入电话号码!' }],
                    })(
                        <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                    )}
                </FormItem>
                {/* <FormItem
                    {...formItemLayout}
                    label="Website"
                >
                    {getFieldDecorator('website', {
                        rules: [{ required: true, message: 'Please input website!' }],
                    })(
                        <AutoComplete
                            dataSource={websiteOptions}
                            onChange={this.handleWebsiteChange}
                            placeholder="website"
                        >
                            <Input />
                        </AutoComplete>
                    )}
                </FormItem> */}
                <FormItem
                    {...formItemLayout}
                    label="验证码"
                    extra="防止机器人创建，请谅解."
                >
                    <Row gutter={8}>
                        <Col span={12}>
                            {getFieldDecorator('captcha', {
                                rules: [{ required: true, message: '请输入验证码' }],
                            })(
                                <Input />
                            )}
                        </Col>
                        <Col span={12}>
                            <Button>获取验证码</Button>
                        </Col>
                    </Row>
                </FormItem>
                {/* <FormItem {...tailFormItemLayout}>
                    {getFieldDecorator('agreement', {
                        valuePropName: 'checked',
                    })(
                        <Checkbox>I have read the <a href="">同意</a></Checkbox>
                    )}
                </FormItem> */}
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">注册</Button>
                </FormItem>
            </Form>
        );
    }
}

