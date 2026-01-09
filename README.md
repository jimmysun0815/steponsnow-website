# Step On 官网

这是 Step On（逐风）app 的静态官网，专为北美华人滑雪社区打造，用于展示应用功能和特点。

## 🔍 SEO 优化

网站已针对以下关键词进行优化：
- **北美滑雪** - 覆盖北美地区所有主要滑雪场
- **北美华人滑雪** - 专为华人滑雪爱好者服务
- **北美华人滑雪搭子** - 轻松找到滑雪伙伴
- **华人滑雪搭子** - 华人滑雪社区
- **滑雪拼车** - 便捷的拼车功能
- **滑雪拼房** - 省钱的拼房服务
- **滑雪社区** - 活跃的雪友社区

### SEO 功能包括：
- ✅ **Meta 标签优化**：完整的 description, keywords, author
- ✅ **Open Graph 标签**：优化 Facebook/社交媒体分享效果
- ✅ **Twitter Card 标签**：优化 Twitter 分享卡片显示
- ✅ **结构化数据（JSON-LD）**：帮助搜索引擎理解应用信息
- ✅ **Sitemap.xml**：网站地图，加速搜索引擎收录
- ✅ **Robots.txt**：爬虫配置，优化抓取效率
- ✅ **关键词自然融入**：在标题、描述、内容中自然使用目标关键词
- ✅ **语义化 HTML**：使用正确的 HTML5 标签结构

## 📁 文件结构

```
website/
├── index.html          # 主页
├── privacy.html        # 隐私政策页面
├── auth-callback.html  # 邮箱验证回调页面
├── reset-password.html # 密码重置页面
├── styles.css          # 样式文件
├── script.js           # JavaScript 脚本
├── sitemap.xml         # 网站地图（SEO）
├── robots.txt          # 搜索引擎爬虫配置（SEO）
├── assets/             # 资源文件夹（需要手动创建）
│   ├── logo-1024x1024.jpg    # 应用 logo
│   ├── 实况.jpg              # 实况功能截图
│   ├── 天气.jpg              # 天气功能截图
│   ├── 记录.jpg              # 记录功能截图
│   ├── 拼车.jpg              # 拼车功能截图
│   └── 订阅.jpg              # 订阅功能截图
└── README.md           # 说明文档
```

## 🚀 部署步骤

### 自动部署（推荐）⚡

网站已配置 GitHub Actions 自动部署。当你推送代码到 `main` 分支时，会自动部署到 S3。

#### 配置步骤：

1. **在 GitHub 仓库中添加 Secrets**

   进入 `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
   
   添加以下 secrets：
   ```
   AWS_ACCESS_KEY_ID: 你的 AWS Access Key
   AWS_SECRET_ACCESS_KEY: 你的 AWS Secret Key
   ```

2. **（可选）配置 CloudFront 缓存清除**

   如果你使用了 CloudFront，添加 repository variable：
   
   进入 `Settings` → `Secrets and variables` → `Actions` → `Variables` → `New repository variable`
   
   ```
   CLOUDFRONT_DISTRIBUTION_ID: 你的 CloudFront Distribution ID
   ```

3. **提交代码即可自动部署**

   ```bash
   git add website/
   git commit -m "Update website"
   git push origin main
   ```

   GitHub Actions 会自动：
   - ✅ 检测到 `website/` 目录的变更
   - ✅ 上传文件到 S3
   - ✅ 设置正确的 Content-Type
   - ✅ 清除 CloudFront 缓存（如果配置了）

4. **查看部署状态**

   在 GitHub 仓库的 `Actions` 标签页可以看到部署进度和日志。

---

### 手动部署

### 1. 准备 assets 文件夹

在 `website/` 目录下创建 `assets/` 文件夹，并将以下文件复制进去：

```bash
mkdir -p website/assets
cp marketing/ios/logo-1024x1024.jpg website/assets/
cp marketing/ios/实况.jpg website/assets/
cp marketing/ios/天气.jpg website/assets/
cp marketing/ios/记录.jpg website/assets/
cp marketing/ios/拼车.jpg website/assets/
cp marketing/ios/订阅.jpg website/assets/
```

### 2. 更新 App Store 链接

在 `index.html` 中找到以下两处，更新为真实的应用商店链接：

```html
<!-- App Store 链接 -->
<a href="https://apps.apple.com/us/app/%E9%80%90%E9%A3%8E/id6754859759" ...>

<!-- Google Play 链接 -->
<a href="https://play.google.com/store/apps/details?id=your.package.name" ...>
```

### 3. 部署到 AWS S3

#### 3.1 创建 S3 Bucket

```bash
# 创建 bucket（替换为你的域名）
aws s3 mb s3://steponsnow.com --region us-west-2

# 配置为静态网站托管
aws s3 website s3://steponsnow.com \
  --index-document index.html \
  --error-document index.html
```

#### 3.2 设置 Bucket 策略

创建 `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::steponsnow.com/*"
    }
  ]
}
```

应用策略：

```bash
aws s3api put-bucket-policy \
  --bucket steponsnow.com \
  --policy file://bucket-policy.json
```

#### 3.3 上传文件

```bash
# 上传所有文件
aws s3 sync . s3://steponsnow.com \
  --exclude ".git/*" \
  --exclude "README.md" \
  --cache-control "max-age=3600"

# 为 HTML 文件设置正确的 Content-Type
aws s3 cp index.html s3://steponsnow.com/ \
  --content-type "text/html; charset=utf-8" \
  --cache-control "max-age=3600"

aws s3 cp privacy.html s3://steponsnow.com/ \
  --content-type "text/html; charset=utf-8" \
  --cache-control "max-age=3600"
```

### 4. 配置 CloudFront

#### 4.1 创建 CloudFront Distribution

```bash
# 创建 distribution（使用 AWS Console 或 CLI）
aws cloudfront create-distribution \
  --origin-domain-name steponsnow.com.s3-website-us-west-2.amazonaws.com \
  --default-root-object index.html
```

#### 4.2 配置自定义域名

1. 在 Route 53 中创建记录指向 CloudFront
2. 在 CloudFront 中配置自定义域名
3. 添加 SSL 证书（通过 AWS Certificate Manager）

### 5. 更新部署（后续）

每次修改后重新上传：

```bash
aws s3 sync . s3://steponsnow.com \
  --exclude ".git/*" \
  --exclude "README.md" \
  --cache-control "max-age=3600"

# 清除 CloudFront 缓存
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 🎨 设计特点

- **现代化设计**：深色主题，渐变色，毛玻璃效果
- **响应式布局**：适配桌面、平板、手机
- **流畅动画**：滚动动画、悬停效果
- **SEO 优化**：合适的 meta 标签和语义化 HTML
- **性能优化**：CSS 动画使用 GPU 加速

## 📝 功能说明

### 主页 (index.html)

- **Hero Section**：大标题、副标题、CTA 按钮、手机预览
- **Features Section**：5个核心功能的详细介绍，配图片
- **Highlights Section**：4个亮点展示
- **Screenshots Section**：应用截图展示
- **Download Section**：App Store 和 Google Play 下载按钮
- **Footer**：品牌信息、链接、版权声明

### 隐私政策 (privacy.html)

- 完整的隐私政策内容
- 清晰的排版和分段
- 链接回主页

## 🔧 自定义

### 修改颜色

在 `styles.css` 中修改 CSS 变量：

```css
:root {
    --primary-color: #3B82F6;     /* 主色调 */
    --secondary-color: #8B5CF6;   /* 次要色调 */
    --dark-bg: #0F1419;           /* 背景色 */
    /* ... */
}
```

### 修改内容

直接编辑 `index.html` 中的文字内容即可。

## 📊 SEO 优化建议

1. 在 Google Search Console 中验证网站
2. 提交 sitemap.xml
3. 优化图片大小（推荐使用 WebP 格式）
4. 添加结构化数据（Schema.org）
5. 确保 HTTPS
6. 添加 robots.txt

## 🔐 Supabase 邮件回调配置

### 配置 Redirect URLs

为了让邮箱验证和密码重置正常工作，需要在 Supabase Dashboard 中配置 Redirect URLs：

1. 进入 Supabase Dashboard
2. 选择你的项目
3. 进入 `Authentication` → `URL Configuration`
4. 在 `Redirect URLs` 中添加以下 URL：

```
https://steponsnow.com/auth-callback.html
https://steponsnow.com/reset-password.html
steponsnow://auth-callback
```

### 配置邮件模板

#### 邮箱验证邮件（Confirm Email）

进入 `Authentication` → `Email Templates` → `Confirm signup`

修改邮件内容，将链接改为：

```html
<a href="{{ .SiteURL }}/auth-callback.html#access_token={{ .Token }}&type=signup">验证邮箱</a>
```

或者使用默认的 `{{ .ConfirmationURL }}`，但需要确保 Site URL 配置正确。

#### 密码重置邮件（Reset Password）

进入 `Authentication` → `Email Templates` → `Reset Password`

修改邮件内容，将链接改为：

```html
<a href="{{ .SiteURL }}/reset-password.html">重置密码</a>
```

### 工作原理

1. **邮箱验证流程**：
   - 用户注册后收到验证邮件
   - 点击链接跳转到 `auth-callback.html`
   - 页面检测设备类型：
     - 移动设备：自动跳转到 App (`steponsnow://auth-callback`)
     - 桌面端：显示成功消息，提示在手机上打开 App

2. **密码重置流程**：
   - 用户在 App 中点击"忘记密码"
   - 输入邮箱后收到重置邮件
   - 点击链接跳转到 `reset-password.html`
   - 在网页上设置新密码
   - 成功后提示在 App 中使用新密码登录

### App Deep Link 配置

确保 App 已正确配置 Deep Link：

**iOS (Info.plist)**:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>steponsnow</string>
    </array>
  </dict>
</array>
```

**Android (AndroidManifest.xml)**:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="steponsnow" />
</intent-filter>
```

## 🐛 问题排查

### 图片不显示

检查 `assets/` 文件夹是否存在，图片文件名是否正确。

### 样式不生效

确保 `styles.css` 和 `script.js` 在同级目录。

### CloudFront 缓存问题

创建缓存失效：

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## 📧 联系方式

如有问题，请联系：support@steponsnow.com

