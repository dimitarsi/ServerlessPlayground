import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  APIGatewayAuthorizerEvent,
  APIGatewayEvent,
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
  APIGatewayRequestAuthorizerEventV2,
  Handler,
} from "aws-lambda";

interface Payload {
  password?: string;
}

export const handler: Handler = async (
  event: APIGatewayProxyEventV2,
  context,
  callback
) => {
  if (event.requestContext.http.method !== "POST" || !event.body) {
    return callback(null, {
      statusCode: 200,
      headers: {
        "content-type": "application-json",
        // "Access-Control-Allow-Origin": "http://localhost",
      },
      body: JSON.stringify({
        error:
          "invalid method - " +
          event.requestContext.http.method +
          " - expected POST",
        event,
        context,
      }),
    });
  }
  try {
    const body: Payload = JSON.parse(event.body);

    if (body && body.password && body.password === process.env.AUTH_PASSWORD) {
      if (!event.queryStringParameters || !event.queryStringParameters.target) {
        throw "Invlid Parameters";
      }

      const bucketParams = {
        Bucket: process.env.UPLOAD_BUCKET,
        Key: event.queryStringParameters.target,
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
          // "Access-Control-Allow-Origin": "http://localhost",
        },
        body: JSON.stringify(signedRequest),
      });
    }
  } catch (e) {
    callback(null, {
      statusCode: 200,
      headers: {
        "content-type": "application-json",
        // "Access-Control-Allow-Origin": "http://localhost",
      },
      body: JSON.stringify({ error: "invalid body", event, e }),
    });
  }
};
