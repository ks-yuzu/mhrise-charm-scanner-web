<script>
export let isRecording = false
export let label = 'Recording'
</script>

<div>
  <button id="rec-button"
          class:recording={isRecording}
          on:click={() => isRecording = !isRecording}
          />
  <label for="rec-button">{label}</label>
</div>

<style>
div {
  display: flex;
  align-items: center;
}

label {
  font-size: 1.1rem;
  margin: 0 0 0.03rem 0.4rem;
}

button {
	width:  1rem;
	height: 1rem;
	font-size: 0;
	/*background-color: red;*/
	border: 0;
	border-radius: 1rem;
	margin: 1rem 0;
	outline: none;
}

button { /* not recording */
	background-color: darkred;
}

.recording {
	background-color: red;
	animation-name: pulse;
	animation-duration: 1.5s;
	animation-iteration-count: infinite;
	animation-timing-function: linear;
}

@keyframes pulse{
	 0%{ box-shadow: 0px 0px 5px  0px rgba(173, 0, 0, 0.3); }
	65%{ box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0.3); }
	90%{ box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0); }
}
</style>
