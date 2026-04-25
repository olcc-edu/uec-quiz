# UEC 刷题宝 — 完整运营手册

马来西亚独中统考刷题 web app。本文档汇总所有配置、链接、密码与常见问题处理流程。

---

## 🌐 公开链接

| 用途 | 链接 |
|------|------|
| **学生使用入口** | https://olcc-edu.github.io/uec-quiz/ |
| **管理员入口** | https://olcc-edu.github.io/uec-quiz/?admin=uec2026admin |
| **GitHub 仓库** | git@github.com:olcc-edu/uec-quiz.git |

> 管理员密码：`uec2026admin`（通过 URL 参数 `?admin=uec2026admin` 进入管理后台）

---

## 📦 技术架构

```
[学生手机] ──扫码/打开链接──> [GitHub Pages 静态网站]
                                      │
                                      ├──> [Google Sheets CSV]（题库，只读）
                                      └──> [Google Apps Script]（用户/付费 API）
                                                    │
                                                    └──> [Google Sheets]（用户数据）
```

**没有用到**：Supabase、Vercel、Firebase、自建后端
**全部托管在 Google + GitHub 上，零月租成本**

---

## 💾 数据存储位置

| 数据类型 | 存在哪里 | 说明 |
|----------|----------|------|
| **题库（约 8340 题）** | Google Sheets「UEC 刷题宝-题库」<br>发布为 CSV：`https://docs.google.com/spreadsheets/d/e/2PACX-1vTqnDvJyDALJk6C4-9y1f4jtFN_jNwgE8TTG0xjhp3BsEiuY4zKvsQPxACw_d-B4uBG3RUc0-LZFwFl/pub?output=csv` | 只读，所有学生共享 |
| **用户数据**（昵称/学校/年级/WhatsApp/付费状态） | Google Sheets「UEC刷题宝-用户数据」 | 通过 Apps Script 读写 |
| **学生答题历史** | 学生手机的浏览器 localStorage | ⚠️ 不存云端，清缓存会丢失 |
| **每日免费额度** | 学生手机的浏览器 localStorage | 每天自动重置 |
| **本地用户登录态** | 学生手机的浏览器 localStorage | 用 UserID 识别身份 |

**Google Apps Script API 部署 URL**：
```
https://script.google.com/macros/s/AKfycbxPjmzY5Q5r8i_wyAgwVxw_t6ojBoWWaiccUlrmvobBpFsYWncCfjZW38UhJc5vwryr/exec
```

---

## 📊 用户数据 Google Sheets 字段说明

| 列 | 字段 | 说明 |
|----|------|------|
| A | UserID | `u_xxxxxxxx` 服务器生成，唯一识别码 |
| B | 昵称 | 学生注册时输入 |
| C | 学校 | 60+ 独中下拉选项 |
| D | 年级 | J1/J2/J3（初中）或 S1/S2/S3（高中） |
| E | WhatsApp | 选填 |
| F | 注册时间 | ISO 时间戳 |
| G | 渠道来源 | 来自 `?ref=xxx` 参数（wechat/facebook/flyer 等） |
| **H** | **付费状态** | **`free` 或 `active`（手动改这一栏激活付费）** |
| I | 激活时间 | 改为 active 时自动填入 |

---

## 🛠️ 管理员操作流程

### 1️⃣ 给学生激活付费
1. 学生 WhatsApp 你说要付费（消息会自动带账号信息）
2. 你打开 Google Sheets「UEC刷题宝-用户数据」
3. `Ctrl+F` 搜索学生的 **账号 ID**（最准）或昵称
4. 把 H 列的 `free` 改成 `active`
5. 学生下次打开 app 会自动检测到付费状态

### 2️⃣ 进入管理员后台
- 打开：`https://olcc-edu.github.io/uec-quiz/?admin=uec2026admin`
- 点击右上角 ⚙️ 设置图标
- 可以做：同步题库、批量导入题目、生成 QR Code

### 3️⃣ 生成渠道 QR Code
- 进管理员后台 → 紫色按钮「QR Code 生成器」
- 10 个预设渠道（微信、WhatsApp、Facebook、Instagram、小红书、TikTok、传单、海报、朋友推荐、学校宣传）
- 也可输入自定义渠道名（如 `school_kuanren`、`event_2026`）
- 每个 QR Code 中间有彩色 logo
- 点「下载高清版」可下载 1000x1000 PNG

### 4️⃣ 更新代码
本地编辑后：
```bash
cd "/Users/cheongweiong/Library/CloudStorage/OneDrive-Personal/Desktop/personal/OLCC/独中课程线上化/uec-revision-master (1)"
git add -A
git commit -m "更新内容描述"
git push
```
GitHub Actions 自动部署，约 30 秒-1 分钟后生效。

---

## ❓ 常见问题与解决方案

### Q1：学生说「我付过费但还是免费版」
**可能原因**：账号 ID 没匹配上，或 Sheets 还没改

**解决方案**：
1. 让学生发账号 ID 给你（点 Header 昵称 → 我的账号 → 账号 ID）
2. 在 Sheets 用账号 ID 搜索（最准确）
3. 确认 H 列是 `active` 且拼写正确（不要有空格）
4. 让学生**完全关闭 app 再打开**（强制重新检查付费状态）

### Q2：学生说「忘了昵称，无法告诉你账号信息」
**解决方案**：让他点 Header 右上角自己的昵称 → 弹出账号详情 → 显示完整信息（昵称/学校/年级/账号 ID/付费状态）+ 一键复制按钮 + WhatsApp 联系客服按钮（自动带账号信息）

### Q3：账号 ID 是 `local_xxx` 开头，Sheets 里搜不到
**原因**：用户注册时 API 连接失败，账号只存在他手机本地，没写入 Sheets

**解决方案**：
- **自动**：让他刷新页面 → app 会自动把账号补录到 Sheets，新 ID 变成 `u_xxx`
- 渠道来源会标记为 `xxx_recovered`
- 之后再让他点 WhatsApp 联系你，新消息会带上 `u_xxx` ID

### Q4：学生说「我清掉了缓存，所有答题记录没了，也无法用之前付费的账号」
**说明**：答题记录只存本地，清缓存就消失（这是产品设计的取舍，避免做云端同步增加复杂度）

**解决方案**：
1. 让他重新注册（会得到新的 UserID）
2. 学生 WhatsApp 你新的账号信息
3. 你在 Sheets 中找到他**之前**的账号（按昵称或 WhatsApp 号搜），确认是付费用户
4. 把**新账号**的 H 列也改成 `active`
5. 旧账号可以保留或删除

### Q5：学生说「我删除/重新安装浏览器后无法登入」
同 Q4，按相同流程处理。

### Q6：学生说「无法注册，一直转圈圈」
**可能原因**：网络问题，或 Apps Script 服务异常

**解决方案**：
1. 让学生换网络试试（4G/Wi-Fi 切换）
2. 如果一直不行，让他先注册（会进离线模式，得到 `local_xxx` ID）
3. 之后网络恢复时刷新页面，会自动同步到 Sheets（参考 Q3）

### Q7：学生反馈某道题答案不对
**解决方案**：直接修改 Google Sheets 题库，刷新即可（学生手机会用 localStorage 缓存的旧题库，需要他清缓存或下次自动同步）

### Q8：怎么看哪个推广渠道效果最好
**解决方案**：在 Google Sheets「UEC刷题宝-用户数据」里，按 G 列（渠道来源）做透视表（Pivot Table）即可统计每个渠道的注册数

---

## 🔑 重要密码与凭证

| 项目 | 值 | 备注 |
|------|------|------|
| 管理员密码 | `uec2026admin` | URL 参数 `?admin=uec2026admin` |
| Apps Script 管理员密码 | `uec2026admin` | 用于 `activate`/`getStats` API（一般用不到，直接改 Sheets 即可） |
| WhatsApp 客服号 | `60165789873` | 已写死在代码中，要改需修改 `App.tsx` 和 `PaywallModal.tsx` |

---

## 📁 本地代码位置

```
/Users/cheongweiong/Library/CloudStorage/OneDrive-Personal/Desktop/personal/OLCC/独中课程线上化/uec-revision-master (1)/
```

---

## 🚀 免费版 vs 付费版规则

- **免费版**：每天可完整做 **1 个章节**的全部题目，超出后弹出 WhatsApp 联系按钮
- **付费版**（`active` 状态）：无限制，所有章节随便刷
- 每日额度按学生本地浏览器日期重置（凌晨自动重置）

---

## 🎓 首页推广位

学生首页底部有 3 个按钮：
- 📚 **统考教材推荐**（黄色）—— 占位链接，将来可以改为 Shopee/Lazada 店铺
- 🎓 **家教配对网（YesTeaching）**（蓝色）—— 链接到 https://yesteaching.com
- 💬 **WhatsApp 联系我们**（绿色）—— 自动带学生账号信息

要修改链接，编辑 `src/App.tsx` 的「首页底部按钮」段落。
