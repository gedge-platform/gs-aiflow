import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import Test from "./test";
import { Space, Table, Tag, Button, Layout } from 'antd';
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";

const getProjectList = async ( id ) => {
    const { data } = await axios.get(process.env.REACT_APP_API+'/api/getProjectList/' + id);
    var list = data.project_list;
    var count = 0;
    list.forEach(function(item){
        item.key = count;
        count++;
    })
    console.log(list)
    return list;
    
  };

  const columns = [
    {
      title: '프로젝트 이름',
      dataIndex: 'project_name',
      key: 'project_name',
      width:400,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>Delete</a>
        </Space>
      ),
    },
  ];

function ProjectList(props) {
    var id = props.id;
    const setPage = props.setPage;
    const navigate = useNavigate();
    const { isLoading, isError, data, error } = useQuery(["projectList"], () => {return getProjectList(id)}, {
        refetchOnWindowFocus:false,
        retry:0,
    });

    const onRow = (record, rowIndex) => {
        return {
          onClick: (event) => {
              // record: row의 data
              // rowIndex: row의 index
              // event: event prototype
            console.log(record, rowIndex, event);
            navigate('/monitoring/' + record.project_name)
            setPage('monitoring')
          },
        };
      };

    const createProject = () => {

    }
    return (
        <> < div id = 'service_define_main' > 
        <div style={{display:'flex'}} >
          <h2>목록</h2>
        <div align='right' style={{flex:1, display:'flex', justifyContent:'flex-end'}}> 
          {/* <h2 >프로젝트 목록</h2>  */}
          <Button style={{margin:'auto 0'}} type="primary" icon={<PlusOutlined />} onClick={createProject}>
            New Project
          </Button>
        </div>
        </div>

    {
        !isLoading && (
            <Table rowKey={"project_name"} columns={columns} dataSource={data} onRow={onRow} pagination={{ pageSize: 5, showSizeChanger:false}}/>
            // <h1>{data}</h1>
        )

    }
    {/* <Test/> */}
    </div>
    </>
    
    );
}

export {
    ProjectList
};