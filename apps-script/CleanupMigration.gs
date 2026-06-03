/**
 * UEC 刷题宝 - 一次性数据清洗 & 迁移脚本
 *
 * 用法：
 *  1. 打开你的 Apps Script 项目（绑定到 Google Sheets 的那个）
 *  2. 新建一个 .gs 文件，把这段代码贴进去
 *  3. 上面 SHEET_ID 改成你的 Sheet ID（或直接复用 Code.gs 里的常量）
 *  4. 在 Apps Script 编辑器上方选择函数 `runCleanupAndMigration` → 点 ▶ 运行
 *  5. 第一次运行会弹权限授权，授权 → 再点一次运行
 *  6. 运行完打开 Sheet，肉眼审查 J~N 列（新加的），按提示决定要不要删/合并某些行
 *  7. 全部审查完后再去前端用新的 LoginPage 测试
 *
 * 它会做什么：
 *  - 新增列 J「手机号标准化」、K「密码哈希」、L「密码盐」、M「需改密码」、N「数据状态」
 *  - 把 E 列所有手机号清洗成统一格式（60xxxxxxxxx）写入 J 列
 *  - 给每个有效用户初始化密码 1234（哈希后写入 K/L 列），M 列设 TRUE（强制首次登录改密码）
 *  - 重复手机号、无效手机号、缺手机号的行 → N 列写状态 + 整行涂色高亮
 *  - 同时建立「答题历史」表（如果还没有）
 */

// 复用 Code.gs 里的 SHEET_ID（如果你把这段贴到同一个项目里就不用再写）
// 如果你单独建项目，取消下面这行注释并填你的 Sheet ID：
// const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// ===== 配置 =====
const DEFAULT_PASSWORD = '1234';
const COLOR_DUPLICATE = '#fef3c7';    // 黄色：手机号重复
const COLOR_INVALID = '#fecaca';      // 红色：手机号无效/缺号
const COLOR_PAID_NO_PHONE = '#fed7aa'; // 橙色：付费但缺/坏号码（最需要你跟进）

/**
 * 主入口：运行这个函数即可
 */
function runCleanupAndMigration() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('用户数据');
  if (!sheet) {
    throw new Error('找不到「用户数据」表，请先确认 SHEET_ID 与表名');
  }

  ensureColumns_(sheet);
  ensureHistorySheet_(ss);

  const range = sheet.getDataRange();
  const data = range.getValues();
  const lastCol = sheet.getLastColumn();

  // 第一遍：标准化手机号 + 记录每个号码出现在哪些行
  const phoneToRows = {};
  const updates = []; // 累积更新，最后一次性写回（快）

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rawPhone = String(row[4] || '').trim(); // E 列
    const paidStatus = String(row[7] || '').trim(); // H 列
    const normalized = normalizePhone_(rawPhone);

    if (normalized) {
      if (!phoneToRows[normalized]) phoneToRows[normalized] = [];
      phoneToRows[normalized].push(i + 1); // 1-based row index
    }

    updates.push({
      rowIdx: i + 1,
      normalized: normalized || '',
      paidStatus: paidStatus,
      rawPhone: rawPhone,
    });
  }

  // 第二遍：写 J 列（标准化号码）、初始化密码、判定数据状态、涂色
  const numRows = updates.length;
  const writeMatrix = []; // J..N 一起写
  for (let k = 0; k < numRows; k++) {
    const u = updates[k];
    const dupCount = u.normalized ? phoneToRows[u.normalized].length : 0;
    const isPaid = u.paidStatus === 'active';

    let status = '';
    let bgColor = null;

    if (!u.normalized) {
      status = u.rawPhone ? '❌ 手机号格式无效' : '❌ 缺手机号';
      bgColor = isPaid ? COLOR_PAID_NO_PHONE : COLOR_INVALID;
      if (isPaid) status = '⚠️ 付费但' + status.substring(2);
    } else if (dupCount > 1) {
      status = `🔄 手机号重复（共 ${dupCount} 条）请审查`;
      bgColor = COLOR_DUPLICATE;
      if (isPaid) status += ' · 含付费账号';
    } else {
      status = '✅ OK';
    }

    // 密码初始化：所有"OK"和"重复"的行都给一个默认密码（让付费用户能登录）
    // 完全无效（缺号/坏号）的行不给密码，反正登不进
    let passwordHash = '';
    let passwordSalt = '';
    let mustChange = '';
    if (u.normalized) {
      passwordSalt = Utilities.getUuid();
      passwordHash = hashPassword_(DEFAULT_PASSWORD, passwordSalt);
      mustChange = 'TRUE';
    }

    writeMatrix.push([u.normalized, passwordHash, passwordSalt, mustChange, status]);

    if (bgColor) {
      sheet.getRange(u.rowIdx, 1, 1, lastCol).setBackground(bgColor);
    }
  }

  // 一次性写 J..N 列
  if (writeMatrix.length > 0) {
    sheet.getRange(2, 10, writeMatrix.length, 5).setValues(writeMatrix);
  }

  // 摘要
  const summary = buildSummary_(updates, phoneToRows);
  Logger.log(summary);
  SpreadsheetApp.getUi && SpreadsheetApp.getUi().alert(summary);
}

/**
 * 确保 J~N 列存在并有表头
 */
function ensureColumns_(sheet) {
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 14)).getValues()[0];
  const newHeaders = ['手机号标准化', '密码哈希', '密码盐', '需改密码', '数据状态'];
  const startCol = 10; // J

  for (let i = 0; i < newHeaders.length; i++) {
    sheet.getRange(1, startCol + i).setValue(newHeaders[i]).setFontWeight('bold').setBackground('#f0fdf4');
  }
  sheet.setFrozenRows(1);
}

/**
 * 建立「答题历史」表（如不存在）
 */
function ensureHistorySheet_(ss) {
  let sheet = ss.getSheetByName('答题历史');
  if (!sheet) {
    sheet = ss.insertSheet('答题历史');
    sheet.appendRow(['UserID', '时间', '年段', '科目', '章节', '得分', '总题数']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#f0fdf4');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 手机号标准化
 * 接受：60123456789 / 0123456789 / 123456789 / +60 12-345 6789 等
 * 返回：60xxxxxxxx 或 '' (无效)
 *
 * 马来西亚手机号规则：国码 60 + 1开头 + 8~9位 = 总长 11~12 位
 */
function normalizePhone_(raw) {
  if (!raw) return '';
  let s = String(raw).replace(/[\s\-\(\)\+]/g, '');
  if (!/^\d+$/.test(s)) return ''; // 含非数字字符（清完后），无效

  // 060xxx → 60xxx
  if (s.startsWith('060')) s = s.substring(1);
  // 0xxx → 60xxx（马来本地格式）
  if (s.startsWith('0') && s.length >= 10) s = '60' + s.substring(1);
  // 1xxx (9~10位) → 60xxx（缺国码）
  if (s.startsWith('1') && s.length >= 9 && s.length <= 10) s = '60' + s;

  // 最终校验：必须 60 开头 + 1 + 后续 8~9 位
  if (!/^601\d{8,9}$/.test(s)) return '';

  return s;
}

/**
 * SHA-256(password + salt) → hex string
 */
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

function buildSummary_(updates, phoneToRows) {
  let total = updates.length;
  let ok = 0, dup = 0, invalid = 0, paidNoPhone = 0;
  for (var k = 0; k < updates.length; k++) {
    var u = updates[k];
    var dupCount = u.normalized ? phoneToRows[u.normalized].length : 0;
    var isPaid = u.paidStatus === 'active';
    if (!u.normalized) {
      invalid++;
      if (isPaid) paidNoPhone++;
    } else if (dupCount > 1) {
      dup++;
    } else {
      ok++;
    }
  }
  return [
    '数据清洗完成 ✅',
    '',
    '总用户数：' + total,
    '✅ 正常：' + ok,
    '🔄 手机号重复（黄底）：' + dup,
    '❌ 手机号无效/缺失（红底）：' + invalid,
    '⚠️ 付费但缺号（橙底）：' + paidNoPhone + ' 🔥 重点跟进',
    '',
    '下一步：去 Sheets 看 N 列「数据状态」逐行处理',
    '· 重复行：决定保留哪一条（建议保留付费状态最新的那条），其他删掉',
    '· 缺号付费用户：直接联系学生补 WhatsApp 号',
    '· 完全无效的免费用户：可直接删行',
    '',
    '所有非"完全无效"的用户已设默认密码：1234',
    '他们登录后会被强制改密码。',
  ].join('\n');
}
