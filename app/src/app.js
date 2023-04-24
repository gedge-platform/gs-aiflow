import { FileOutlined, PieChartOutlined, UserOutlined, DesktopOutlined, TeamOutlined, BarsOutlined, FormOutlined, FileSearchOutlined} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, MenuProps } from 'antd';
import { useEffect, useState } from 'react';
import {Link, Route,Routes} from 'react-router-dom';

import './css/index.css';
import {Sidemenu} from './sidemenu';
import {Monitor} from './monitor';
import {EnrollClusterMonitoring} from './enroll';
import {NotFound} from './notfound';
import {Create} from './create.js';
import {Delete} from './delete.js';
import {LogIn} from './login.js';
import {LogViewer} from './logviewer.js';
import { ServiceDefine } from './service_define';
import Flow from "./react_flow_chart";
import {QueryClient, QueryClientProvider} from 'react-query'
import { DagDefine } from './dag_define';

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
  getItem('AI-Project', '1',<PieChartOutlined />, [
    getItem(<Link to ='project_list'>Project</Link>, 'project_list', <BarsOutlined />),
    getItem(<Link to ='monitoring/default'>Monitoring</Link>, 'monitoring', <DesktopOutlined />),
    getItem(<Link to ='editing/default'>DAG Editing</Link>, 'editing', <FormOutlined />)
  ]),
  getItem(<Link to ='storage'>MY Storage</Link>, 'my_storage', <FileSearchOutlined />),
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
  const [selectedKey, setSelectedKey] = useState('1')
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const changeTitle = (data) => {
    if(data == 'project_list')
      return '프로젝트'
    else if(data == 'monitoring')
      return '모니터링'
    else if(data == 'editing')
      return 'DAG 정의'
    return "Not Found"
  }

  const pageOnClick = (data) => {
      var key = data.key
      setSelectedKey(key)
  }
  return (
    <Content style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>

      <Header className="header" style={{ paddingInline:'16px'}}>
        <div className="logo" />
        <div
          style={{
            width:'200px',
            height:'100%',
            textAlign:'center',
            background: 'rgba(255, 255, 255, 0)',
          }}
        > <img id='image_aieyeflow' src='/images/logo_aieye.png' alt='image_aieyeflow' style={{height:'auto', width:'100%'}}/></div>
      </Header>
      <div ></div>
    <Layout
      style={{
        flex:1
        
      }}
    >

      {/* <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}> */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} > 
        <Menu theme="dark" defaultSelectedKeys={['1']} selectedKeys={[selectedKey]} mode="inline" items={items} onClick={pageOnClick}/>
      </Sider>
      <Layout className="site-layout">
        <Content
          style={{
            padding: '15px',
            backgroundColor : '#142C42',
            color:'#ffffff'
          }}
        >
        <QueryClientProvider client={queryClient}>
                <div id='body' >
                     <div id='body_main'>
                      <Content className="body-layout">
                      <h2>{changeTitle(selectedKey)}</h2>
                      <Routes>
                             <Route path='/' element={<Monitor />}></Route>
                             <Route path='/enroll' element={<EnrollClusterMonitoring />}></Route>
                             <Route path='/create' element={<Create />}></Route>
                             <Route path='/delete' element={<Delete />}></Route>
                             <Route path='/logviewer' element={<LogViewer />}></Route>
                             <Route path='/project_list/*' element={<ServiceDefine setPage={setSelectedKey}/>}></Route>
                             <Route path='/monitoring/:projectID' element={<Flow />}></Route>
                             <Route path='/editing/:projectID' element={<DagDefine />}></Route>
                             <Route path='/*' element={<NotFound />}></Route>
                         </Routes>
                      {/* </div> */}
                      </Content>
                      
                         
                     </div>
                 </div>
          </QueryClientProvider>
          {/* <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
            }}
          >
            Bill is a cat.
          </div> */}
        </Content>
        {/* <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Gedge AIFlow by Softonnet
        </Footer> */}
      </Layout>
    </Layout>

    </Content>
  );
};
export default App;
