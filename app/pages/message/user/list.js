/**
 * Created by renjm on 2018/1/5.
 */
import React, { Component } from 'react'
import { Tree } from 'antd'

const TreeNode = Tree.TreeNode

export default class UserList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expandedKeys: ['123'],
            defaultExpandedKeys: ['123'],
            deptCode: props.curDeptCode,
        }
        this.handleOnSelect = this.handleOnSelect.bind(this)
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.curDeptCode !== this.props.curDeptCode) {
            this.setState({ deptCode: nextProps.curDeptCode })
        }
    }


    // 展开事件
    onExpand = (expandedKeys) => {
        this.setState({ expandedKeys })
    }

    // 选中事件
    handleOnSelect(info, Nodes) {
        if (Nodes && Nodes.selectedNodes[0] && Nodes.selectedNodes[0].props && Nodes.selectedNodes[0].props.title) {
            const title = Nodes.selectedNodes[0].props.title
            this.props.onSelect(info, title)
        } else {
            this.props.onSelect()
        }
    }

    render() {
        const { trees } = this.props
        const loop = (data = []) => data.map((item) => {
            if (item.children && item.children.length) {
                return <TreeNode key={item.deptCode} title={item.deptName}>{loop(item.children)}</TreeNode>
            }
            return <TreeNode key={item.deptCode} title={item.deptName} />
        })
        const treeNodes = loop(trees)

        return (
            <div>
                <Tree
                    onSelect={this.handleOnSelect}
                    onExpand={this.onExpand}
                    defaultExpandedKeys={this.state.defaultExpandedKeys}
                    selectedKeys={[this.state.deptCode]}
                >
                    {treeNodes}
                </Tree>
            </div>
        )
    }
}
