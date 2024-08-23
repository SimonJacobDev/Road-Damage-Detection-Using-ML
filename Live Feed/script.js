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

    const imageData = canvas.toDataURL('image/png'); // Convert canvas to Base64 image
    return imageData; // Return Base64 image data
}

// Upload the captured image to the backend for pothole detection
async function uploadImage() {
    const imageData = captureImage(); // Capture image
    const response = await fetch('/api/detect-pothole', {
        method: 'POST',
        body: JSON.stringify({ image: imageData }), // Send Base64 image to backend
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json(); // Get the result from backend
    document.getElementById('result').innerText = result.potholeDetected
        ? 'Pothole detected!' // Display result
        : 'No pothole detected.';
}

// Event listener for the capture button
document.getElementById('captureButton').addEventListener('click', () => {
    uploadImage(); // Capture and upload image on button click
});

// Start the camera when the page loads
startCamera();
