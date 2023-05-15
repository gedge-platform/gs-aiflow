import { FileOutlined, PieChartOutlined, UserOutlined, DesktopOutlined, TeamOutlined, BarsOutlined, FormOutlined, FileSearchOutlined, FacebookFilled } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, MenuProps, Select, notification } from 'antd';
import { Component, useEffect, useState } from 'react';
import { Link, Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';

import './css/index.css';
import { Sidemenu } from './sidemenu';
import { Monitor } from './monitor';
import { EnrollClusterMonitoring } from './enroll';
import { NotFound } from './notfound';
import { Create } from './create.js';
import { Delete } from './delete.js';
import { LogIn } from './login.js';
import { LogViewer } from './logviewer.js';
import { ServiceDefine } from './service_define';
import Flow from "./react_flow_chart";
import { QueryClient, QueryClientProvider } from 'react-query'
import { DagDefine } from './dag_define';
import { ReactFlowProvider } from 'reactflow';
import { DagMonitoring } from './dag_monitoring';
import UserInfo from './user_info';
import LoginPage from './login_page';
import axios from 'axios';

const queryClient = new QueryClient();
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const items = [
  getItem('AI-Project', '1', <PieChartOutlined />, [
    getItem(<Link to='project_list'>Project</Link>, 'project_list', <BarsOutlined />),
    getItem(<Link to='monitoring/'>Monitoring</Link>, 'monitoring', <DesktopOutlined />),
    getItem(<Link to='editing/'>DAG Editing</Link>, 'editing', <FormOutlined />)
  ]),
  getItem(<a href={process.env.REACT_APP_API + '/api/storage'}>MY Storage</a>, 'my_storage', <FileSearchOutlined />),
  // getItem('Option 2', '2', <DesktopOutlined />),
  // getItem('User', 'sub1', <UserOutlined />, [
  //   getItem('Tom', '3'),
  //   getItem('Bill', '4'),
  //   getItem('Alex', '5'),
  // ]),
  // getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
  // getItem('Files', '9', <FileOutlined />),
];


const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('project_list')
  const [mainProjectID, setMainProjectID] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('user1');
  const [avatarSrc, setAvatarSrc] = useState('');
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  
  const handleLogout = () => {
    axios.post(process.env.REACT_APP_API + "/api/logout", {}, {withCredentials:true}).finally(()=>{
      notificationData.message = "로그아웃";
      notificationData.description = "로그아웃하였습니다.";
      openNotification();
      setLogin('', false);
    });
  };

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

  const setLogin = (name, status) => {
    setUsername(name);
    setLoggedIn(status)
  }

  axios.get(process.env.REACT_APP_API + "/api/login", {withCredentials:true}).then((res)=>{
    setLogin(res.data.data.userName, true);
  })
  .catch((error)=>{setLogin('', false)});

  const handleLogin = (name) => { 
    notificationData.message = "로그인";
    notificationData.description = "안녕하세요. " + name + "님!\n환영합니다.";
    openNotification();
    setLogin(name, true);
    // setUsername(name);
    // setLoggedIn(true);
  };

  const changeTitle = (data) => {
    if (data == 'project_list')
      return '프로젝트 목록'
    else if (data == 'monitoring')
      return '모니터링'
    else if (data == 'editing')
      return 'DAG 정의'
    return "Not Found"
  }

  const pageOnClick = (data) => {
    var key = data.key
    setSelectedKey(key)
  }
  return (
    <Content style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route
          path="/login"
          element={(loggedIn ? <Navigate to='/'/> : <LoginPage handleLogin={handleLogin}/>)}
        />
        <Route
          path="/*"
          element={(loggedIn ? <><Header className="header" style={{ paddingInline: '16px' }}>
            <div style={{ display: 'flex', height: '100%' }}>

              <div
                style={{
                  width: '180px',
                  height: '100%',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0)',
                }}>
                <img id='image_aieyeflow' src='/images/logo_aieye.png' alt='image_aieyeflow' style={{ height: 'auto', width: '100%', verticalAlign: 'middle' }} />
              </div>
              <div style={{ marginLeft: 'auto' }}>
                {loggedIn ? (<UserInfo username={username} avatarSrc={avatarSrc} onLogout={handleLogout} style={{}} />) : (<UserInfo />)}
              </div>
            </div>
          </Header>
            <div ></div>
            <Layout
              style={{
                flex: 1

              }}
            >

              <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} >
                <Menu theme="dark" defaultSelectedKeys={['1']} selectedKeys={[selectedKey]} mode="inline" items={items} onClick={pageOnClick} />
              </Sider>
              <Layout className="site-layout">
                <Content
                  style={{
                    padding: '15px',
                    backgroundColor: '#142C42',
                    color: '#ffffff'
                  }}
                >
                  <ReactFlowProvider>
                    <QueryClientProvider client={queryClient}>
                      <div id='body' >
                        <div id='body_main'>
                          <Content className="body-layout">
                            <h2>{changeTitle(selectedKey)}</h2>
                            <Routes>
                              <Route path='/' element={<ServiceDefine setPage={setSelectedKey} />}></Route>
                              <Route path='/project_list/*' element={<ServiceDefine setPage={setSelectedKey} />}></Route>
                              <Route path='/monitoring/:projectID' element={<DagMonitoring setProjectID={setMainProjectID} />}></Route>
                              <Route path='/editing/:projectID' element={<DagDefine setProjectID={setMainProjectID} />}></Route>
                              <Route path='/monitoring/' element={<DagMonitoring setProjectID={setMainProjectID} />}></Route>
                              <Route path='/editing/' element={<DagDefine setProjectID={setMainProjectID} />}></Route>
                              <Route path='/*' element={<NotFound />}></Route>
                            </Routes>
                          </Content>


                        </div>
                      </div>
                    </QueryClientProvider>
                  </ReactFlowProvider>
                </Content>
              </Layout>
            </Layout></> : <Navigate to='/login' />)}
        />
      </Routes>

    </Content>
  );
};
export default App;
