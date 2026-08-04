import { customerId, now } from "@/app/customer-auth";
import { encryptActivationPassword } from "@/app/server/activationCredentials";
import { adminNotificationEmail, sendSupportTicketEmail } from "@/app/server/mail";
import { getPool } from "@/db";
import { randomUUID } from "crypto";

const clean=(value:unknown,max:number)=>String(value??"").trim().slice(0,max);

export async function GET(request:Request){
  const customer=customerId(request); if(!customer)return Response.json({ok:false,error:"Sign in to view support tickets."},{status:401});
  const pool=getPool();
  const [orders,tickets,messages]=await Promise.all([
    pool.query(`SELECT o.id,o.order_number AS "orderNumber",COALESCE(string_agg(DISTINCT oi.name, ', '),'') AS products FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id WHERE o.customer_id=$1 AND o.status='completed' GROUP BY o.id ORDER BY o.created_at DESC,o.id DESC`,[customer]),
    pool.query(`SELECT t.id,t.subject,t.priority,t.status,t.created_at AS "createdAt",t.updated_at AS "updatedAt",o.order_number AS "orderNumber",COALESCE(string_agg(DISTINCT oi.name, ', '),'') AS products FROM support_tickets t JOIN orders o ON o.id=t.order_id LEFT JOIN order_items oi ON oi.order_id=o.id WHERE t.customer_id=$1 GROUP BY t.id,o.order_number ORDER BY t.updated_at DESC,t.id DESC`,[customer]),
    pool.query(`SELECT m.id,m.ticket_id AS "ticketId",m.author_type AS "authorType",m.author_name AS "authorName",m.body,m.created_at AS "createdAt" FROM support_ticket_messages m JOIN support_tickets t ON t.id=m.ticket_id WHERE t.customer_id=$1 ORDER BY m.created_at ASC,m.id ASC`,[customer])
  ]);
  return Response.json({ok:true,orders:orders.rows,tickets:tickets.rows.map(ticket=>({...ticket,messages:messages.rows.filter(message=>message.ticketId===ticket.id)}))});
}

export async function POST(request:Request){
  const customer=customerId(request); if(!customer)return Response.json({ok:false,error:"Sign in to create a support ticket."},{status:401});
  const input=await request.json().catch(()=>null); const orderId=clean(input?.orderId,120),subject=clean(input?.subject,160),body=clean(input?.body,4000),priority=clean(input?.priority,20)||"normal",loginUrl=clean(input?.loginUrl,500),username=clean(input?.username,254),password=clean(input?.password,500);
  if(!orderId||!subject||!body||!loginUrl||!username||!password)return Response.json({ok:false,error:"Order number, website login access, username, password, subject and message are required."},{status:400});
  if(!["low","normal","high","urgent"].includes(priority))return Response.json({ok:false,error:"Invalid priority."},{status:400});
  try{const parsed=new URL(loginUrl);if(!["http:","https:"].includes(parsed.protocol))throw new Error()}catch{return Response.json({ok:false,error:"Enter a valid website login access link."},{status:400})}
  const pool=getPool(); const order=await pool.query("SELECT id,order_number FROM orders WHERE id=$1 AND customer_id=$2 AND status='completed'",[orderId,customer]);
  if(!order.rowCount)return Response.json({ok:false,error:"Choose one of your completed orders."},{status:400});
  const customerRow=await pool.query("SELECT name,email FROM customers WHERE id=$1",[customer]); const createdAt=now(),id=randomUUID();
  const client=await pool.connect(); try{await client.query("BEGIN");await client.query("INSERT INTO support_tickets (id,customer_id,order_id,subject,priority,status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,'open',$6,$6)",[id,customer,orderId,subject,priority,createdAt]);await client.query("INSERT INTO support_ticket_messages (id,ticket_id,author_type,author_name,body,created_at) VALUES ($1,$2,'customer',$3,$4,$5)",[randomUUID(),id,customerRow.rows[0]?.name||"Customer",body,createdAt]);await client.query("UPDATE orders SET activation_login_url=$1,activation_username=$2,activation_password_encrypted=$3,updated_at=$4 WHERE id=$5",[loginUrl,username,encryptActivationPassword(password),createdAt,orderId]);await client.query("COMMIT");}catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
  const adminEmail=await adminNotificationEmail();
  if(adminEmail) void sendSupportTicketEmail({to:adminEmail,subject:`New support ticket · ${order.rows[0].order_number}`,message:`${customerRow.rows[0]?.name||"A customer"} opened “${subject}” (${priority} priority) for ${order.rows[0].order_number}.\n\n${body}`}).catch(()=>undefined);
  return Response.json({ok:true,message:"Support ticket created. Our team will reply here."},{status:201});
}
