const video = document.getElementById('camera'), canvas = document.getElementById('canvas');

const studentSelect = document.getElementById('student');
const sampleCount = document.getElementById('sample-count');
const sampleBar = document.getElementById('sample-bar');

function updateSampleProgress() {
    const selectedOption = studentSelect.options[studentSelect.selectedIndex];
    const count = Number(selectedOption.dataset.count || 0);

    sampleCount.textContent = `${count} / 20`;
    sampleBar.style.width = `${Math.min((count / 20) * 100, 100)}%`;
}

studentSelect?.addEventListener('change', updateSampleProgress);

if (studentSelect) {
    updateSampleProgress();
}

const start = document.getElementById('start'), capture = document.getElementById('capture'), statusText = document.getElementById('camera-status');
start?.addEventListener('click', async () => {
  try { video.srcObject = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false}); await video.play(); capture.disabled=false; start.disabled=true; statusText.textContent='Camera ready. Capture clear samples.'; }
  catch(e) { statusText.textContent='Camera permission was denied or no camera was found.'; }
});

 
capture?.addEventListener('click', async () => {
  if (!video.videoWidth) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  const data = new FormData();
  data.append('student_id', document.getElementById('student').value);
  data.append('image', canvas.toDataURL('image/jpeg', .9));

  capture.disabled = true;
  statusText.textContent = 'Detecting face…';

  try {
    const response = await fetch('/api/enrol', {
      method: 'POST',
      body: data
    });

    const result = await response.json();

    
if (result.ok) {
    const count = result.count;

    const selectedOption = studentSelect.options[studentSelect.selectedIndex];
    selectedOption.dataset.count = count;

    updateSampleProgress();

    statusText.textContent = count >= 20
        ? 'Sample target reached! You can train the model.'
        : `${result.message}. Total samples: ${count}`;
} else {
    statusText.textContent = result.message;
}
 

  } catch (e) {
    statusText.textContent = 'Could not save sample. Please try again.';
  } finally {
    capture.disabled = false;
  }
});


