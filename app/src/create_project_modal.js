import {React, useEffect, useState} from 'react';
import './css/create_project_modal.css';
import { Col, Row , Table, Button } from 'antd';
import { useQuery } from "react-query";
import {CheckOutlined} from '@ant-design/icons'
import axios from "axios";

const CreateProjectModal = (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const id = props.id;
  const [validation, setValidation] = props.validation.nameValidation;
  const [projectName, setProjectName] = props.validation.projectName;
  const [projectDesc, setProjectDesc] = props.validation.projectDesc;
  const [clusterList, setClusterList] = props.validation.clusterList;

  const flexWidth = '150px'

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
    },
    {
      title: '타입',
      dataIndex: 'type',
    },
  ];

  const getClusterList = async ( id ) => {
      const { data } = await axios.get(process.env.REACT_APP_API+'/api/clusters', {withCredentials:true});
      var list = data.cluster_list;
      var count = 0;
      console.log(data)
      list.forEach(function(item){
          item.key = count;
          count++;
      })
      return list;
      
    };


  const { isLoading, isError, data, error } = useQuery(["clusters"], () => {return getClusterList(id)}, {
    refetchOnWindowFocus:false,
    retry:0,
});
  // rowSelection object indicates the need for row selection
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    setClusterList(selectedRows);
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Disabled User',
    // Column configuration not to be checked
    name: record.name,
  }),
}; 

const [loadings, setLoadings] = useState([]);
const enterLoading = (index) => {
  setLoadings((prevLoadings) => {
    const newLoadings = [...prevLoadings];
    newLoadings[index] = true;
    return newLoadings;
  });
  // setTimeout(() => {
  //   setLoadings((prevLoadings) => {
  //     const newLoadings = [...prevLoadings];
  //     newLoadings[index] = false;
  //     setValidation(true)
  //     return newLoadings;
  //   });
  // }, 6000);
};


var specialNameRegex = /^[A-Za-z0-9\-]+$/;

const validateProjectName = (name) => {
  if(name == ''){
    return false;
  }
  else{
    return specialNameRegex.test(name);
  }
}

const validateProjectFromServer = (name) => {
  enterLoading(0);
  axios.get(process.env.REACT_APP_API+'/api/project/' + name, {withCredentials:true})
  .then(response => {
    if(response['data']['data'] != undefined){
        setValidation(false);
    }
    else{
        setValidation(true);
    }
    
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[0] = false;
      return newLoadings;
    });
  })
  .catch(err => {
    if(err.response.status == 404){
      setValidation(true);
    }
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[0] = false;
      return newLoadings;
    });
  });
}

// loading={loadings[0]} onClick={() => enterLoading(0)}
  return (
    // 모달이 열릴때 openModal 클래스가 생성된다.
    <div id='create_project_modal'>

    <Row >
        <label class="required">Project Name</label>
    </Row>
    <label>알파벳과 숫자, 특수문자 - 만 가능합니다.</label>
    <Row>

    <div style={{width: '100%', display:'flex'}}>
        <input style={{flex:1}} placeholder='Project Name' onInput={(data) => {
          setProjectName(data.target.value);
          setValidation(false);
        }}/>
        {
          validation ? 
            <Button style={{backgroundColor:'#52c41a'}} type="primary" shape="circle" icon={<CheckOutlined />} />
          :
            <Button type="primary" loading={loadings[0]} onClick={() => {
                if(validateProjectName(projectName)){
                  validateProjectFromServer(projectName)
                }
              }}>
              중복확인
            </Button>
        }
    </div>
    </Row>
    <Row>
      <label>Project Description</label>
    </Row>
    <label>한글, 알파벳과 숫자, 띄어쓰기만 가능합니다.</label>
    <Row>
      <input style={{width:'100%'}} placeholder='Project Description' onInput={(data) => {setProjectDesc(data.target.value)}}/>
    </Row>
    <Row>
      <label class="required">Clutser</label>
    </Row>
    <Row>
      <Table style={{width:'100%'}}
        rowSelection={{
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
        pagination={false} 
      />
    </Row>
    </div>
  );
}

export default CreateProjectModal;