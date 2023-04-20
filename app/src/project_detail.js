import React from "react";
import { useQuery } from "react-query";
import {Row, Col} from "antd"
import axios from "axios";


function ProjectDetail(props) {
  const [selectedProject, setSelectedProject] = props.setSelectedProject;
  const columns = [
    {
      title: '프로젝트 이름',
      dataIndex: 'project_name',
      key: 'project_name',
      width:400,
    },
  ];
    var id = props.id;

      const getProjectDetail = async ( ) => {
        if(selectedProject != ""){
          const { data } = await axios.get(process.env.REACT_APP_API+'/api/project/' + selectedProject);
          console.log(data)
          return data;
        }

        return {projectDescription:"", created_at:"", clusterList:[]}
      }
      const { isLoading, isError, data, error, refetch } = useQuery(["detail" + selectedProject], () => {return getProjectDetail();}, {
        refetchOnWindowFocus:false,
        retry:0,
    });




    return (
        <> < div id = 'project_detail' > 

    

<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Project name</h4></Col>
<Col className="project_detail_col data" span={6}><h4>{selectedProject}</h4></Col>
<Col className="project_detail_col head" span={6}><h4>User ID</h4></Col>
<Col className="project_detail_col data" span={6}><h4>{id}</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Project description</h4></Col>
<Col className="project_detail_col data" span={18}><h4>{!isLoading && data.projectDescription}</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Cluster List</h4></Col>
<Col className="project_detail_col data" span={18}><h4>{!isLoading && data.clusterList.join(', ')}</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Create At</h4></Col>
<Col className="project_detail_col data" span={6}><h4>{!isLoading && data.created_at}</h4></Col>
<Col className="project_detail_col head" span={6}><h4>Total Node</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Cron Job</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
<Col className="project_detail_col head" span={6}><h4>Pod</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Service</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
<Col className="project_detail_col head" span={6}><h4>Daemonset</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
</Row>
<Row className="project_detail_row">
<Col className="project_detail_col head" span={6}><h4>Statefulset</h4></Col>
<Col className="project_detail_col data" span={6}><h4>col-12</h4></Col>
<Col className="project_detail_col head" span={6}></Col>
<Col className="project_detail_col data" span={6}></Col>
</Row>
    
    
    </div>
    </>
    
    );
}

export {
  ProjectDetail
};
