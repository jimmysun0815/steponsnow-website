# GitHub Actions 自动部署配置指南

## 📋 配置 GitHub Secrets

### 步骤 1: 获取 AWS 凭证

如果你还没有 AWS Access Key，创建一个：

```bash
# 使用 AWS CLI 创建新的 access key（可选）
aws iam create-access-key --user-name your-username
```

或者在 AWS Console:
1. 进入 IAM → Users → 你的用户
2. Security credentials → Create access key
3. 选择 "Command Line Interface (CLI)"
4. 保存 Access Key ID 和 Secret Access Key

### 步骤 2: 在 GitHub 添加 Secrets

1. 打开你的 GitHub 仓库
2. 点击 `Settings` (设置)
3. 左侧菜单选择 `Secrets and variables` → `Actions`
4. 点击 `New repository secret`

添加以下两个 secrets:

**Secret 1:**
- Name: `AWS_ACCESS_KEY_ID`
- Value: 你的 AWS Access Key ID

**Secret 2:**
- Name: `AWS_SECRET_ACCESS_KEY`
- Value: 你的 AWS Secret Access Key

### 步骤 3: 配置 CloudFront（可选）

如果你使用了 CloudFront CDN，需要配置 Distribution ID。

1. 在 AWS Console 找到你的 CloudFront Distribution ID
2. 回到 GitHub 仓库 `Settings` → `Secrets and variables` → `Actions`
3. 切换到 `Variables` 标签
4. 点击 `New repository variable`

添加变量:
- Name: `CLOUDFRONT_DISTRIBUTION_ID`
- Value: 你的 CloudFront Distribution ID (例如: E1234567890ABC)

## ✅ 完成！

现在每次你推送代码到 `main` 分支时：

```bash
git add website/
git commit -m "更新官网内容"
git push origin main
```

GitHub Actions 会自动：
1. ✅ 检测 `website/` 目录的变更
2. ✅ 同步文件到 S3 bucket
3. ✅ 设置正确的 Content-Type headers
4. ✅ 清除 CloudFront 缓存（如果配置了）

## 🔍 查看部署状态

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 查看最新的 "Deploy Website to S3" workflow
4. 点击进去可以看到详细的部署日志

## 🚨 故障排查

### 部署失败：权限错误

如果看到类似 "Access Denied" 的错误，检查：

1. **S3 权限**: 确保你的 AWS 用户有 S3 的读写权限
   
   需要的权限：
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::steponsnow.com",
           "arn:aws:s3:::steponsnow.com/*"
         ]
       }
     ]
   }
   ```

2. **CloudFront 权限**: 如果配置了 CloudFront，需要：
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "cloudfront:CreateInvalidation",
       "cloudfront:GetInvalidation"
     ],
     "Resource": "arn:aws:cloudfront::*:distribution/*"
   }
   ```

### 部署成功但网站没更新

1. **检查 S3**: 登录 AWS Console 查看 S3 bucket 中的文件是否更新
2. **清除浏览器缓存**: Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac)
3. **等待 CDN 更新**: 如果用了 CloudFront，可能需要等待 5-15 分钟

### GitHub Actions 没有触发

检查：
1. 代码是否推送到了 `main` 分支
2. 修改的文件是否在 `website/` 目录下
3. GitHub Actions 是否被禁用了（Settings → Actions → General）

## 💡 提示

### 只部署 website 目录的变更

workflow 已配置为只在 `website/` 目录有变更时才触发，不会浪费 CI/CD 资源。

### 手动触发部署

如果需要手动触发部署（即使没有代码变更）：

1. 进入 `Actions` 标签
2. 选择 "Deploy Website to S3"
3. 点击 "Run workflow"
4. 选择 branch 并运行

### 修改 bucket 名称

如果要部署到不同的 bucket，修改 `.github/workflows/deploy-website.yml`:

```yaml
env:
  AWS_REGION: us-west-2
  S3_BUCKET: your-new-bucket-name  # 修改这里
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [AWS S3 静态网站托管](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront 文档](https://docs.aws.amazon.com/cloudfront/)

