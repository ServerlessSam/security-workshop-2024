// lambda/index.js

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client();

exports.handler = async (event) => {
    const { patientName, nationalinsurancenumber, diagnosisId, diagnosisDetails, date } = JSON.parse(event.body);

    const fileName = `${nationalinsurancenumber}/${date}/${diagnosisId}.json`;

    const fileContent = JSON.stringify({
        patientName,
        nationalinsurancenumber,
        diagnosisId,
        diagnosisDetails,
        date,
    }, null, 2);

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: "application/json",
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "File created successfully!" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error creating file", error: error.message }),
        };
    }
};