import React, { useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useState} from 'react';
import { Space, Table, Tag, Button, Modal, notification, Select, Input } from 'antd';
import { useNavigate } from "react-router-dom";
import { PlusOutlined, DesktopOutlined , DeleteOutlined, FormOutlined} from "@ant-design/icons";
import CreateProjectModal from './create_project_modal';
import DeleteProjectModal from './delete_project_modal';


 

function AdminProjectList(props) {
  const getProjectList = async ( id ) => {
    const { data } = await axios.get(process.env.REACT_APP_API+'/api/getProjectList/all', {withCredentials:true});
    var list = data.project_list;
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
      value: 'login_id',
      label: '유저 아이디',
      sorter: (a, b) => { return ([a.login_id, b.login_id].sort()[0] === a.login_id ? 1 : -1) },
      width: 400,
    },
    {
      title: '유저 이름',
      dataIndex: 'user_name',
      key: 'user_name',
      value: 'user_name',
      label: '유저 이름',
      width: 400,
    },
    {
      title: '프로젝트 이름',
      dataIndex: 'project_name',
      key: 'project_name',
      value: 'project_name',
      label: '프로젝트 이름',
      width:400,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<DesktopOutlined />} style={{backgroundColor: '#00CC00'}} onClick={(event)=>{
            event.stopPropagation();
            navigate('/monitoring/' + record.project_name)
            setPage('monitoring')
          }}>
              Monitoring
          </Button>

          <Button type="primary" icon={<DeleteOutlined />} style={{backgroundColor: '#CC0000'}} onClick={(event)=>{
            event.stopPropagation();
            deleteProject(record)
          }}>
              Delete
          </Button>
        </Space>
      ),
    },
  ];


  function deleteProject(record){
    setDeleteProjectName(record.project_name);
    showDeleteModal();
  }
    var id = props.id;
    const setPage = props.setPage;
    const [nameValidation, setNameValidation] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [clusterList, setClusterList] = useState([]);
    const [selectedProject, setSelectedProject] = props.setSelectedProject;


    const navigate = useNavigate();
    const { isLoading, isError, data, error, refetch } = useQuery(["projectList"], () => {return getProjectList(id)}, {
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
              setSelectedProject(record.project_name);
            // navigate('/monitoring/' + record.project_name)
            // setPage('monitoring')
          },
        };
      };

    const createProject = () => {
      initCreateProjectData();
      showModal();
    }

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
  
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };


  const defaultFilterSelect = "login_id"
  const defaultFilterInput = ""
  const [filterSelect, setFilterSelect] = useState(defaultFilterSelect);
  const [filterInput, setFilterInput] = useState(defaultFilterInput);
  const [dataSource, setDataSource] = useState([]);

  const onChangeFilterSelect = (data) => {
    setFilterSelect(data);
  }

  const onChangeFilterInput = (data) => {
    setFilterInput(data.target.value);
  }

  //filter
  useEffect(() => {
    if (!isLoading) {
      const filteredData = data.filter((entry) => {
        return entry[filterSelect].includes(filterInput)
      });
      setDataSource(filteredData);
    }
  }, [filterSelect, filterInput]);

    return (
        <> < div id = 'service_define_main' > 
        <div style={{ display: 'flex' }} >
        <h2>목록</h2>
        <Select defaultValue={defaultFilterSelect} style={{ width: '120px', margin: 'auto auto auto 40px' }} options={columns.filter(column => column.value != undefined)} onChange={onChangeFilterSelect} />
        <Input placeholder="input search" style={{ width: '200px', margin: 'auto auto auto 6px' }} onChange={onChangeFilterInput} />
        <div align='right' style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          
        </div>
      </div>

    {
        !isLoading && (
            <Table rowKey={"project_name"} columns={columns} dataSource={dataSource} onRow={onRow} pagination={{ pageSize: 5, showSizeChanger:false}}/>
            // <h1>{data}</h1>
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
        <CreateProjectModal id={id} validation={{
          nameValidation:[nameValidation, setNameValidation],
          projectName:[projectName, setProjectName],
          projectDesc:[projectDesc, setProjectDesc],
          clusterList:[clusterList, setClusterList]
          }} />
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
  AdminProjectList
};
