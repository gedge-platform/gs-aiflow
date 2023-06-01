import React, { useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useState } from 'react';
import { Space, Table, Tag, Button, Modal, notification, Select, Input } from 'antd';
import { DesktopOutlined } from "@ant-design/icons";
import StopProjectModal from "./stop_project_modal";




function AdminProjectList(props) {
  const getProjectList = async (id) => {
    const { data } = await axios.get(process.env.REACT_APP_API + '/api/getProjectList/all', { withCredentials: true });
    var list = data.project_list;
    var count = 0;
    list.forEach(function (item) {
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
      width: 400,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      value: 'status',
      label: '상태',
      width: 200,
      render: (value) => {
        let color = 'blue';
        if (value == 'Running') {
          color = 'green';
        }
        return (
          <Tag color={color} key={value}>
            {getStatusText(value)}
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<DesktopOutlined />} style={{ backgroundColor: '#CC0000' }} onClick={(event) => {
            event.stopPropagation();
            initProjectData(record);
          }}>
            Init
          </Button>
        </Space>
      ),
    },
  ];

  function getStatusText(value) {
    return value;
  }


  function initProjectData(record) {
    setStopProjectName(record.project_name);
    setStopLoginID(record.login_id);
    showDeleteModal();
  }
  var id = props.id;
  const { isLoading, isError, data, error, refetch } = useQuery(["projectList"], () => { return getProjectList(id) }, {
    refetchOnWindowFocus: false,
    retry: 0,
  });


  const onRow = (record, rowIndex) => {
    return {
      onClick: (event) => {
        setSelectedProject({ project_name: record.project_name, login_id: record.login_id, user_name: record.user_name });
      },
    };
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [stopProjectName, setStopProjectName] = useState("");
  const [stopLoginID, setStopLoginID] = useState("");

  const showDeleteModal = () => {
    setDeleteOpen(true);
  };

  const handleDeleteOk = () => {
    sendDeleteProject();
  }

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
  }




  function sendDeleteProject() {
    setConfirmDeleteLoading(true);

    axios.post(process.env.REACT_APP_API + '/api/project/init/' + stopLoginID + '/' + stopProjectName, {}, { withCredentials: true })
      .then(response => {

        if (response.data['status'] == 'success') {
          notificationData.message = '프로젝트 정지 성공';
          notificationData.description = '프로젝트 정지에 성공했습니다.';
          openNotificationWithIcon("success");
        }
        else {
          notificationData.message = '프로젝트 정지 실패';
          notificationData.description = '프로젝트 정지에 실패했습니다.';
          openNotificationWithIcon("error");
        }

        setDeleteOpen(false);
        setConfirmDeleteLoading(false);
        refetch();
      })

  }

  const defaultFilterSelect = "login_id"
  const defaultFilterInput = ""
  const [filterSelect, setFilterSelect] = useState(defaultFilterSelect);
  const [filterInput, setFilterInput] = useState(defaultFilterInput);
  const [dataSource, setDataSource] = useState([]);
  const [selectedProject, setSelectedProject] = props.setSelectedProject;

  const onChangeFilterSelect = (data) => {
    setFilterSelect(data);
  }

  const onChangeFilterInput = (data) => {
    setFilterInput(data.target.value);
  }

  const notificationData = {message:"", description:""};
  const openNotificationWithIcon = (type) => {
    api[type](notificationData);
  };

  //filter
  useEffect(() => {
    if (!isLoading) {
      const filteredData = data.filter((entry) => {
        return entry[filterSelect].includes(filterInput)
      });
      setDataSource(filteredData);
    }
  }, [filterSelect, filterInput]);

  //notification
  const [api, contextHolder] = notification.useNotification();

  return (
    <> {contextHolder}
    < div id='service_define_main' >
      <div style={{ display: 'flex' }} >
        <h2>목록</h2>
        <Select defaultValue={defaultFilterSelect} style={{ width: '120px', margin: 'auto auto auto 40px' }} options={columns.filter(column => column.value != undefined)} onChange={onChangeFilterSelect} />
        <Input placeholder="input search" style={{ width: '200px', margin: 'auto auto auto 6px' }} onChange={onChangeFilterInput} />
        <div align='right' style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>

        </div>
      </div>

      {
        !isLoading && (
          <Table rowKey={"project_name"} columns={columns} dataSource={dataSource} onRow={onRow} pagination={{ pageSize: 5, showSizeChanger: false }} />
          // <h1>{data}</h1>
        )

      }
      <Modal
        title="프로젝트 정지"
        open={deleteOpen}
        onOk={handleDeleteOk}
        confirmLoading={confirmDeleteLoading}
        onCancel={handleDeleteCancel}
        destroyOnClose={true}
      >
        <div style={{ height: '10px' }} />
        <StopProjectModal project_name={stopProjectName} />
      </Modal>
    </div>
    </>

  );
}

export {
  AdminProjectList
};
