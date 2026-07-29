"use client";
import {useEffect,useState} from "react";
import {loadReviews,seedReviews,StoreReview} from "./reviewStore";
import {loadHomepageSettings,seedHomepageSettings} from "./homepageStore";
export default function HomeReviews(){
  const[reviews,setReviews]=useState<StoreReview[]>(seedReviews),[home,setHome]=useState(seedHomepageSettings);
  useEffect(()=>{const sync=()=>{setReviews(loadReviews().filter(item=>item.status==="Published").sort((a,b)=>a.order-b.order));setHome(loadHomepageSettings())};sync();window.addEventListener("mr-reviews-updated",sync);window.addEventListener("mr-homepage-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-reviews-updated",sync);window.removeEventListener("mr-homepage-updated",sync);window.removeEventListener("storage",sync)}},[]);
  const average=reviews.length?(reviews.reduce((sum,item)=>sum+item.rating,0)/reviews.length).toFixed(1):"0.0";
  if(!home.reviewsVisible)return null;
  return <section className="section testimonial-section" id="testimonials"><div className="shell">
    <div className="section-heading"><div><span className="eyebrow">{home.reviewsEyebrow}</span><h2>{home.reviewsTitle} <em>{home.reviewsHighlight}</em></h2></div><div className="rating-summary"><strong>{average}</strong><span>★★★★★<small>Customer rating</small></span></div></div>
    <div className="testimonial-grid">{reviews.map(review=><figure key={review.id} className="testimonial-card reveal"><div className="testimonial-top">{review.photo?<img src={review.photo} alt={review.name}/>:<i className="review-avatar">{review.name.charAt(0)}</i>}<div><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><small>Verified client</small></div><div className="quote-mark">&ldquo;</div></div><blockquote>{review.quote}</blockquote><figcaption><div><b>{review.name}</b><small>{review.role}{review.company?` · ${review.company}`:""}</small></div><span className="review-check">✓</span></figcaption></figure>)}</div>
  </div></section>
}
