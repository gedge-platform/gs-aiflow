import React, { useState } from 'react';
import { Form, Input, Button, Divider, notification } from 'antd';
import axios from 'axios';

const LoginPage = (props) => {
    const handleLogin = props.handleLogin;
    const onFinish = (values) => {
        axios.post(process.env.REACT_APP_API + "/api/login", values, {withCredentials:true})
        .then((res) => {
            if(res.data.status == 'success'){
                handleLogin(res.data.data.userID, res.data.data.userName, res.data.data.isAdmin);
            }
            else{
                setSubmitText(res.data.msg);
            }
        })
        .catch((error) => {
            setSubmitText('login error');
        });
        // 로그인 처리 로직을 구현합니다.
    };

    const [submitText, setSubmitText] = useState('');

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#001529' }}>

            <div style={{ margin: 'auto', backgroundColor: '#CCCCCC', width: '1000px', height: '600px', display: 'flex' }}>
                <div style={{ width: '440px', padding: '30px', display: 'flex' }}>
                    <div style={{ margin: '20px auto' }}>
                        <div style={{fontSize:'60px', fontWeight:'bold'}}>Welcome
                        </div>
                        <div style={{fontSize:'40px', fontWeight:'bold'}}>LogIn
                        </div>
                        <Divider></Divider>
                        <Form
                            name="login-form"
                            initialValues={{
                                remember: true,
                            }}
                            style={{width:'300px'}}
                            labelCol={{ span: 0 }}
                            wrapperCol={{ span: 24 }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="ID"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your ID!',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="PW"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Button id='login-form_Submit' style={{width:'100%'}} type="primary" htmlType="submit">
                                    Login
                            </Button>
                            <div id='login-form_Submit_text' style={{width:'100%', fontWeight:'bold', color:'red'}} type="primary" htmltype="submit">
                                {submitText}
                            </div>
                        </Form></div>
                </div>
                <div style={{ width: '440px' , backgroundColor: '#143542', color:'white', padding: '30px', display: 'flex', fontSize: '40px', flexDirection:'column'}}>
                        <div style={{margin:'20px'}}>
                        <div style={{fontSize:'70px', fontWeight:'bold'}}>AIFLOW
                        </div>
                        <div style={{fontSize:'50px', fontWeight:'bold'}}>Gedge Flatform
                        </div></div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;