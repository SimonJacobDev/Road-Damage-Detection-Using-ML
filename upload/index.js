// Access the device camera and stream video to the video element
async function startCamera() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

// Capture image from the video element
function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    document.body.appendChild(img);

    return canvas.toDataURL('image/png');
}

// Upload the captured image to the backend
async function uploadImage(imageData) {
    const response = await fetch('/predict', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    document.getElementById('result').innerText = result.potholeDetected
        ? 'Pothole detected!'
        : 'No pothole detected.';
}

// Event listeners for the capture and upload buttons
document.getElementById('captureButton').addEventListener('click', () => {
    captureImage();  // Capture the image
    document.getElementById('uploadButton').style.display = 'block';  // Show upload button
});

document.getElementById('uploadButton').addEventListener('click', () => {
    const imageData = captureImage();  // Capture the image again for upload
    uploadImage(imageData);  // Send the image data to the backend
});

// Start the camera when the page loads
startCamera();