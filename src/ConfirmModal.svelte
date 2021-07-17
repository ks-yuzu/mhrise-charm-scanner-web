<script lang="ts">
  interface ConfirmParams {
    message?:         string
    colorOkayButton?: string
    labelOkayButton?: string
    onOkay?:          (label: string) => void
    onCancel?:        () => void
  }

  import MDBBtn         from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBModal       from 'mdbsvelte/src/MDBModal.svelte'
  import MDBModalBody   from 'mdbsvelte/src/MDBModalBody.svelte'
  import MDBModalHeader from 'mdbsvelte/src/MDBModalHeader.svelte'
  import MDBModalFooter from 'mdbsvelte/src/MDBModalFooter.svelte'

  let message
  let onOkay
  let onCancel
  let colorOkayButton = 'primary'
  let labelOkayButton = 'OK'

  let isOpen = false;

  export const confirm = (params: ConfirmParams) => {
    return new Promise((resolve, reject) => {
      message         = params.message         || ''
      colorOkayButton = params.colorOkayButton || 'primary'
      labelOkayButton = params.labelOkayButton || 'OK'

      onOkay   = (label: string) => {
        (params.onOkay   || ((label: string) => {}))(label)
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
