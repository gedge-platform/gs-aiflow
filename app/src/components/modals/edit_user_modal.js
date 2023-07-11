import { React, useState } from 'react';
import 'css/create_project_modal.css';
import { Button, Form, Input, Select } from 'antd';
import axios from "axios";

const EditUserModal = (props) => {
  // 열기, 닫기, 모달 헤더 텍스트를 부모로부터 받아옴
  const id = props.data.id;
  const userName = props.data.userName;
  const isAdmin = props.data.isAdmin;
  const [role, setRole] = useState(0);

  var specialNickRegex = /^[A-Za-z0-9가-힣]{4,}$/;

  const onFinish = (values) => {
      axios.put(process.env.REACT_APP_API + '/api/users/' + id , {
        user_name: values.nickname,
        is_admin : values.Role
      }, { withCredentials: true })
        .then((res) => {
          if (res.data.status == 'success') {
            notificationData.message = "유저 수정 성공";
            notificationData.description = "유저 수정에 성공했습니다."
            openNotificationWithIcon('success');
            handleSuccess();
          }
          else {
            if (res.data.msg != undefined) {
              openErrorNotificationWithIcon(res.data.msg);
            }
            else {
              openErrorNotificationWithIcon("유저 수정에 실패했습니다.");
            }
          }

        })
        .catch((error) => {
          openErrorNotificationWithIcon("서버와 통신에 실패했습니다.");
        })
    
  };

  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 5,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 19,
      },
    },
  };
  const [form] = Form.useForm();
  const handleSuccess = props.handleSuccess;

  var notificationData = { message: "", description: "" }
  const [api, contextHolder] = props.contextHolder;
  const openNotificationWithIcon = (type) => {
    api[type]({
      message: notificationData.message,
      description: notificationData.description,
    });
  };
  const openErrorNotificationWithIcon = (description) => {
    notificationData.message = "유저 수정 실패"
    notificationData.description = description;
    openNotificationWithIcon('error');
  }

  const onChangeSelectAdmin = (value) => {
    setRole(value);
  }
  const adminOption = [
    {value:1, label:'Admin'},
    {value:0, label:'Normal User'}
  ]
  return (

    <div id='create_user_modal'>
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        style={{
          maxWidth: 700,
        }}
        scrollToFirstError
      >
        <Form.Item
          name="id"
          label="ID"
          initialValue={id}
        >
          <div style={{ display: 'flex' }}>
            <Input defaultValue={id} disabled={true} />
            
          </div>
        </Form.Item>

        <Form.Item
          name="nickname"
          label="Nickname"
          tooltip="What do you want others to call you?"
          initialValue={userName}
          rules={[
            {
              required: true,
              message: '닉네임을 입력해주세요!',
              whitespace: true,
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (specialNickRegex.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('닉네임은 4자 이상의 알파벳과 숫자, 한글만 가능합니다!'));
              },
            }),
          ]}
        >
          <Input defaultValue={userName}/>
        </Form.Item>

        <Form.Item
          name="Role"
          label="Role"
          initialValue={isAdmin}>
          <Select 
            defaultValue={isAdmin} 
            options={adminOption} 
            onChange={onChangeSelectAdmin}/>
        </Form.Item>

        <Form.Item

          wrapperCol={{
            offset: 0,
            span: 24,
          }}>
          <div style={{ display: 'flex' }}>

            <Button style={{ marginLeft: 'auto', width: '100px', fontWeight: 'bold' }} type="primary" htmlType="submit">
              수정하기
            </Button>
          </div>
        </Form.Item>

      </Form>
    </div>

  );
}

export default EditUserModal;