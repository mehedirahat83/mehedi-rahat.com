"use client";
import { useEffect,useState } from "react";
import SiteFooter from "../SiteFooter";
import MainHeader from "../MainHeader";
import { loadProductFaq,loadProducts,StoreProduct } from "../productStore";
type CartItem={id:string;name:string;category:string;variation:string;price:number;quantity:number};

function Arrow(){return <span aria-hidden="true">↗</span>}

const reviews=[
  ["Fast activation and helpful support.","Nayeem Hasan"],
  ["The process was clear and the product worked perfectly.","Sabbir Ahmed"],
  ["Quick response and dependable after-sales support.","Farhana Islam"],
  ["Everything was delivered exactly as described.","Rakib Hossain"],
  ["A smooth purchase experience from start to finish.","Tanvir Rahman"],
];

export default function ProductPage(){
  const [product,setProduct]=useState<StoreProduct|null>(null),[products,setProducts]=useState<StoreProduct[]>([]),[selected,setSelected]=useState(0),[added,setAdded]=useState(false);
  useEffect(()=>{
    const id=new URLSearchParams(location.search).get("id");
    const all=loadProducts().filter(x=>x.status==="Published");
    setProducts(all);
    setProduct(all.find(x=>x.id===id)||null);
  },[]);
  if(!product)return <main><div className="success-page"><div className="success-card"><h1>Product not found.</h1><p>This product may be unpublished or removed.</p><a className="button primary" href="/products">Browse products</a></div></div></main>;

  const productId=product.id;
  const productName=product.name;
  const productCategory=product.category;
  const variation=product.variations[selected]||product.variations[0];
  const related=products.filter(item=>item.id!==productId).slice(0,7);
  const faqs=loadProductFaq().split("\n").filter(Boolean).map(row=>{const splitAt=row.indexOf("|");return splitAt<0?[row,"Please contact support for details."]:[row.slice(0,splitAt),row.slice(splitAt+1)]});
  function add(){
    const cart=JSON.parse(localStorage.getItem("mr-cart")||"[]") as CartItem[];
    const id=`${productId}-${variation.label}`;
    const exists=cart.find(item=>item.id===id);
    if(exists)exists.quantity++;
    else cart.push({id,name:productName,category:productCategory,variation:variation.label,price:variation.price,quantity:1});
    localStorage.setItem("mr-cart",JSON.stringify(cart));
    setAdded(true);
  }

  return <main>
    <MainHeader active="products"/>
    <div className="product-breadcrumb"><div className="shell"><a href="/">Home</a><span>›</span><a href="/products">Products</a><span>›</span><b>{product.name}</b></div></div>

    <section className="section product-detail-section"><div className="shell product-detail-grid">
      <div className="detail-media-card">
        <div className="detail-art">{product.image?<img src={product.image} alt={product.name}/>:<><span className="detail-license">{product.license}</span><div className="detail-logo">{product.name.charAt(0)}</div><b>{product.name.toUpperCase()}</b><small>PRO</small></>}</div>
        <div className="detail-quick-links"><a className="detail-demo" href={product.demo||"#product-description"} target={product.demo?"_blank":undefined} title={product.demo?"Open live demo":"Live demo link will be added from the Admin Dashboard"}>Live Demo <Arrow/></a><a href="#faq">FAQ</a></div>
        <a className="detail-resell-link" href="#resell">Resell Our Tools <Arrow/></a>
      </div>
      <div className="detail-purchase-card">
        <span className="product-category">{product.category}</span><h1>{product.name}</h1>
        <div className="detail-rating"><span>★★★★★</span><strong>{product.rating.toFixed(1)}</strong><small>{product.reviewCount} verified reviews</small></div>
        <div className="detail-facts">{product.information.map(item=><div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div>
        <div className="detail-variation"><label>Choose site variation</label><div>{product.variations.map((item,index)=><button className={selected===index?"active":""} onClick={()=>{setSelected(index);setAdded(false)}} key={item.label}>{item.label}</button>)}</div></div>
        <div className="detail-buy-row"><div><small>Your price</small><strong>৳ {variation.price.toLocaleString("en-US")}</strong></div><button className={added?"added":""} onClick={add}>{added?"Added to Cart ✓":"Add to Cart"}</button></div>
        <p className="detail-safe-note">✓ Secure local payment · Fast assisted activation</p>
      </div>
      <aside className="related-tools-card">
        <div className="related-heading"><span className="eyebrow">More products</span><h2>You may also need.</h2></div>
        <div className="related-list">{related.map((item,index)=><a href={`/product?id=${item.id}`} key={item.id}><span className={`related-icon related-icon-${index%4+1}`}>{item.name.charAt(0)}</span><div><b>{item.name}</b><small>From ৳ {item.price.toLocaleString("en-US")}</small></div><Arrow/></a>)}</div>
        <a className="related-all" href="/products">View all products <Arrow/></a>
      </aside>
    </div>
    <div className="shell product-policy-note"><span className="policy-icon">i</span><div><span className="policy-label">Please read before ordering</span><b>Important activation information</b><p>Our all premium tools license are 100% official. We don’t provide any GPL, null or crack tools. Also we don’t provide license key. We will activate our license on your site. <strong>Need your Temp Login access or WP admin pass for activation.</strong> If you don’t want to share admin pass, please don’t place order.</p></div></div></section>

    <section className="section product-content-section" id="product-description"><div className="shell product-content-grid">
      <article className="product-description-card"><span className="eyebrow">Product description</span><h2>{product.name}</h2><div className="product-rich-description" dangerouslySetInnerHTML={{__html:product.description}}/><div className="description-points">{product.features.split("\n").filter(Boolean).map(item=><span key={item}>{item}</span>)}</div></article>
      <aside className="product-review-card"><span className="eyebrow">Customer reviews</span><div className="review-overview"><strong>{product.rating.toFixed(1)}</strong><div><span>★★★★★</span><small>{product.reviewCount} verified customer reviews</small></div></div><div className="review-list">{reviews.map(([text,name])=><blockquote key={name}><span>★★★★★</span><p>{text}</p><footer><b>{name}</b><small>Verified purchase</small></footer></blockquote>)}</div></aside>
    </div></section>

    <section className="section product-faq-section" id="faq"><div className="shell product-faq-grid"><div><span className="eyebrow">Product FAQ</span><h2>Answers before you purchase.</h2><p>Product information managed from the Admin Dashboard.</p></div><div className="product-faq-list">{faqs.length?faqs.map((item,index)=><details open={index===0} key={item[0]}><summary>{item[0]}<span>+</span></summary><p>{item[1]}</p></details>):<p>No FAQ has been added yet.</p>}</div></div></section>
    <section className="section product-resell-section" id="resell"><div className="shell product-resell-panel"><div><span className="eyebrow">Resell our tools</span><h2>Offer trusted tools to your clients.</h2></div><a className="button primary" href="#support">Discuss reseller access <Arrow/></a></div></section>
    <SiteFooter/>
  </main>
}
