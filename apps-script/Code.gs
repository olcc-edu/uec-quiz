/**
 * UEC 刷题宝 - Google Apps Script 后端
 *
 * 部署步骤：
 * 1. 打开 https://script.google.com 创建新项目（或更新现有的）
 * 2. 将此代码粘贴到 Code.gs
 * 3. 创建 Google Sheets，复制其 ID 替换 SHEET_ID
 * 4. 「部署」→「新建部署」→ 类型「网页应用」
 * 5. 执行身份「我」，谁有权访问「所有人」
 * 6. 复制 URL，填入前端 VITE_API_URL 环境变量（或写在 api.ts 默认值）
 *
 * 数据表结构：
 *   用户数据 (A~N)
 *     A UserID | B 昵称 | C 学校 | D 年级 | E WhatsApp原始 | F 注册时间
 *     G 渠道来源 | H 付费状态 | I 激活时间
 *     J 手机号标准化 | K 密码哈希 | L 密码盐 | M 需改密码 | N 数据状态
 *   答题历史 (A~G)
 *     A UserID | B 时间 | C 年段 | D 科目 | E 章节 | F 得分 | G 总题数
 */

// ===== 配置 =====
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // 替换为你的 Google Sheets ID
const ADMIN_PASSWORD = 'uec2026admin';

// 列索引（1-based）
const COL = {
  USER_ID: 1,
  NICKNAME: 2,
  SCHOOL: 3,
  GRADE: 4,
  WHATSAPP_RAW: 5,
  REGISTERED_AT: 6,
  REF: 7,
  PAID: 8,
  ACTIVATED_AT: 9,
  PHONE_NORM: 10,
  PASSWORD_HASH: 11,
  PASSWORD_SALT: 12,
  MUST_CHANGE: 13,
  STATUS: 14,
};

// ===== 主入口 =====

function doGet(e) {
  return route_(e);
}

function doPost(e) {
  return route_(e);
}

function route_(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  const params = (e && e.parameter) || {};
  let body = {};
  try {
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    body = {};
  }
  // 合并 GET 参数与 POST body，GET 优先（便于前端用 URLSearchParams）
  const data = Object.assign({}, body, params);

  let result;
  try {
    switch (action) {
      case 'register':
        result = registerUser(data);
        break;
      case 'loginByPhone':
        result = loginByPhone(data);
        break;
      case 'loginById':
        result = loginById(data);
        break;
      case 'changePassword':
        result = changePassword(data);
        break;
      case 'checkStatus':
        result = checkUserStatus(data.userId);
        break;
      case 'saveHistory':
        result = saveHistory(data);
        break;
      case 'getHistory':
        result = getHistory(data.userId);
        break;
      case 'activate':
        result = activateUser(data);
        break;
      case 'getStats':
        result = getStats(data.password);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { success: false, error: String(err && err.message || err) };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 用户注册 =====

function registerUser(data) {
  const sheet = getOrCreateUserSheet_();
  const normalizedPhone = normalizePhone_(data.whatsapp);

  if (!data.nickname || !data.school || !data.grade) {
    return { success: false, error: '缺少必填字段' };
  }
  if (!normalizedPhone) {
    return { success: false, error: '手机号格式无效（请用马来西亚号码，例如 0123456789）' };
  }
  if (!data.password || String(data.password).length < 4) {
    return { success: false, error: '密码至少 4 位' };
  }

  // 检查手机号是否已存在
  const existing = findRowByPhone_(sheet, normalizedPhone);
  if (existing) {
    return { success: false, error: '此手机号已注册，请直接登录' };
  }

  const userId = 'u_' + Utilities.getUuid().replace(/-/g, '').substring(0, 12);
  const now = new Date().toISOString();
  const salt = Utilities.getUuid();
  const hash = hashPassword_(data.password, salt);

  sheet.appendRow([
    userId,
    data.nickname || '',
    data.school || '',
    data.grade || '',
    data.whatsapp || '',
    now,
    data.ref || '',
    'free',
    '',
    normalizedPhone,
    hash,
    salt,
    'FALSE', // 用户自己设的密码，不需要强制改
    '✅ OK',
  ]);

  return {
    success: true,
    user: buildUserObject_({
      id: userId,
      nickname: data.nickname,
      school: data.school,
      grade: data.grade,
      whatsapp: data.whatsapp || '',
      phoneNormalized: normalizedPhone,
      ref: data.ref || '',
      registeredAt: now,
      isPaid: false,
      passwordChangeRequired: false,
    }),
  };
}

// ===== 手机号 + 密码登录 =====

function loginByPhone(data) {
  const normalized = normalizePhone_(data.phone);
  if (!normalized) {
    return { success: false, error: '手机号格式无效' };
  }
  if (!data.password) {
    return { success: false, error: '请输入密码' };
  }

  const sheet = getOrCreateUserSheet_();
  const row = findRowByPhone_(sheet, normalized);
  if (!row) {
    return { success: false, error: '此手机号未注册' };
  }

  const expectedHash = String(row.values[COL.PASSWORD_HASH - 1] || '');
  const salt = String(row.values[COL.PASSWORD_SALT - 1] || '');
  if (!expectedHash || !salt) {
    return { success: false, error: '账号未初始化密码，请联系客服' };
  }

  const actualHash = hashPassword_(data.password, salt);
  if (actualHash !== expectedHash) {
    return { success: false, error: '密码错误' };
  }

  return { success: true, user: rowToUser_(row.values) };
}

// ===== UserID 兜底登录 =====

function loginById(data) {
  if (!data.userId) return { success: false, error: '请输入账号 ID' };
  const sheet = getOrCreateUserSheet_();
  const row = findRowByUserId_(sheet, data.userId);
  if (!row) return { success: false, error: '账号 ID 不存在' };
  return { success: true, user: rowToUser_(row.values) };
}

// ===== 修改密码 =====

function changePassword(data) {
  if (!data.userId) return { success: false, error: '缺少 userId' };
  if (!data.newPassword || String(data.newPassword).length < 4) {
    return { success: false, error: '新密码至少 4 位' };
  }

  const sheet = getOrCreateUserSheet_();
  const row = findRowByUserId_(sheet, data.userId);
  if (!row) return { success: false, error: '账号不存在' };

  // 校验旧密码（除非允许 force=true 用于首次默认密码）
  const oldHash = String(row.values[COL.PASSWORD_HASH - 1] || '');
  const oldSalt = String(row.values[COL.PASSWORD_SALT - 1] || '');
  if (oldHash) {
    const provided = hashPassword_(String(data.oldPassword || ''), oldSalt);
    if (provided !== oldHash) {
      return { success: false, error: '旧密码错误' };
    }
  }

  const newSalt = Utilities.getUuid();
  const newHash = hashPassword_(data.newPassword, newSalt);
  sheet.getRange(row.rowIdx, COL.PASSWORD_HASH).setValue(newHash);
  sheet.getRange(row.rowIdx, COL.PASSWORD_SALT).setValue(newSalt);
  sheet.getRange(row.rowIdx, COL.MUST_CHANGE).setValue('FALSE');

  return { success: true };
}

// ===== 检查付费状态 =====

function checkUserStatus(userId) {
  if (!userId) return { success: false, error: 'Missing userId' };
  const sheet = getOrCreateUserSheet_();
  const row = findRowByUserId_(sheet, userId);
  if (!row) return { success: false, error: 'User not found' };
  return {
    success: true,
    isPaid: String(row.values[COL.PAID - 1]) === 'active',
    user: rowToUser_(row.values),
  };
}

// ===== 答题历史 =====

function saveHistory(data) {
  if (!data.userId) return { success: false, error: '缺少 userId' };
  const sheet = getOrCreateHistorySheet_();
  sheet.appendRow([
    data.userId,
    data.date || new Date().toISOString(),
    data.level || '',
    data.subject || '',
    data.chapter || '',
    Number(data.score) || 0,
    Number(data.total) || 0,
  ]);
  return { success: true };
}

function getHistory(userId) {
  if (!userId) return { success: false, error: '缺少 userId' };
  const sheet = getOrCreateHistorySheet_();
  const data = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(userId)) {
      out.push({
        id: 'h_' + i,
        date: String(data[i][1] || ''),
        level: String(data[i][2] || ''),
        subject: String(data[i][3] || ''),
        chapter: String(data[i][4] || ''),
        score: Number(data[i][5]) || 0,
        total: Number(data[i][6]) || 0,
      });
    }
  }
  // 最近 50 条
  out.sort((a, b) => (a.date < b.date ? 1 : -1));
  return { success: true, history: out.slice(0, 50) };
}

// ===== 管理员激活付费 =====

function activateUser(data) {
  if (data.password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid password' };
  }
  const sheet = getOrCreateUserSheet_();
  const row = findRowByUserId_(sheet, data.userId);
  if (!row) return { success: false, error: 'User not found' };
  sheet.getRange(row.rowIdx, COL.PAID).setValue('active');
  sheet.getRange(row.rowIdx, COL.ACTIVATED_AT).setValue(new Date().toISOString());
  return { success: true };
}

// ===== 统计数据 =====

function getStats(password) {
  if (password !== ADMIN_PASSWORD) return { success: false, error: 'Invalid password' };

  const sheet = getOrCreateUserSheet_();
  const data = sheet.getDataRange().getValues();
  const totalUsers = data.length - 1;
  let paidUsers = 0;
  const channels = {};
  const schools = {};

  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.PAID - 1] === 'active') paidUsers++;
    const ref = data[i][COL.REF - 1] || 'direct';
    channels[ref] = (channels[ref] || 0) + 1;
    const school = data[i][COL.SCHOOL - 1] || '未知';
    schools[school] = (schools[school] || 0) + 1;
  }

  return {
    success: true,
    stats: {
      totalUsers,
      paidUsers,
      freeUsers: totalUsers - paidUsers,
      channels,
      schools,
    },
  };
}

// ===== 辅助函数 =====

function getOrCreateUserSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('用户数据');
  if (!sheet) {
    sheet = ss.insertSheet('用户数据');
    sheet.appendRow([
      'UserID', '昵称', '学校', '年级', 'WhatsApp',
      '注册时间', '渠道来源', '付费状态', '激活时间',
      '手机号标准化', '密码哈希', '密码盐', '需改密码', '数据状态',
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#f0fdf4');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateHistorySheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('答题历史');
  if (!sheet) {
    sheet = ss.insertSheet('答题历史');
    sheet.appendRow(['UserID', '时间', '年段', '科目', '章节', '得分', '总题数']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f0fdf4');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRowByUserId_(sheet, userId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.USER_ID - 1]) === String(userId)) {
      return { rowIdx: i + 1, values: data[i] };
    }
  }
  return null;
}

function findRowByPhone_(sheet, normalizedPhone) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][COL.PHONE_NORM - 1]) === String(normalizedPhone)) {
      return { rowIdx: i + 1, values: data[i] };
    }
  }
  return null;
}

function rowToUser_(values) {
  return {
    id: String(values[COL.USER_ID - 1] || ''),
    nickname: String(values[COL.NICKNAME - 1] || ''),
    school: String(values[COL.SCHOOL - 1] || ''),
    grade: String(values[COL.GRADE - 1] || ''),
    whatsapp: String(values[COL.WHATSAPP_RAW - 1] || ''),
    phoneNormalized: String(values[COL.PHONE_NORM - 1] || ''),
    ref: String(values[COL.REF - 1] || ''),
    registeredAt: String(values[COL.REGISTERED_AT - 1] || ''),
    isPaid: String(values[COL.PAID - 1]) === 'active',
    passwordChangeRequired: String(values[COL.MUST_CHANGE - 1]).toUpperCase() === 'TRUE',
  };
}

function buildUserObject_(u) {
  return {
    id: u.id,
    nickname: u.nickname,
    school: u.school,
    grade: u.grade,
    whatsapp: u.whatsapp || '',
    phoneNormalized: u.phoneNormalized || '',
    ref: u.ref || '',
    registeredAt: u.registeredAt,
    isPaid: !!u.isPaid,
    passwordChangeRequired: !!u.passwordChangeRequired,
  };
}

/**
 * 马来西亚手机号标准化：返回 60xxxxxxxxx 或 ''
 */
function normalizePhone_(raw) {
  if (!raw) return '';
  let s = String(raw).replace(/[\s\-\(\)\+]/g, '');
  if (!/^\d+$/.test(s)) return '';
  if (s.startsWith('060')) s = s.substring(1);
  if (s.startsWith('0') && s.length >= 10) s = '60' + s.substring(1);
  if (s.startsWith('1') && s.length >= 9 && s.length <= 10) s = '60' + s;
  if (!/^601\d{8,9}$/.test(s)) return '';
  return s;
}

function hashPassword_(password, salt) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(password) + String(salt),
    Utilities.Charset.UTF_8
  );
  return digest.map(function (b) {
    return ('0' + (b & 0xff).toString(16)).slice(-2);
  }).join('');
}
