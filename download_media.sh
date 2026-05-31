#!/bin/bash

# Array of all URLs to download
urls=(
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_1_e9b1b085.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_2_c24d0cc7.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_3_871e14ce.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-diagonal_d71d96cc.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_5_6904f665.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_6_46b55eae.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_7_d98e19af.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_8_13bddbc4.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_9_9182a863.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/img_10_d3eedfb8.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/marmurino-enhanced_4c2c6afd.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/mappa-mondo-enhanced_13c1f23e.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-tiles_4edafcc5.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/mappa-mondo-stencil-enhanced_f5fdf7bc.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/marmurino-texture-6LuTA7LZ33EC7qKpQiigzq.png"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/hero-banner-v2-NwecKWHDwJvSatLmHpEj4e.webp"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/5WjbvFPD2wjC_e4a0a6aa.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/8WnrzSbgVLfl_7d492611.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/ULwliGo9w3Dg_344edeff.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/effetto-cimento-real_a6e8f9b1.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pelle-elefante-real_97d5e5fe.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/perlato-real_3ac71f2a.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/pietra-spaccata-real_8224ab3e.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/stencil-real_1aa8a383.jpg"
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663463855860/5JYUyBvQa2GUNcqbsccVam/zokRXgi6ILBO_a6b32a93.jpg"
)

echo "Downloading ${#urls[@]} media files..."
count=0
for url in "${urls[@]}"; do
  filename=$(basename "$url" | sed 's/_[a-z0-9]*\./\./')
  wget -q "$url" -O "media-import/$filename" 2>/dev/null && ((count++))
  echo -ne "\rDownloaded: $count/${#urls[@]}"
done
echo -e "\n✅ Download complete!"
