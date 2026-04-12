/**
 * UEC 刷题宝 - Google Apps Script 后端
 *
 * 部署步骤：
 * 1. 打开 https://script.google.com 创建新项目
 * 2. 将此代码粘贴到 Code.gs
 * 3. 创建一个新的 Google Sheets，复制其 ID（URL 中 /d/ 后面那段）
 * 4. 将下方 SHEET_ID 替换为你的 Google Sheets ID
 * 5. 点击「部署」→「新建部署」
 * 6. 类型选「网页应用」
 * 7. 「执行身份」选「我」
 * 8. 「谁有权访问」选「所有人」
 * 9. 部署后复制 URL，填入前端的 VITE_API_URL 环境变量
 */

// ===== 配置 =====
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // 替换为你的 Google Sheets ID
const ADMIN_PASSWORD = 'uec2026admin';        // 管理员密码，请修改

// ===== 主入口 =====

function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
      case 'checkStatus':
        result = checkUserStatus(e.parameter.userId);
        break;
      case 'getStats':
        result = getStats(e.parameter.password);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = e.parameter.action;
  let result;

  try {
    switch (action) {
      case 'register':
        result = registerUser(data);
        break;
      case 'activate':
        result = activateUser(data);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 用户注册 =====

function registerUser(data) {
  const sheet = getOrCreateSheet('用户数据');

  // 生成唯一 ID
  const userId = 'u_' + Utilities.getUuid().replace(/-/g, '').substring(0, 12);

  const now = new Date().toISOString();

  // 追加行: UserID | 昵称 | 学校 | 年级 | WhatsApp | 注册时间 | 渠道来源 | 付费状态 | 激活时间
  sheet.appendRow([
    userId,
    data.nickname || '',
    data.school || '',
    data.grade || '',
    data.whatsapp || '',
    now,
    data.ref || '',
    'free',    // 付费状态默认 free
    ''         // 激活时间
  ]);

  return {
    success: true,
    user: {
      id: userId,
      nickname: data.nickname,
      school: data.school,
      grade: data.grade,
      whatsapp: data.whatsapp || '',
      ref: data.ref || '',
      registeredAt: now,
      isPaid: false
    }
  };
}

// ===== 检查付费状态 =====

function checkUserStatus(userId) {
  if (!userId) return { success: false, error: 'Missing userId' };

  const sheet = getOrCreateSheet('用户数据');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        success: true,
        isPaid: data[i][7] === 'active',
        user: {
          id: data[i][0],
          nickname: data[i][1],
          school: data[i][2],
          grade: data[i][3],
          registeredAt: data[i][5],
          isPaid: data[i][7] === 'active'
        }
      };
    }
  }

  return { success: false, error: 'User not found' };
}

// ===== 管理员激活付费 =====

function activateUser(data) {
  if (data.password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid password' };
  }

  const sheet = getOrCreateSheet('用户数据');
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.userId) {
      sheet.getRange(i + 1, 8).setValue('active');       // 付费状态
      sheet.getRange(i + 1, 9).setValue(new Date().toISOString()); // 激活时间
      return { success: true, message: 'User activated' };
    }
  }

  return { success: false, error: 'User not found' };
}

// ===== 统计数据（管理员） =====

function getStats(password) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid password' };
  }

  const sheet = getOrCreateSheet('用户数据');
  const data = sheet.getDataRange().getValues();

  const totalUsers = data.length - 1; // 减去表头
  const paidUsers = data.filter((row, i) => i > 0 && row[7] === 'active').length;

  // 按渠道统计
  const channels = {};
  for (let i = 1; i < data.length; i++) {
    const ref = data[i][6] || 'direct';
    channels[ref] = (channels[ref] || 0) + 1;
  }

  // 按学校统计
  const schools = {};
  for (let i = 1; i < data.length; i++) {
    const school = data[i][2] || '未知';
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
      recentUsers: data.slice(-10).reverse().map(row => ({
        nickname: row[1],
        school: row[2],
        grade: row[3],
        ref: row[6],
        registeredAt: row[5]
      }))
    }
  };
}

// ===== 辅助函数 =====

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    // 添加表头
    sheet.appendRow([
      'UserID', '昵称', '学校', '年级', 'WhatsApp',
      '注册时间', '渠道来源', '付费状态', '激活时间'
    ]);
    // 格式化表头
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#f0fdf4');
    sheet.setFrozenRows(1);
  }

  return sheet;
}
