/*
 * @Author: renjm
 * @Date: 2018-08-27
 */

import React, { Component } from "react";
import { connect } from "react-redux";
const _ = require("lodash");
import {
  List,
  Avatar,
  Icon,
  Spin,
  notification,
  Button,
  Popconfirm,
  Form,
  Input,
  message,
  Layout
} from "antd";
import TableList from "@tableList";
import { synUser } from "@apis/common";
import {
  fetchUserDepttList,
  fetchUserList,
  fetchUserDetail,
  fetchUserDelete,
  fetchRoleList,
  fetchChangeUserStatus
} from "@apis/manage";

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);
// import UserList from "./list";
// import AddPolice from './modal/addPolice'
// import SelectRole from './modal/selectRole'

// const FormItem = Form.Item;
// const { Content, Sider } = Layout;

// 连接公用常量、后端返回的数据方法  并放置在props里面调用
@connect((state, props) => ({
  config: state.config
}))
@Form.create({})
// 声明组件  并对外输出
export default class app extends Component {
  // 初始化页面常量 绑定事件方法
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "list",
      searchtitle: "",
      PoliceAddVisible: false,
      synchronizeLoading: false,
      RoleVisible: false,
      spinloading: true,
      moduletitle: "",
      moduletype: "",
      currPeopleId: "",
      hasList: false,
      searchKey: {
        keyword: "",
        pageSize: 10,
        pageNo: 1,
        deptCode: ""
      },
      btnRights: {
        view: true,
        freeze: true,
        delete: true,
        edit: true,
        add: true
      }, // 按钮权限的数组
      userDeptResult: { list: [], loading: false },
      userListResult: { list: [], loading: false },
      userDetailResult: { list: [], loading: false },
      userRoleSetResult: { list: [], loading: false }
    };
  }

  // 组件即将加载
  componentWillMount() {
    // this.getBtnRights()
    fetchRoleList({}, res => {
      this.setState({ userRoleSetResult: res.data });
    });
    fetchUserDepttList({}, res => {
      if (res.data.list.length > 0) {
        this.setState(
          {
            userDeptResult: res.data,
            spinloading: false,
            searchKey: {
              ...this.state.searchKey,
              deptCode: res.data.list[0].deptCode
            }
          },
          () => {
            this.getData(() => {
              this.setState({
                searchtitle: "杭州市",
                hasList: true
              });
            });
          }
        );
      } else {
        this.setState({ spinloading: false });
      }
    });
  }

  // 组件已经加载到dom中
  componentDidMount() {
    this.props.form.setFieldsValue({ key: "" });
  }

  // region 收缩业务代码功能

  // 发送获取当前菜单的按钮权限
  getBtnRights() {
    const { fetchBtns } = require("@configs/common");
    fetchBtns(this, btnRights => this.setState({ btnRights }));
  }

  // 获取用户列表数据
  getData(callback) {
    fetchUserList({ ...this.state.searchKey }, res => {
      this.setState({
        userListResult: res.data
      });
      callback && callback();
    });
  }

  // 删除用户
  handleDelete(id) {
    if (sessionStorage.getItem("userid") === id) {
      message.warning("自己不能删除自己");
      return;
    }
    const curUserListResult = this.props.userListResult;
    let curpage = this.state.searchKey.pageNo;
    fetchUserDelete(
      { deptcode: this.state.searchKey.deptCode, id: id },
      res => {
        message.success(res.msg);
        if (
          curUserListResult.totalPage > 1 &&
          curUserListResult.totalCount % 10 === 1
        ) {
          curpage -= 1;
        }
        this.setState(
          {
            searchKey: {
              ...this.state.searchKey,
              pageNo: curpage
            }
          },
          () => {
            this.getData();
          }
        );
      }
    );
  }

  // 冻结、解冻用户
  handleChangeStatus(id, status) {
    fetchChangeUserStatus({ id: id, status: status }, res => {
      message.success(res.msg);
      this.getData();
    });
  }

  // 点击人员详情
  handleUserInfo = id => {
    fetchUserDetail({ id: id }, res => {
      this.setState({
        userDetailResult: res.data,
        PoliceAddVisible: true,
        moduletype: "edit",
        moduletitle: "详情",
        currPeopleId: id
      });
    });
  };

  // 点击人员角色
  handleUserRole(id) {
    fetchUserDetail({ id: id }, res => {
      this.setState({
        userDetailResult: res.data,
        RoleVisible: true,
        currPeopleId: id
      });
    });
  }

  // 搜索
  handleSearch(e) {
    e.preventDefault();
    const keyword = this.props.form.getFieldValue("key");
    this.setState(
      {
        spinloading: true,
        searchKey: {
          ...this.state.searchKey,
          keyword: keyword,
          pageNo: 1
        }
      },
      () => {
        this.getData(() => {
          this.setState({ spinloading: false });
        });
      }
    );
  }

  // 点击树节点的时候获取 当前部门 deptid
  onSelect(info, title) {
    if (info.length > 0) {
      this.setState(
        {
          spinloading: true,
          searchtitle: title,
          searchKey: {
            ...this.state.searchKey,
            deptCode: info[0],
            pageNo: 1,
            keyword: ""
          }
        },
        () => {
          this.getData(() => {
            this.setState({
              spinloading: false,
              hasList: true
            });
          });
        }
      );
      this.props.form.setFieldsValue({ key: "" });
    }
  }

  // 点击新增人员的时候判断部门 deptid  是否存在，有则弹窗新增
  policeAdd() {
    if (this.state.searchKey.deptCode) {
      this.setState({
        PoliceAddVisible: true,
        moduletype: "add",
        moduletitle: "新增"
      });
    } else {
      notification.error({
        message: "错误",
        description: "请先选择部门"
      });
    }
  }

  synchronize() {
    message.info("用户数据同步中");
    this.setState(
      {
        synchronizeLoading: true
      },
      () => {
        synUser(
          {},
          () => {
            message.success("用户数据同步完成");
            this.setState({
              synchronizeLoading: false
            });
            this.getData();
          },
          res => {
            message.warning(res.msg);
            this.setState({
              synchronizeLoading: false
            });
          }
        );
      }
    );
  }

  // 新增或编辑用户保存
  handleOk() {
    const curUserListResult = this.props.userListResult;
    let curpage = this.state.searchKey.pageNo;
    if (
      this.state.moduletype === "add" &&
      curUserListResult &&
      curUserListResult.totalCount > 0 &&
      curUserListResult.totalCount % 10 === 0
    ) {
      curpage += 1;
    }
    this.setState(
      {
        PoliceAddVisible: false,
        searchKey: {
          ...this.state.searchKey,
          pageNo: curpage
        }
      },
      () => {
        this.getData();
      }
    );
  }

  // 新增用户modal取消
  handleCancel = () => {
    this.setState({ PoliceAddVisible: false });
  };

  // 角色弹窗确认事件
  handleOkRole() {
    this.setState({ RoleVisible: false }, () => {
      this.getData();
    });
  }

  // 角色弹窗取消事件
  handleCancelRole() {
    this.setState({ RoleVisible: false });
  }

  // 页数改变事件
  pageChange = newPage => {
    this.state.searchKey.pageNo = newPage;
    this.getData();
  };

  // 页大小改变事件
  pageSizeChange = (e, pageSize) => {
    this.state.searchKey.pageNo = 1;
    this.state.searchKey.pageSize = pageSize;
    this.getData();
  };

  state = {
    loading: true,
    loadingMore: false,
    showLoadingMore: true,
    data: []
  };

  componentDidMount() {
    this.getData(res => {
      this.setState({
        loading: false,
        data: res.results
      });
    });
  }

  // getData = (callback) => {
  //     request({
  //         url: fakeDataUrl,
  //         type: 'json',
  //         method: 'get',
  //         contentType: 'application/json',
  //         success: (res) => {
  //             callback(res);
  //         },
  //     });
  // }

  onLoadMore = () => {
    this.setState({
      loadingMore: true
    });
    this.getData(res => {
      const data = this.state.data.concat(res.results);
      this.setState(
        {
          data,
          loadingMore: false
        },
        () => {
          // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
          // In real scene, you can using public method of react-virtualized:
          // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
          window.dispatchEvent(new Event("resize"));
        }
      );
    });
  };

  // 生成表格头部信息
  renderColumn() {
    return [
      {
        title: "姓名",
        dataIndex: "chineseName",
        key: "chineseName",
        width: "15%"
      },
      {
        title: "职务",
        dataIndex: "post",
        key: "post",
        width: "15%"
      },
      {
        title: "帐号",
        dataIndex: "username",
        key: "username",
        width: "15%"
      },
      {
        title: "帐号状态",
        dataIndex: "statusLabel",
        key: "statusLabel",
        width: "15%",
        render: (text, record, index) => (
          <span>{record.status ? "已冻结" : "正常"}</span>
        )
      },
      {
        title: "角色",
        dataIndex: "roles",
        key: "roles",
        width: "20%",
        render: (text, record, index) => {
          const roleNames = [];
          (text || []).map((item, index) => {
            roleNames.push(item.roleName);
          });
          return roleNames.length === 0 ? "" : roleNames.join(",");
        }
      },
      {
        title: "操作",
        key: "operate",
        render: (text, record, index) => {
          const { btnRights } = this.state;
          // console.log(btnRights)
          return (
            <span>
              {btnRights.view ? (
                <span>
                  <a onClick={() => this.handleUserInfo(record.id)}>详情</a>
                  <span className="ant-divider" />
                </span>
              ) : null}
              {btnRights.freeze ? (
                <span>
                  <Popconfirm
                    title={`确认${record.status ? "解冻" : "冻结"}账户?`}
                    placement="left"
                    onConfirm={() =>
                      this.handleChangeStatus(
                        record.id,
                        `${record.status ? 0 : 1}`
                      )
                    }
                  >
                    <a>{record.status ? "解冻账户" : "冻结账户"}</a>
                  </Popconfirm>
                </span>
              ) : null}
            </span>
          );
        }
      }
    ];
  }

  getUserList(userInfo) {
    const listData = [];
    _.forEach(userInfo.list, user => {
      listData.push({
        href: _.get(user, "href", "http://google.com"),
        title: _.get(user, "title", "新闻"),
        name: _.get(user, "name", "renjm"),
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
        description: _.get(user, "description", "今天天气不错"),
        content: _.get(user, "content", "有点下雨，心情不好")
      });
    });
    return listData;
  }

  // 查看是否需要加载 的组件
  loadMoreCheck(showLoadingMore, loadingMore) {
    if (showLoadingMore) {
      return (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            height: 32,
            lineHeight: "32px"
          }}
        >
          {loadingMore && <Spin />}
          {!loadingMore && (
            <Button onClick={this.onLoadMore}>loading more</Button>
          )}
        </div>
      );
    } else {
      return null;
    }
  }
  // endregion

  render() {
    const {
      userDeptResult,
      userListResult,
      userDetailResult,
      userRoleSetResult
    } = this.state;
    let listData = this.getUserList(userRoleSetResult);
    const { loading, loadingMore, showLoadingMore, data } = this.state;
    const loadMore = this.loadMoreCheck(showLoadingMore, loadingMore);
    return (
      <div className="page page-scrollfix page-usermanage">
        <Layout>
          <Layout className="page-body">
            <List
              className="demo-loadmore-list"
              loading={loading}
              pagination={{
                onChange: page => {
                  console.log(page);
                },
                pageSize: 8
              }}
              itemLayout="horizontal"
              loadMore={loadMore}
              dataSource={listData}
              renderItem={item => (
                <List.Item actions={[<a>edit</a>, <a>more</a>]}>
                  <List.Item.Meta
                    avatar={
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    }
                    title={<a href="https://ant.design">{item.title}</a>}
                    description={item.description}
                  />
                  <div>{item.content}</div>
                </List.Item>
              )}
            />
          </Layout>
        </Layout>
      </div>
    );
  }
}
