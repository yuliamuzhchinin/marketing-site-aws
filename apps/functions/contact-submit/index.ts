import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ddb = new DynamoDBClient({});
const ses = new SESv2Client({ region: process.env.SES_REGION || process.env.AWS_REGION });

const TABLE = process.env.LEADS_TABLE!;
const SES_FROM = process.env.SES_FROM!;   // e.g. no-reply@trendnestmedia.com
const SES_TO = process.env.SES_TO!;       // your mom's real inbox

type Body = { name?: string; email?: string; phone?: string; message?: string };

export const handler = async (event: any) => {
  try {
    if (!event.body) return bad(400, "Missing body");
    const body: Body = JSON.parse(event.body);
    if (!body.name || !body.email || !body.message) return bad(400, "name, email, and message are required");

    const leadId = "lead_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const now = new Date().toISOString();

    await ddb.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        leadId:   { S: leadId },
        name:     { S: body.name },
        email:    { S: body.email },
        phone:    { S: body.phone ?? "" },
        message:  { S: body.message },
        createdAt:{ S: now }
      }
    }));

    const result = await ses.send(new SendEmailCommand({
      FromEmailAddress: SES_FROM,
      Destination: { ToAddresses: [SES_TO] },
      Content: {
        Simple: {
          Subject: { Data: `New lead from ${body.name}` },
          Body: {
            Text: { Data:
`A new lead was submitted:

Name: ${body.name}
Email: ${body.email}
Phone: ${body.phone ?? ""}

Message:
${body.message}

Lead ID: ${leadId}
Time: ${now}`
            }
          }
        }
      }
    }));
    console.log("SES MessageId:", result.MessageId);

    return ok({ id: leadId });
  } catch (err) {
    console.error("Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return bad(500, `Server error: ${msg}`); // keep this during testing
  }
};

function ok(data: any) { return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true, ...data }) }; }
function bad(status: number, error: string) { return { statusCode: status, headers: cors(), body: JSON.stringify({ ok: false, error }) }; }
function cors() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://www.trendnestmedia.com", // tighten if you want
    "Access-Control-Allow-Methods": "OPTIONS,POST"
  };
}
