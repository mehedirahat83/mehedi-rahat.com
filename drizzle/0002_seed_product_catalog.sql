INSERT INTO "product_categories" ("id","slug","name","description","status","sort_order")
VALUES
  ('page-builder','page-builder','Page Builder','Visual page-building products.','active',1),
  ('dynamic-toolkit','dynamic-toolkit','Dynamic Toolkit','Dynamic content and site-building tools.','active',2),
  ('theme-bundle','theme-bundle','Theme Bundle','Premium WordPress theme bundles.','active',3),
  ('seo-toolkit','seo-toolkit','SEO Toolkit','Search optimization products.','active',4),
  ('learning-platform','learning-platform','Learning Platform','Learning management products.','active',5),
  ('speed-toolkit','speed-toolkit','Speed Toolkit','Website performance products.','active',6),
  ('form-builder','form-builder','Form Builder','Form and lead-generation products.','active',7),
  ('elementor-addons','elementor-addons','Elementor Addons','Extensions for Elementor.','active',8),
  ('sales-funnel','sales-funnel','Sales Funnel','Checkout and funnel products.','active',9),
  ('social-toolkit','social-toolkit','Social Toolkit','Social proof and integration products.','active',10)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "products"
  ("id","slug","category_id","name","license","status","base_price","description",
   "features","faq","demo_url","activation_type","rating_tenths","review_count","sort_order")
VALUES
  ('elementor-pro','elementor-pro','page-builder','Elementor Pro','One Year','published',300,'Elementor Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,1),
  ('crocoblock','crocoblock','dynamic-toolkit','Crocoblock','Lifetime','published',600,'Crocoblock provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,2),
  ('astra-pro-essential','astra-pro-essential','theme-bundle','Astra Pro Essential','Lifetime','published',600,'Astra Pro Essential provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,3),
  ('rank-math-pro','rank-math-pro','seo-toolkit','Rank Math Pro','One Year','published',500,'Rank Math Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,4),
  ('tutor-lms-pro','tutor-lms-pro','learning-platform','Tutor LMS Pro','Lifetime','published',500,'Tutor LMS Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,5),
  ('wp-rocket','wp-rocket','speed-toolkit','WP Rocket','One Year','published',400,'WP Rocket provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,6),
  ('fluent-forms-pro','fluent-forms-pro','form-builder','Fluent Forms Pro','Lifetime','published',450,'Fluent Forms Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,7),
  ('essential-addons','essential-addons','elementor-addons','Essential Addons','Lifetime','published',350,'Essential Addons provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,8),
  ('cartflows-pro','cartflows-pro','sales-funnel','CartFlows Pro','One Year','published',500,'CartFlows Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,9),
  ('wp-social-ninja-pro','wp-social-ninja-pro','social-toolkit','WP Social Ninja Pro','Lifetime','published',450,'WP Social Ninja Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,10),
  ('divi-theme','divi-theme','theme-bundle','Divi Theme','One Year','published',550,'Divi Theme provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,11),
  ('learndash-lms','learndash-lms','learning-platform','LearnDash LMS','One Year','published',700,'LearnDash LMS provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,12),
  ('wpforms-pro','wpforms-pro','form-builder','WPForms Pro','One Year','published',450,'WPForms Pro provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,13),
  ('perfmatters','perfmatters','speed-toolkit','Perfmatters','One Year','published',400,'Perfmatters provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,14),
  ('yoast-seo-premium','yoast-seo-premium','seo-toolkit','Yoast SEO Premium','One Year','published',450,'Yoast SEO Premium provides dependable premium features, assisted activation and direct support for your WordPress website.','Official premium product
Fast assisted activation
Reliable product updates
Direct expert support','','','Assisted activation',49,5,15)
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_variations" ("id","product_id","label","price","sort_order")
SELECT p.id || '-site-1', p.id, '01 Site', p.base_price, 0 FROM products p
WHERE p.id IN ('elementor-pro','crocoblock','astra-pro-essential','rank-math-pro','tutor-lms-pro','wp-rocket','fluent-forms-pro','essential-addons','cartflows-pro','wp-social-ninja-pro','divi-theme','learndash-lms','wpforms-pro','perfmatters','yoast-seo-premium')
UNION ALL
SELECT p.id || '-site-5', p.id, '05 Sites', CEIL(p.base_price * 1.5 / 50.0)::integer * 50, 1 FROM products p
WHERE p.id IN ('elementor-pro','crocoblock','astra-pro-essential','rank-math-pro','tutor-lms-pro','wp-rocket','fluent-forms-pro','essential-addons','cartflows-pro','wp-social-ninja-pro','divi-theme','learndash-lms','wpforms-pro','perfmatters','yoast-seo-premium')
UNION ALL
SELECT p.id || '-site-10', p.id, '10 Sites', p.base_price * 2, 2 FROM products p
WHERE p.id IN ('elementor-pro','crocoblock','astra-pro-essential','rank-math-pro','tutor-lms-pro','wp-rocket','fluent-forms-pro','essential-addons','cartflows-pro','wp-social-ninja-pro','divi-theme','learndash-lms','wpforms-pro','perfmatters','yoast-seo-premium')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "product_information" ("id","product_id","label","value","sort_order")
SELECT p.id || '-info-' || i.sort_order, p.id, i.label,
  CASE WHEN i.label = 'Auto Update' THEN p.license ELSE i.value END,
  i.sort_order
FROM products p
CROSS JOIN (VALUES
  (0,'Official Tool','Yes'),
  (1,'Activation Process','Assisted activation'),
  (2,'Auto Update',''),
  (3,'Delivery','30 Minutes Max'),
  (4,'Download file','After order approval')
) AS i(sort_order,label,value)
WHERE p.id IN ('elementor-pro','crocoblock','astra-pro-essential','rank-math-pro','tutor-lms-pro','wp-rocket','fluent-forms-pro','essential-addons','cartflows-pro','wp-social-ninja-pro','divi-theme','learndash-lms','wpforms-pro','perfmatters','yoast-seo-premium')
ON CONFLICT ("id") DO NOTHING;
