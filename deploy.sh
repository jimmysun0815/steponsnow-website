#!/bin/bash

# Step On 官网部署脚本
# 用于将静态网站部署到 AWS S3 + CloudFront

set -e

echo "🚀 开始部署 Step On 官网..."
echo ""

# 配置变量
BUCKET_NAME="steponsnow.com"  # 替换为你的 bucket 名称
REGION="us-west-2"
PROFILE="pp"  # 替换为你的 AWS profile

# 检查是否在正确的目录
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 请在 website 目录下运行此脚本"
    exit 1
fi

# 检查 assets 文件夹
if [ ! -d "assets" ]; then
    echo "❌ 错误: assets 文件夹不存在"
    echo "请运行: mkdir -p assets && cp ../marketing/ios/* assets/"
    exit 1
fi

echo "📦 上传文件到 S3..."
aws s3 sync . "s3://${BUCKET_NAME}/" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --exclude ".git/*" \
    --exclude "*.sh" \
    --exclude "README.md" \
    --exclude ".DS_Store" \
    --cache-control "public, max-age=31536000" \
    --delete

echo ""
echo "📝 设置 HTML 文件的 Content-Type..."
aws s3 cp index.html "s3://${BUCKET_NAME}/index.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

aws s3 cp privacy.html "s3://${BUCKET_NAME}/privacy.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

aws s3 cp auth-callback.html "s3://${BUCKET_NAME}/auth-callback.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

aws s3 cp reset-password.html "s3://${BUCKET_NAME}/reset-password.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

echo ""
echo "🎾 设置网球落地页的 Content-Type..."
aws s3 cp download/index.html "s3://${BUCKET_NAME}/download/index.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

aws s3 cp tennis/profile/index.html "s3://${BUCKET_NAME}/tennis/profile/index.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

aws s3 cp tennis/activity/index.html "s3://${BUCKET_NAME}/tennis/activity/index.html" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=3600"

echo ""
echo "🎨 设置 CSS 和 JS 的 Content-Type..."
aws s3 cp styles.css "s3://${BUCKET_NAME}/styles.css" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "text/css; charset=utf-8" \
    --cache-control "public, max-age=31536000"

aws s3 cp script.js "s3://${BUCKET_NAME}/script.js" \
    --profile ${PROFILE} \
    --region ${REGION} \
    --content-type "application/javascript; charset=utf-8" \
    --cache-control "public, max-age=31536000"

echo ""
echo "✅ 文件上传完成！"
echo ""
echo "🌐 网站地址: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
echo ""
echo "💡 提示: 如果使用了 CloudFront，记得清除缓存:"
echo "   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*' --profile ${PROFILE}"
echo ""
echo "🎉 部署完成!"

