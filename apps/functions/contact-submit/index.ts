// apps/functions/contact-submit/index.ts
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDBClient({});
const TABLE = process.env.LEADS_TABLE!;

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export const handler = async (event: any) => {
  try {
    if (!event.body) return bad(400, 'Missing body');

    const body: Body = JSON.parse(event.body);
    if (!body.name || !body.email || !body.message) {
      return bad(400, 'name, email, and message are required');
    }

    const leadId = randomId();
    const now = new Date().toISOString();

    await ddb.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        leadId:   { S: leadId },
        name:     { S: body.name },
        email:    { S: body.email },
        phone:    { S: body.phone ?? '' },
        message:  { S: body.message },
        createdAt:{ S: now }
      }
    }));

    return ok({ id: leadId });
  } catch (err: any) {
    console.error('Error:', err);
    return bad(500, 'Server error');
  }
};

function ok(data: any) {
  return { statusCode: 200, headers: cors(), body: JSON.stringify({ ok: true, ...data }) };
}
function bad(status: number, error: string) {
  return { statusCode: status, headers: cors(), body: JSON.stringify({ ok: false, error }) };
}
function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  };
}
function randomId() {
  return 'lead_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
