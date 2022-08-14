import { APIGatewayEvent, Handler } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface Payload {
  password?: string;
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context,
  callback
) => {
  if (event.httpMethod !== "POST" || !event.body) {
    return callback("Method not allowed");
  }
  try {
    const body: Payload = JSON.parse(event.body);

    if (body && body.password && body.password === process.env.AUTH_PASSWORD) {
      if (!event.pathParameters || !event.pathParameters.target) {
        throw "Invlid Parameters";
      }

      const bucketParams = {
        Bucket: process.env.UPLOAD_BUCKET,
        Key: event.pathParameters.target,
        Body: "BODY",
      };

      // TODO: Parameterize the region
      const client = new S3Client({ region: "eu-central-1" });
      const command = new PutObjectCommand(bucketParams);
      const signedRequest = await getSignedUrl(client, command, {
        expiresIn: 300,
      });

      callback(null, {
        statusCode: 200,
        headers: {
          "content-type": "application-json",
        },
        body: JSON.stringify(signedRequest),
      });
    }
  } catch (e) {
    callback("Invalid body", e);
  }
};
