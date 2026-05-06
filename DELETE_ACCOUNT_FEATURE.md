# 🗑️ 用户自助删除账号功能

## 功能概述

用户可以通过网站自助删除账号，无需联系客服。此功能采用**软删除**方式，确保数据可追溯，同时满足用户隐私需求。

---

## 访问入口

### 1. 网站首页 Footer
`https://steponsnow.com/` → Footer → "删除账号"

### 2. 隐私政策页面
`https://steponsnow.com/privacy.html` → Footer → "删除账号"  
或正文中的"自助删除账号页面"链接

### 3. 直接访问
`https://steponsnow.com/delete-account.html`

---

## 操作流程

### 步骤 1: 身份验证
1. 用户访问删除账号页面
2. 输入邮箱和密码登录
3. 系统通过 Supabase Auth 验证用户身份

### 步骤 2: 查看警告信息
登录后，系统显示：
- 用户昵称和邮箱
- **删除账号的后果**：
  - ⚠️ 停用您的账号（无法登录）
  - ⚠️ 取消您发布的所有拼车和拼房信息
  - ⚠️ 其他用户将无法看到您的帖子
  - ⚠️ 此操作不可恢复

### 步骤 3: 最后确认
- 要求用户输入 `delete` 来确认删除
- 只有输入完全匹配时，"确认删除账号"按钮才会激活

### 步骤 4: 执行删除
点击"确认删除账号"后：
1. 调用后端 API `/api/users/delete-account`
2. 验证用户 JWT token
3. 执行软删除操作：
   - 将 `user_profiles.is_active` 设为 `false`（账号停用）
   - 将所有 `carpool_posts` 的 `status` 设为 `cancelled`
   - 将所有 `accommodation_posts` 的 `status` 设为 `cancelled`
4. 退出登录
5. 显示删除成功页面

---

## 技术实现

### 前端 (HTML + JavaScript)

**文件**: `website/delete-account.html`

**关键技术**:
- Supabase JS SDK: 处理用户登录
- JWT Token: 验证用户身份
- Fetch API: 调用后端删除接口

**核心代码片段**:
```javascript
// 1. 用户登录
const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
});

// 2. 调用删除 API
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(`${API_URL}/api/users/delete-account`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${session.access_token}`,
    },
});

// 3. 退出登录
await supabase.auth.signOut();
```

---

### 后端 (Flask API)

**文件**: `backend-api/api.py`

**新增端点**: `POST /api/users/delete-account`

**认证方式**: JWT Bearer Token (Supabase Auth)

**实现逻辑**:

```python
@app.route('/api/users/delete-account', methods=['POST'])
def delete_user_account():
    # 1. 验证 Token
    token = request.headers.get('Authorization').replace('Bearer ', '')
    user_id, email = verify_supabase_token(token)
    
    if not user_id:
        return jsonify({'error': 'Token 无效'}), 401
    
    # 2. 停用账号
    supabase.table('user_profiles').update({
        'is_active': False
    }).eq('user_id', user_id).execute()
    
    # 3. 取消拼车帖子
    supabase.table('carpool_posts').update({
        'status': 'cancelled'
    }).eq('user_id', user_id).neq('status', 'cancelled').execute()
    
    # 4. 取消拼房帖子
    supabase.table('accommodation_posts').update({
        'status': 'cancelled'
    }).eq('user_id', user_id).neq('status', 'cancelled').execute()
    
    return jsonify({'success': True}), 200
```

**Token 验证**:
```python
def verify_supabase_token(token):
    """通过 Supabase Auth API 验证 token"""
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        return user_data.get('id'), user_data.get('email')
    
    return None, None
```

---

## 数据库影响

### 1. `user_profiles` 表
```sql
UPDATE user_profiles
SET is_active = false
WHERE user_id = '<user_id>';
```

**结果**: 
- 用户无法登录 App
- 前端不再显示该用户的信息

### 2. `carpool_posts` 表
```sql
UPDATE carpool_posts
SET status = 'cancelled', updated_at = NOW()
WHERE user_id = '<user_id>' AND status != 'cancelled';
```

**结果**: 
- 用户的拼车帖子不再显示在列表中
- 前端过滤逻辑: `status != 'cancelled'`

### 3. `accommodation_posts` 表
```sql
UPDATE accommodation_posts
SET status = 'cancelled', updated_at = NOW()
WHERE user_id = '<user_id>' AND status != 'cancelled';
```

**结果**: 
- 用户的拼房帖子不再显示在列表中

---

## 安全考虑

### ✅ 已实现的安全措施

1. **身份验证**: 
   - 必须输入正确的邮箱和密码
   - 使用 Supabase Auth 验证

2. **Token 验证**: 
   - 后端 API 验证 JWT token 的有效性
   - 防止未授权的删除操作

3. **二次确认**: 
   - 要求用户输入 `delete` 确认
   - 防止误操作

4. **软删除**: 
   - 不物理删除数据
   - 数据库中保留所有记录
   - 管理员可以查看历史数据

5. **操作日志**: 
   - 后端打印删除操作日志
   - 记录用户 ID、邮箱、删除时间
   - 记录取消的帖子数量

### ⚠️ 注意事项

1. **不可恢复提示**: 
   - 前端明确告知用户此操作不可恢复
   - 实际上管理员可以恢复（通过修改 `is_active`）

2. **关联数据**: 
   - 当前不删除用户的申请记录（`carpool_applications`, `accommodation_applications`）
   - 不删除用户的订阅记录（`resort_subscriptions`）
   - 不删除用户的设备 Token（`device_tokens`）

3. **GDPR 合规**: 
   - 如需完全删除数据（GDPR 要求），需要额外开发物理删除功能
   - 或在一定时间后自动清理已删除用户的数据

---

## 部署要求

### 环境变量配置

需要在 AWS Lambda 和 GitHub Secrets 中添加：

```bash
# Supabase 配置
SUPABASE_URL=https://avztlsrmiqigeivtmwha.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### GitHub Secrets

在 GitHub 仓库 Settings → Secrets 中添加：
- `SUPABASE_ANON_KEY`: Supabase 的匿名密钥（用于 token 验证）

### 文件部署

**前端**:
- 将 `website/delete-account.html` 上传到 S3/CloudFront
- 访问地址: `https://steponsnow.com/delete-account.html`

**后端**:
- `backend-api/api.py` 通过 GitHub Actions 自动部署到 Lambda
- API 地址: `https://api.steponsnow.com/api/users/delete-account`

---

## 测试步骤

### 1. 创建测试账号
```bash
# 在 App 中注册一个测试账号
Email: test@example.com
Password: TestPassword123
```

### 2. 发布测试帖子
- 发布 1-2 个拼车帖子
- 发布 1-2 个拼房帖子

### 3. 访问删除页面
```
https://steponsnow.com/delete-account.html
```

### 4. 验证登录
- 输入测试账号邮箱和密码
- 确认能正确显示用户信息

### 5. 执行删除
- 输入 `delete` 确认
- 点击"确认删除账号"
- 确认显示删除成功页面

### 6. 验证结果
```sql
-- 检查账号状态
SELECT is_active FROM user_profiles WHERE user_id = '<test_user_id>';
-- 应该返回: false

-- 检查拼车帖子状态
SELECT status FROM carpool_posts WHERE user_id = '<test_user_id>';
-- 应该返回: cancelled

-- 检查拼房帖子状态
SELECT status FROM accommodation_posts WHERE user_id = '<test_user_id>';
-- 应该返回: cancelled
```

### 7. 验证 App
- 尝试用该账号登录 App
- 应该提示"账号已停用"或类似错误
- 检查拼车/拼房列表，确认该用户的帖子不再显示

---

## 常见问题

### Q1: 删除后可以恢复吗？
**A**: 技术上可以。管理员可以在数据库中将 `is_active` 改回 `true`，但前端告知用户不可恢复。

### Q2: 删除后数据还在吗？
**A**: 是的，这是软删除。所有数据仍保留在数据库中，只是状态改变了。

### Q3: 用户发布的帖子还能看到吗？
**A**: 不能。所有帖子的 `status` 变为 `cancelled`，前端会过滤掉。

### Q4: 其他用户的申请记录怎么办？
**A**: 当前不删除申请记录。如果用户曾申请过其他人的拼车/拼房，这些记录仍保留。

### Q5: 用户可以重新注册同一个邮箱吗？
**A**: 理论上可以，因为 Supabase Auth 允许。但旧的 `user_profiles` 记录仍存在（`is_active=false`）。建议在注册时检查是否存在已停用的账号。

---

## 未来改进

### 1. 完全删除选项
- 提供"永久删除所有数据"选项（GDPR 合规）
- 物理删除用户记录、帖子、申请等

### 2. 删除原因收集
- 添加"为什么删除账号"的问卷
- 帮助改进产品

### 3. 冷静期
- 设置 7-30 天的冷静期
- 期间账号停用但数据不删除
- 用户可以在冷静期内恢复账号

### 4. 数据导出
- 删除前允许用户下载个人数据
- 包括发布的帖子、申请记录等

### 5. 邮件通知
- 删除成功后发送确认邮件
- 提醒用户账号已删除

---

## 相关文件

### 前端
- `website/delete-account.html` - 删除账号页面
- `website/index.html` - 首页（添加了删除账号链接）
- `website/privacy.html` - 隐私政策（添加了删除账号链接和说明）

### 后端
- `backend-api/api.py` - 添加了 `/api/users/delete-account` 端点
- `backend-api/.github/workflows/deploy.yml` - 更新了环境变量配置

### 文档
- `website/DELETE_ACCOUNT_FEATURE.md` - 本文档

---

**最后更新**: 2025年12月5日  
**版本**: v1.0  
**状态**: ✅ 已实现，待测试



