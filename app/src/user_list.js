import React, { useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useState} from 'react';
import { Space, Table, Tag, Button, Modal, notification, Select, Input } from 'antd';
import { useNavigate } from "react-router-dom";
import { PlusOutlined, DesktopOutlined , DeleteOutlined, FormOutlined} from "@ant-design/icons";
import CreateProjectModal from './create_project_modal';
import DeleteProjectModal from './delete_project_modal';

 

function UserList(props) {
  const getUserList = async ( ) => {
      const { data } = await axios.get(process.env.REACT_APP_API+'/api/users', {withCredentials:true});
      var list = data.users;
      var count = 0;
      list.forEach(function(item){
          item.key = count;
          count++;
      })
  
      setDataSource(list);
      return list;
      
    };
  const columns = [
    {
      title: '유저 아이디',
      dataIndex: 'login_id',
      key: 'login_id',
      value:'login_id',
      label: '유저 아이디',
      sorter: (a, b) => {return ([a.login_id, b.login_id].sort()[0] === a.login_id ? 1 : -1)},
      width:400,
      filters: [
        {
          text: 'Joe',
          value: 'Joe',
        },
        {
          text: 'Category 1',
          value: 'Category 1',
        },
        {
          text: 'Category 2',
          value: 'Category 2',
        },
      ],
      filterMode: 'tree',
      filterSearch: true,
      onFilter: (value, record) => record.name.startsWith(value),
    },
    {
      title: '유저 이름',
      dataIndex: 'user_name',
      key: 'user_name',
      value:'user_name',
      label: '유저 이름',
      sorter: (a, b) => {return ([a.user_name, b.user_name].sort()[0] === a.user_name ? 1 : -1)},
      width:400,
    },
    {
      title: '관리자 여부',
      dataIndex: 'is_admin',
      key: 'is_admin',
      value:'is_admin',
      label: '관리자 여부',
      sorter: (a, b) => a.is_admin - b.is_admin,
      defaultSortOrder: 'descend',
      width:400,
    },
  ];

  function deleteProject(record){
    setDeleteProjectName(record.project_name);
    showDeleteModal();
  }
    
    const [nameValidation, setNameValidation] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [clusterList, setClusterList] = useState([]);


    const navigate = useNavigate();
    const { isLoading, isError, data, error, refetch } = useQuery(["userList"], () => {return getUserList()}, {
        refetchOnWindowFocus:false,
        retry:0,
    });

    const initCreateProjectData = () =>{
      setNameValidation(false);
      setProjectName("");
      setProjectDesc("");
      setClusterList([]);
    }

    
    const onRow = (record, rowIndex) => {
        return {
          onClick: (event) => {
              // record: row의 data
              // rowIndex: row의 index
              // event: event prototype
          },
        };
      };

    const createProject = () => {
      initCreateProjectData();
      showModal();
    }

    const [dataSource, setDataSource] = useState([]);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
    const [deleteProjectName, setDeleteProjectName] = useState("");
  
    const showModal = () => {
      setOpen(true);
    };

    const showDeleteModal = () => {
      setDeleteOpen(true);
    };


    var specialNameRegex = /^[A-Za-z0-9\-]+$/;
    var specialDescRegex = /^[ㄱ-ㅎ가-힣A-Za-z0-9\s]+$/;

    const validateProjectName = (name) => {
      if(name == ''){
        return false;
      }
      else{
        return specialNameRegex.test(name);
      }
    }

    const validateProjectDesc = (desc) => {
      return specialDescRegex.test(desc);
    }

    const validateClusterList = (desc) => {
      if(desc.length == 0){
        return false;
      }
      return true;
    }
  
    const handleOk = () => {
      if(!nameValidation){
        console.log("val")
      }
      else if(!validateProjectName(projectName)){
        console.log("name")
      }
      else if(!validateProjectDesc(projectDesc)){
        console.log("desc")
      }
      else if(!validateClusterList(clusterList)){
        console.log("cluster")
      }
      else{
        sendCreateProject();
        // setModalText('The modal will be closed after two seconds');
        // setConfirmLoading(true);
        // setTimeout(() => {
        //   setOpen(false);
        //   setConfirmLoading(false);
        // }, 2000);
      }
      
    };

    const handleDeleteOk = () => {
      sendDeleteProject();
    }

    const handleDeleteCancel = () => {
      setDeleteOpen(false);
    }

    function sendCreateProject() {
      setConfirmLoading(true);

      const cL = []
      clusterList.forEach(elem => cL.push(elem.name))
      axios.post(process.env.REACT_APP_API + '/api/project', 
      {projectName: projectName, projectDesc: projectDesc, clusterName: cL}, {withCredentials:true})
      .then(response => {

          if(response.data['status'] == 'success'){
            notificationData.message = '프로젝트 생성 성공';
            notificationData.description ='프로젝트 생성에 성공했습니다.';
            openNotification();
          }
          else{
            notificationData.message = '프로젝트 생성 실패';
            notificationData.description ='프로젝트 생성에 실패했습니다.';
            openNotification();
          }

          setOpen(false);
          setConfirmLoading(false);
          refetch();
      })

  }



  function sendDeleteProject() {
    setConfirmDeleteLoading(true);

    axios.delete(process.env.REACT_APP_API + '/api/project/' + deleteProjectName, {withCredentials:true})
    .then(response => {

        if(response.data['status'] == 'success'){
          notificationData.message = '프로젝트 삭제 성공';
          notificationData.description ='프로젝트 삭제에 성공했습니다.';
          openNotification();
        }
        else{
          notificationData.message = '프로젝트 삭제 실패';
          notificationData.description ='프로젝트 삭제에 실패했습니다.';
          openNotification();
        }

        setDeleteOpen(false);
        setConfirmDeleteLoading(false);
        refetch();
    })

}

  var notificationData = {message:"", description:""}

  const openNotification = () => {
    notification.open({
      message: notificationData.message,
      description:
      notificationData.description,
      onClick: () => {
      },
    });
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: 'Select Odd Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false;
            }
            return true;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true;
            }
            return false;
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };

    const defaultFilterSelect = "login_id"
    const defaultFilterInput = ""
    const [filterSelect, setFilterSelect] = useState(defaultFilterSelect);
    const [filterInput, setFilterInput] = useState(defaultFilterInput);
    
    const onChangeFilterSelect = (data) => {
      setFilterSelect(data);
    } 
    
    const onChangeFilterInput = (data) => {
      setFilterInput(data.target.value);
    }

    //filter
    useEffect(()=>{
      if(!isLoading){
        const filteredData = data.filter((entry)=>{
          return entry[filterSelect].includes(filterInput)
        });
        setDataSource(filteredData);
      }
    },[filterSelect, filterInput]);

    return (
        <> < div id = 'service_define_main' > 
        <div style={{display:'flex'}} >
          <h2>목록</h2>
          <Select defaultValue={defaultFilterSelect} style={{width:'120px', margin: 'auto auto auto 40px'}} options={columns} onChange={onChangeFilterSelect}/>
          <Input placeholder="input search" style={{width:'200px', margin: 'auto auto auto 6px'}} onChange={onChangeFilterInput}/>
        <div align='right' style={{flex:1, display:'flex', justifyContent:'flex-end'}}> 
          <Button style={{margin:'auto 0'}} type="primary" icon={<PlusOutlined />} onClick={createProject}>
            New User
          </Button>
          <Button type="primary" icon={<DeleteOutlined />} style={{margin:'auto 7px', backgroundColor: '#CC0000'}} onClick={(event)=>{
            event.stopPropagation();
            // deleteProject(record)
          }}>
              Delete
          </Button>
        </div>
        </div>

    {
        !isLoading && (
            <Table rowKey={"login_id"} rowSelection={rowSelection} columns={columns} dataSource={dataSource} onRow={onRow} pagination={{ pageSize: 10, showSizeChanger:false}}/>
        )

    }
    
    <Modal
        title="프로젝트 생성"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <div style={{height:'10px'}}/>
      </Modal>
      <Modal
        title="프로젝트 삭제"
        open={deleteOpen}
        onOk={handleDeleteOk}
        confirmLoading={confirmDeleteLoading}
        onCancel={handleDeleteCancel}
        destroyOnClose={true}
      >
        <div style={{height:'10px'}}/>
        <DeleteProjectModal project_name={deleteProjectName} />
      </Modal>
    </div>
    </>
    
    );
}

export {
  UserList
};
