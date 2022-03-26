<script lang="ts">
  interface ConfirmParams {
    message?:         string
    colorOkayButton?: string
    labelOkayButton?: string
    onOkay?:          (event: CustomEvent) => void
    onCancel?:        (event: CustomEvent) => void
  }

  import MDBBtn         from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBModal       from 'mdbsvelte/src/MDBModal.svelte'
  import MDBModalBody   from 'mdbsvelte/src/MDBModalBody.svelte'
  import MDBModalHeader from 'mdbsvelte/src/MDBModalHeader.svelte'
  import MDBModalFooter from 'mdbsvelte/src/MDBModalFooter.svelte'

  let message:         string
  let onOkay:          (event: CustomEvent) => void
  let onCancel:        (event: CustomEvent) => void
  let colorOkayButton: string
  let labelOkayButton: string

  let isOpen = false;

  export const confirm = (params: ConfirmParams) => {
    return new Promise((resolve, reject) => {
      message         = params.message         || ''
      colorOkayButton = params.colorOkayButton || 'primary'
      labelOkayButton = params.labelOkayButton || 'OK'

      onOkay   = (event: CustomEvent) => {
        (params.onOkay   || (() => {}))(event)
        resolve(true)
      }
      onCancel = (event: CustomEvent) => {
        (params.onCancel || (() => {}))(event)
        reject('cancel')
      }

      isOpen = true
    })
  }

  function toggle() {
    isOpen = !isOpen
  }

  function _onCancel(event: CustomEvent) {
    isOpen = false
    onCancel(event as CustomEvent)
  }

  function _onOkay(event: CustomEvent) {
    isOpen = false
    onOkay(event as CustomEvent)
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
