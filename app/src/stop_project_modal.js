

const StopProjectModal = (props) => {
  const projectName = props.project_name
  console.log(props)

  return (
    <div id='stop_project_modal'>
      {projectName} 를 정지하시겠습니까?
    
    </div>
  );
}

export default StopProjectModal;