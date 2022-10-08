<script lang="ts">
  interface ConfirmParams {
    message:         string
    okayButtonColor: string
    okayButtonLabel: string
    isCheckboxShown: boolean
    checkboxLabel:   string
    onOkay:          (event: CustomEvent) => void
    onCancel:        (event: CustomEvent) => void
  }

  import MDBBtn         from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBInput       from 'mdbsvelte/src/MDBInput.svelte'
  import MDBModal       from 'mdbsvelte/src/MDBModal.svelte'
  import MDBModalBody   from 'mdbsvelte/src/MDBModalBody.svelte'
  import MDBModalHeader from 'mdbsvelte/src/MDBModalHeader.svelte'
  import MDBModalFooter from 'mdbsvelte/src/MDBModalFooter.svelte'

  let _isOpen = false;
  let _params: ConfirmParams

  let _resolve
  let _reject

  export const confirm = (params: Partial<ConfirmParams>) => {
    return new Promise((resolve, reject) => {
      _resolve = resolve
      _reject  = reject

      _params = Object.assign({
        message:         '',
        okayButtonColor: 'primary',
        okayButtonLabel: 'OK',
        isCheckboxShown: false,
        checkboxLabel:   '',
        onOkay:          () => {},
        onCancel:        () => {},
      }, params)

      _isOpen = true
    })
  }

  function toggle() {
    _isOpen = !_isOpen
  }

  function _onOkay(event: CustomEvent) {
    _isOpen = false
    _params.onOkay(event)
    _resolve(true)
  }

  function _onCancel(event: CustomEvent) {
    _isOpen = false
    _params.onCancel(event)
    _reject('cancel')
  }
</script>

<MDBModal isOpen={_isOpen} toggle={toggle}>
  <MDBModalHeader toggle={toggle}>確認</MDBModalHeader>
  <MDBModalBody>
    <div id="message-area">{_params.message}</div>
    <div id="checkbox-area">
    {#if _params.isCheckboxShown}
      <label>
        <input type="checkbox" />
        {_params.checkboxLabel}
      </label>
    {/if}
    </div>
  </MDBModalBody>
  <MDBModalFooter>
    <MDBBtn color={_params.okayButtonColor} on:click={_onOkay}>{_params.okayButtonLabel}</MDBBtn>
    <MDBBtn color="primary" outline on:click={_onCancel}>Cancel</MDBBtn>
  </MDBModalFooter>
</MDBModal>

<style>
  :global(#checkbox-area) {
    margin: 0.5rem 0 0 0;
  }
</style>
