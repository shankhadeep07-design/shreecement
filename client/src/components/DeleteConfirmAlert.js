export function DeleteConfirmAlert(props){
    return (
        <div className='custom-ui delete_popup_box'>
          <h1>Are you sure ?</h1>
          <p>You want to delete this record ?</p>
          <div className='delete_button_box'>
            <button className='btn btn-info mr-1' onClick={props.onClose()}>Cancel</button>
            <button className='btn btn-danger'>
                Yes, Delete it!
            </button>
          </div>
        </div>
    );
}