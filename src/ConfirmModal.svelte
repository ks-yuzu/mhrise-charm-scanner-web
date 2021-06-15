<script>
  import MDBBtn         from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBBtnGroup    from 'mdbsvelte/src/MDBBtnGroup.svelte'
  import MDBModal       from 'mdbsvelte/src/MDBModal.svelte'
  import MDBModalBody   from 'mdbsvelte/src/MDBModalBody.svelte'
  import MDBModalHeader from 'mdbsvelte/src/MDBModalHeader.svelte'
  import MDBModalFooter from 'mdbsvelte/src/MDBModalFooter.svelte'

  export let message
	export let onOkay   = () => {}
  export let onCancel = () => {}
  export let colorOkayButton = 'primary'
  export let labelOkayButton = 'OK'

  let isOpen = false;

  export const confirm = (params) => {
    return new Promise((resolve, reject) => {
      message         = params.message || ''
      colorOkayButton = params.colorOkayButton || 'primary'
      labelOkayButton = params.labelOkayButton || 'OK'

	    onOkay   = () => {
        (params.onOkay   || (() => {}))()
        resolve(true)
      }
      onCancel = () => {
        (params.onCancel || (() => {}))()
        reject('cancel')
      }

      isOpen = true
    })
  }

  function toggle() {
    isOpen = !isOpen
  }

  function _onCancel() {
    isOpen = false
		onCancel()
	}

	function _onOkay(param) {
    isOpen = false
		onOkay(param)
	}
</script>

<MDBModal isOpen={isOpen} toggle={toggle}>
  <MDBModalHeader toggle={toggle}>確認</MDBModalHeader>
  <MDBModalBody>
    {message}
  </MDBModalBody>
  <MDBModalFooter>
    <MDBBtn color={colorOkayButton} on:click={_onOkay}>{labelOkayButton}</MDBBtn>
    <MDBBtn color="primary" outline on:click={_onCancel}>Cancel</MDBBtn>
  </MDBModalFooter>
</MDBModal>
