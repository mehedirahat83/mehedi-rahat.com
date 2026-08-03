import { isAdminRequest } from "@/app/admin-auth";
import { loadOrder } from "@/app/server/orderAccess";
import { getPool } from "@/db";

export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
  if(!(await isAdminRequest(request)))return Response.json({ok:false,error:"Unauthorized"},{status:401});
  const {id:orderId}=await context.params,body=await request.json().catch(()=>null) as {entitlementId?:unknown;licenseId?:unknown}|null;
  const entitlementId=String(body?.entitlementId??"").trim().slice(0,80),licenseId=String(body?.licenseId??"").trim().toUpperCase().slice(0,120);
  if(!entitlementId||!licenseId||!/^[-A-Z0-9._/]+$/.test(licenseId))return Response.json({ok:false,error:"Enter a valid license ID."},{status:400});
  const client=await getPool().connect();
  try{
    const updated=await client.query("UPDATE entitlements SET license_id=$3 WHERE id=$1 AND order_id=$2 RETURNING id",[entitlementId,orderId,licenseId]);
    if(!updated.rows[0])return Response.json({ok:false,error:"Entitlement not found."},{status:404});
    return Response.json({ok:true,order:await loadOrder(client,"id",orderId)});
  }catch(error){const code=error&&typeof error==="object"&&"code" in error?String(error.code):"";return Response.json({ok:false,error:code==="23505"?"This license ID is already assigned to another product.":error instanceof Error?error.message:"License ID could not be saved."},{status:code==="23505"?409:500})}finally{client.release()}
}
