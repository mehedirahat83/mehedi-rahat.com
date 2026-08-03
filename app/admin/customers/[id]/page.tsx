import AdminCustomerDetail from "../../AdminCustomerDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <AdminCustomerDetail id={(await params).id} />; }
