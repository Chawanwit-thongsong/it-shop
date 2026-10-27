-- สร้างโดย cmd/seedgen จาก https://dummyjson.com (ราคา USD x 35 ปัดเป็นบาท)
BEGIN;
TRUNCATE order_items, orders, cart_items, products, categories RESTART IDENTITY CASCADE;

INSERT INTO categories (slug, name) VALUES ('laptops', 'โน้ตบุ๊ก');
INSERT INTO categories (slug, name) VALUES ('smartphones', 'สมาร์ตโฟน');
INSERT INTO categories (slug, name) VALUES ('tablets', 'แท็บเล็ต');
INSERT INTO categories (slug, name) VALUES ('mobile-accessories', 'อุปกรณ์เสริม');

INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple MacBook Pro 14 Inch Space Grey', 'Apple', 'The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple''s M1 Pro chip for exceptional performance and a stunning Retina display.', 69990, 24, 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp' FROM categories WHERE slug = 'laptops';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Asus Zenbook Pro Dual Screen Laptop', 'Asus', 'The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.', 62990, 45, 'https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp' FROM categories WHERE slug = 'laptops';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Huawei Matebook X Pro', 'Huawei', 'The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.', 48990, 75, 'https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp' FROM categories WHERE slug = 'laptops';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Lenovo Yoga 920', 'Lenovo', 'The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.', 38490, 40, 'https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp' FROM categories WHERE slug = 'laptops';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'New DELL XPS 13 9300 Laptop', 'Dell', 'The New DELL XPS 13 9300 Laptop is a compact and powerful device, featuring a virtually borderless InfinityEdge display and high-end performance for various tasks.', 52490, 74, 'https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/thumbnail.webp' FROM categories WHERE slug = 'laptops';

INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPhone 5s', 'Apple', 'The iPhone 5s is a classic smartphone known for its compact design and advanced features during its release. While it''s an older model, it still provides a reliable user experience.', 6990, 25, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPhone 6', 'Apple', 'The iPhone 6 is a stylish and capable smartphone with a larger display and improved performance. It introduced new features and design elements, making it a popular choice in its time.', 10490, 60, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPhone 13 Pro', 'Apple', 'The iPhone 13 Pro is a cutting-edge smartphone with a powerful camera system, high-performance chip, and stunning display. It offers advanced features for users who demand top-notch technology.', 38490, 56, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPhone X', 'Apple', 'The iPhone X is a flagship smartphone featuring a bezel-less OLED display, facial recognition technology (Face ID), and impressive performance. It represents a milestone in iPhone design and innovation.', 31490, 37, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Oppo A57', 'Oppo', 'The Oppo A57 is a mid-range smartphone known for its sleek design and capable features. It offers a balance of performance and affordability, making it a popular choice.', 8690, 19, 'https://cdn.dummyjson.com/product-images/smartphones/oppo-a57/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Oppo F19 Pro Plus', 'Oppo', 'The Oppo F19 Pro Plus is a feature-rich smartphone with a focus on camera capabilities. It boasts advanced photography features and a powerful performance for a premium user experience.', 13990, 78, 'https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Oppo K1', 'Oppo', 'The Oppo K1 series offers a range of smartphones with various features and specifications. Known for their stylish design and reliable performance, the Oppo K1 series caters to diverse user preferences.', 10490, 55, 'https://cdn.dummyjson.com/product-images/smartphones/oppo-k1/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Realme C35', 'Realme', 'The Realme C35 is a budget-friendly smartphone with a focus on providing essential features for everyday use. It offers a reliable performance and user-friendly experience.', 5190, 48, 'https://cdn.dummyjson.com/product-images/smartphones/realme-c35/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Realme X', 'Realme', 'The Realme X is a mid-range smartphone known for its sleek design and impressive display. It offers a good balance of performance and camera capabilities for users seeking a quality device.', 10490, 12, 'https://cdn.dummyjson.com/product-images/smartphones/realme-x/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Realme XT', 'Realme', 'The Realme XT is a feature-rich smartphone with a focus on camera technology. It comes equipped with advanced camera sensors, delivering high-quality photos and videos for photography enthusiasts.', 12190, 80, 'https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Samsung Galaxy S7', 'Samsung', 'The Samsung Galaxy S7 is a flagship smartphone known for its sleek design and advanced features. It features a high-resolution display, powerful camera, and robust performance.', 10490, 67, 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s7/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Samsung Galaxy S8', 'Samsung', 'The Samsung Galaxy S8 is a premium smartphone with an Infinity Display, offering a stunning visual experience. It boasts advanced camera capabilities and cutting-edge technology.', 17490, 0, 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Samsung Galaxy S10', 'Samsung', 'The Samsung Galaxy S10 is a flagship device featuring a dynamic AMOLED display, versatile camera system, and powerful performance. It represents innovation and excellence in smartphone technology.', 24490, 19, 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Vivo S1', 'Vivo', 'The Vivo S1 is a stylish and mid-range smartphone offering a blend of design and performance. It features a vibrant display, capable camera system, and reliable functionality.', 8690, 50, 'https://cdn.dummyjson.com/product-images/smartphones/vivo-s1/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Vivo V9', 'Vivo', 'The Vivo V9 is a smartphone known for its sleek design and emphasis on capturing high-quality selfies. It features a notch display, dual-camera setup, and a modern design.', 10490, 82, 'https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp' FROM categories WHERE slug = 'smartphones';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Vivo X21', 'Vivo', 'The Vivo X21 is a premium smartphone with a focus on cutting-edge technology. It features an in-display fingerprint sensor, a high-resolution display, and advanced camera capabilities.', 17490, 7, 'https://cdn.dummyjson.com/product-images/smartphones/vivo-x21/thumbnail.webp' FROM categories WHERE slug = 'smartphones';

INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPad Mini 2021 Starlight', 'Apple', 'The iPad Mini 2021 in Starlight is a compact and powerful tablet from Apple. Featuring a stunning Retina display, powerful A-series chip, and a sleek design, it offers a premium tablet experience.', 17490, 47, 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp' FROM categories WHERE slug = 'tablets';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Samsung Galaxy Tab S8 Plus Grey', 'Samsung', 'The Samsung Galaxy Tab S8 Plus in Grey is a high-performance Android tablet by Samsung. With a large AMOLED display, powerful processor, and S Pen support, it''s ideal for productivity and entertainment.', 20990, 62, 'https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-s8-plus-grey/thumbnail.webp' FROM categories WHERE slug = 'tablets';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Samsung Galaxy Tab White', 'Samsung', 'The Samsung Galaxy Tab in White is a sleek and versatile Android tablet. With a vibrant display, long-lasting battery, and a range of features, it offers a great user experience for various tasks.', 12190, 92, 'https://cdn.dummyjson.com/product-images/tablets/samsung-galaxy-tab-white/thumbnail.webp' FROM categories WHERE slug = 'tablets';

INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Amazon Echo Plus', 'Amazon', 'The Amazon Echo Plus is a smart speaker with built-in Alexa voice control. It features premium sound quality and serves as a hub for controlling smart home devices.', 3490, 61, 'https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple Airpods', 'Apple', 'The Apple Airpods offer a seamless wireless audio experience. With easy pairing, high-quality sound, and Siri integration, they are perfect for on-the-go listening.', 4490, 67, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple AirPods Max Silver', 'Apple', 'The Apple AirPods Max in Silver are premium over-ear headphones with high-fidelity audio, adaptive EQ, and active noise cancellation. Experience immersive sound in style.', 19190, 59, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple Airpower Wireless Charger', 'Apple', 'The Apple AirPower Wireless Charger provides a convenient way to charge your compatible Apple devices wirelessly. Simply place your devices on the charging mat for effortless charging.', 2790, 1, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple HomePod Mini Cosmic Grey', 'Apple', 'The Apple HomePod Mini in Cosmic Grey is a compact smart speaker that delivers impressive audio and integrates seamlessly with the Apple ecosystem for a smart home experience.', 3490, 27, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple iPhone Charger', 'Apple', 'The Apple iPhone Charger is a high-quality charger designed for fast and efficient charging of your iPhone. Ensure your device stays powered up and ready to go.', 690, 31, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple MagSafe Battery Pack', 'Apple', 'The Apple MagSafe Battery Pack is a portable and convenient way to add extra battery life to your MagSafe-compatible iPhone. Attach it magnetically for a secure connection.', 3490, 1, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Apple Watch Series 4 Gold', 'Apple', 'The Apple Watch Series 4 in Gold is a stylish and advanced smartwatch with features like heart rate monitoring, fitness tracking, and a beautiful Retina display.', 12190, 33, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Beats Flex Wireless Earphones', 'Beats', 'The Beats Flex Wireless Earphones offer a comfortable and versatile audio experience. With magnetic earbuds and up to 12 hours of battery life, they are ideal for everyday use.', 1690, 50, 'https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'iPhone 12 Silicone Case with MagSafe Plum', 'Apple', 'The iPhone 12 Silicone Case with MagSafe in Plum is a stylish and protective case designed for the iPhone 12. It features MagSafe technology for easy attachment of accessories.', 990, 69, 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Monopod', 'TechGear', 'The Monopod is a versatile camera accessory for stable and adjustable shooting. Perfect for capturing selfies, group photos, and videos with ease.', 690, 48, 'https://cdn.dummyjson.com/product-images/mobile-accessories/monopod/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Selfie Lamp with iPhone', 'GadgetMaster', 'The Selfie Lamp with iPhone is a portable and adjustable LED light designed to enhance your selfies and video calls. Attach it to your iPhone for well-lit photos.', 490, 58, 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'Selfie Stick Monopod', 'SnapTech', 'The Selfie Stick Monopod is a extendable and foldable device for capturing the perfect selfie or group photo. Compatible with smartphones and cameras.', 490, 11, 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';
INSERT INTO products (category_id, name, brand, description, price, stock, image_url)
  SELECT id, 'TV Studio Camera Pedestal', 'ProVision', 'The TV Studio Camera Pedestal is a professional-grade camera support system for smooth and precise camera movements in a studio setting. Ideal for broadcast and production.', 17490, 15, 'https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/thumbnail.webp' FROM categories WHERE slug = 'mobile-accessories';

COMMIT;
