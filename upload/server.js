const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const tf = require('@tensorflow/tfjs-node');
const { loadGraphModel } = require('@tensorflow/tfjs-node');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Load the pre-trained model
let model;
async function loadModel() {
    model = await loadGraphModel('file://path/to/your/model/model.json');
}
loadModel();

app.post('/api/detect-pothole', async (req, res) => {
    const { image } = req.body;

    // Decode the image
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Process the image and detect pothole
    const imageTensor = tf.node.decodeImage(buffer);
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]); // Adjust size as needed
    const prediction = model.predict(resizedTensor.expandDims(0));
    const result = prediction.arraySync()[0][0] > 0.5; // Adjust based on your model

    // Send email if pothole detected
    if (result) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password'
            }
        });

        let mailOptions = {
            from: 'your-email@gmail.com',
            to: 'recipient-email@gmail.com',
            subject: 'Pothole Detected',
            text: 'A pothole has been detected. Please check the attached image.',
            attachments: [{ filename: 'pothole.png', content: buffer }]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            }
        });
    }

    res.json({ potholeDetected: result });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});