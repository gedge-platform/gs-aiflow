import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Route,Routes} from 'react-router-dom';

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
import App from './app';

class Main extends React.Component {
  render() {
    return (

      <BrowserRouter>
        <App></App>
      </BrowserRouter>
      // <>
      //   <BrowserRouter>
      //       <section id='main_wrap'>

      //       <Routes>
      //       <Route path='/login' element={<LogIn />}></Route></Routes>
      //           <div id='side'>
      //               <Sidemenu />
      //           </div>
      //           <div id='body'>
      //               <div id='body_main'>
      //                   <Routes>
      //                       <Route path='/' element={<Monitor />}></Route>
      //                       <Route path='/enroll' element={<EnrollClusterMonitoring />}></Route>
      //                       <Route path='/create' element={<Create />}></Route>
      //                       <Route path='/delete' element={<Delete />}></Route>
      //                       <Route path='/logviewer' element={<LogViewer />}></Route>
      //                       <Route path='/service_define/*' element={<ServiceDefine />}></Route>
      //                       <Route path='/*' element={<NotFound />}></Route>
      //                   </Routes>
      //               </div>
      //           </div>
      //       </section>
      //   </BrowserRouter>
      // </>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Main />
);

