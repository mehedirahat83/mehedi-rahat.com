import { isAdminRequest } from "@/app/admin-auth";
import { isActivationStatus, loadOrder, normalizeDomain } from "@/app/server/orderAccess";
import { getPool } from "@/db";

type ActivationBody={entitlementId?:unknown;activationId?:unknown;domain?:unknown;status?:unknown;note?:unknown};
const clean=(value:unknown,max:number)=>String(value??"").trim().slice(0,max);

export async function POST(request:Request,context:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest(request)))return Response.json({ok:false,error:"Unauthorized"},{status:401});
  const {id:orderId}=await context.params,body=await request.json().catch(()=>null) as ActivationBody|null,entitlementId=clean(body?.entitlementId,80),domain=normalizeDomain(body?.domain),note=clean(body?.note,1000);
  if(!entitlementId||!domain)return Response.json({ok:false,error:"Enter a valid domain name."},{status:400});
  const client=await getPool().connect();
  try{
    await client.query("BEGIN");
    const entitlement=await client.query<{id:string;activation_limit:number;status:string;order_status:string;license_id:string|null}>(`SELECT e.id,e.activation_limit,e.status,e.license_id,o.status AS order_status FROM entitlements e JOIN orders o ON o.id=e.order_id WHERE e.id=$1 AND e.order_id=$2 FOR UPDATE`,[entitlementId,orderId]);
    if(!entitlement.rows[0]){await client.query("ROLLBACK");return Response.json({ok:false,error:"Entitlement not found."},{status:404})}
    if(entitlement.rows[0].order_status!=="completed"||entitlement.rows[0].status!=="active"){await client.query("ROLLBACK");return Response.json({ok:false,error:"Complete the order before adding active domains."},{status:409})}
    if(!entitlement.rows[0].license_id){await client.query("ROLLBACK");return Response.json({ok:false,error:"Add the license ID before activating a domain."},{status:409})}
    const used=await client.query<{count:number}>("SELECT count(*)::int AS count FROM license_activations WHERE entitlement_id=$1 AND status<>'revoked'",[entitlementId]);
    if(Number(used.rows[0].count)>=Number(entitlement.rows[0].activation_limit)){await client.query("ROLLBACK");return Response.json({ok:false,error:`Activation limit reached (${entitlement.rows[0].activation_limit}).`},{status:409})}
    const now=new Date().toISOString(),activationId=crypto.randomUUID();
    await client.query("INSERT INTO license_activations (id,entitlement_id,domain,status,note,activated_at,created_at,updated_at) VALUES ($1,$2,$3,'active',$4,$5,$5,$5)",[activationId,entitlementId,domain,note||null,now]);
    await client.query("INSERT INTO license_activation_history (id,activation_id,from_status,to_status,note,actor,created_at) VALUES ($1,$2,NULL,'active',$3,'admin',$4)",[crypto.randomUUID(),activationId,note||"Domain activated",now]);
    await client.query("COMMIT");
    return Response.json({ok:true,order:await loadOrder(client,"id",orderId)},{status:201});
  }catch(error){await client.query("ROLLBACK").catch(()=>undefined);const code=error&&typeof error==="object"&&"code" in error?String(error.code):"";return Response.json({ok:false,error:code==="23505"?"This domain is already assigned to this license.":error instanceof Error?error.message:"Domain activation failed."},{status:code==="23505"?409:500})}finally{client.release()}
}

export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest(request)))return Response.json({ok:false,error:"Unauthorized"},{status:401});
  const {id:orderId}=await context.params,body=await request.json().catch(()=>null) as ActivationBody|null,activationId=clean(body?.activationId,80),status=body?.status,note=clean(body?.note,1000);
  if(!activationId||!isActivationStatus(status))return Response.json({ok:false,error:"Invalid activation update."},{status:400});
  const client=await getPool().connect();
  try{
    await client.query("BEGIN");
    const current=await client.query<{status:string;entitlement_id:string;activation_limit:number}>(`SELECT a.status,a.entitlement_id,e.activation_limit FROM license_activations a JOIN entitlements e ON e.id=a.entitlement_id WHERE a.id=$1 AND e.order_id=$2 FOR UPDATE`,[activationId,orderId]);
    if(!current.rows[0]){await client.query("ROLLBACK");return Response.json({ok:false,error:"Activation not found."},{status:404})}
    if(status!=="revoked"&&current.rows[0].status==="revoked"){const used=await client.query<{count:number}>("SELECT count(*)::int AS count FROM license_activations WHERE entitlement_id=$1 AND status<>'revoked'",[current.rows[0].entitlement_id]);if(Number(used.rows[0].count)>=Number(current.rows[0].activation_limit)){await client.query("ROLLBACK");return Response.json({ok:false,error:`Activation limit reached (${current.rows[0].activation_limit}).`},{status:409})}}
    const now=new Date().toISOString();
    await client.query("UPDATE license_activations SET status=$2,note=COALESCE(NULLIF($3,''),note),activated_at=CASE WHEN $2='active' THEN COALESCE(activated_at,$4) ELSE activated_at END,updated_at=$4 WHERE id=$1",[activationId,status,note,now]);
    if(current.rows[0].status!==status)await client.query("INSERT INTO license_activation_history (id,activation_id,from_status,to_status,note,actor,created_at) VALUES ($1,$2,$3,$4,$5,'admin',$6)",[crypto.randomUUID(),activationId,current.rows[0].status,status,note||`Domain changed to ${status}`,now]);
    await client.query("COMMIT");
    return Response.json({ok:true,order:await loadOrder(client,"id",orderId)});
  }catch(error){await client.query("ROLLBACK").catch(()=>undefined);return Response.json({ok:false,error:error instanceof Error?error.message:"Activation update failed."},{status:500})}finally{client.release()}
}
