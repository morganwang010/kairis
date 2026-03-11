const fs = require('fs');
const path = require('path');

// 配置项
const ENV_FILE_PATH = path.resolve(__dirname, '../../.env'); // .env文件路径
const VERSION_KEY = 'VITE_BUILD_VERSION'; // React识别的环境变量前缀必须是REACT_APP_
const TIME_FORMAT = 'YYYY-MM-DD-HHmmss'; // 时间格式

// 格式化时间（简易实现，也可使用dayjs/moment）
function formatDate(date, format) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

// 生成版本号
const now = new Date();
const version = formatDate(now, TIME_FORMAT);
const versionLine = `${VERSION_KEY}=${version}`;

// 处理.env文件
try {
  // 读取现有.env内容（如果存在）
  let envContent = '';
  if (fs.existsSync(ENV_FILE_PATH)) {
    envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  }

  // 拆分行，替换/追加版本号
  const lines = envContent.split('\n').filter(line => line.trim() !== '');
  const updatedLines = [];
  let keyExists = false;

  for (const line of lines) {
    // 跳过注释行，避免替换注释
    if (line.trimStart().startsWith('#')) {
      updatedLines.push(line);
      continue;
    }
    // 匹配版本号键，替换值
    const [key] = line.split('=', 2);
    if (key === VERSION_KEY) {
      updatedLines.push(versionLine);
      keyExists = true;
    } else {
      updatedLines.push(line);
    }
  }

  // 若版本号键不存在，追加到末尾
  if (!keyExists) {
    updatedLines.push(versionLine);
  }

  // 写入.env文件
  fs.writeFileSync(ENV_FILE_PATH, updatedLines.join('\n') + '\n', 'utf8');
  console.log(`✅ 版本号已写入.env：${versionLine}`);
} catch (err) {
  console.error('❌ 写入版本号失败：', err);
  process.exit(1); // 构建前脚本失败，终止构建
}