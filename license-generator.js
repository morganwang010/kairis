#!/usr/bin/env node

/**
 * License生成器
 * 用于根据用户名和授权时长生成license
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 密钥（生产环境中应该使用更安全的方式存储）
const SECRET_KEY = 'hrms-license-secret-key-2026';

/**
 * 生成License
 * @param {string} username - 用户名
 * @param {number} days - 授权天数
 * @param {string} companyName - 公司名称（可选）
 * @returns {string} 生成的license key
 */
function generateLicense(username, days, companyName = 'Unknown') {
  // 计算过期时间
  const now = new Date();
  const expirationDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  console.log('expirationDate:', expirationDate)
  // 构建license数据
  const licenseData = {
    username: username,
    companyName: companyName,
    issueDate: now.toISOString(),
    expirationDate: expirationDate.toISOString(),
    days: days
  };
  
  // 转换为字符串
  const dataString = JSON.stringify(licenseData);
  
  // 生成签名
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(dataString)
    .digest('hex');
  
  // 组合数据和签名
  const combined = `${dataString}|${signature}`;
  
  // Base64编码
  const licenseKey = Buffer.from(combined).toString('base64');
  
  // 格式化license key（每8个字符加一个连字符）
  const formattedLicenseKey = licenseKey.match(/.{1,8}/g).join('-');
  
  return formattedLicenseKey;
}

/**
 * 解析License
 * @param {string} licenseKey - license key
 * @returns {Object|null} 解析后的license数据，失败返回null
 */
function parseLicense(licenseKey) {
  try {
    // 移除连字符
    const cleanLicenseKey = licenseKey.replace(/-/g, '');
    
    // Base64解码
    const decoded = Buffer.from(cleanLicenseKey, 'base64').toString('utf8');
    
    // 分离数据和签名
    const [dataString, signature] = decoded.split('|');
    
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataString)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // 解析数据
    const licenseData = JSON.parse(dataString);
    return licenseData;
  } catch (error) {
    return null;
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('License生成器使用说明:');
  console.log('');
  console.log('  node license-generator.js <username> <days> [companyName]');
  console.log('');
  console.log('参数说明:');
  console.log('  username    - 用户名');
  console.log('  days        - 授权天数');
  console.log('  companyName - 公司名称（可选）');
  console.log('');
  console.log('示例:');
  console.log('  node license-generator.js admin 365 "测试公司"');
  console.log('');
  console.log('验证License:');
  console.log('  node license-generator.js --verify <licenseKey>');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  if (args[0] === '--verify' && args.length === 2) {
    const licenseKey = args[1];
    const licenseData = parseLicense(licenseKey);
    
    if (licenseData) {
      console.log('✅ License验证成功!');
      console.log('');
      console.log('📋 License信息:');
      console.log(`   用户名: ${licenseData.username}`);
      console.log(`   公司名称: ${licenseData.companyName}`);
      console.log(`   签发日期: ${new Date(licenseData.issueDate).toLocaleString()}`);
      console.log(`   过期日期: ${new Date(licenseData.expirationDate).toLocaleString()}`);
      console.log(`   授权天数: ${licenseData.days}天`);
      
      // 检查是否过期
      const now = new Date();
      const expirationDate = new Date(licenseData.expirationDate);
      if (now > expirationDate) {
        console.log('');
        console.log('⚠️  License已过期!');
      } else {
        const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
        console.log('');
        console.log(`✅ License还有 ${daysLeft} 天有效期`);
      }
    } else {
      console.log('❌ License验证失败!');
      console.log('   License格式错误或签名无效');
    }
    return;
  }
  
  if (args.length < 2) {
    console.log('❌ 参数不足!');
    console.log('');
    showHelp();
    return;
  }
  
  const username = args[0];
  const days = parseInt(args[1]);
  const companyName = args.length > 2 ? args.slice(2).join(' ') : 'Unknown';
  
  if (isNaN(days) || days <= 0) {
    console.log('❌ 授权天数必须是正整数!');
    return;
  }
  
  // 生成license
  const licenseKey = generateLicense(username, days, companyName);
  
  console.log('🎉 License生成成功!');
  console.log('');
  console.log('📋 License信息:');
  console.log(`   用户名: ${username}`);
  console.log(`   公司名称: ${companyName}`);
  console.log(`   授权天数: ${days}天`);
  console.log('');
  console.log('🔑 License Key:');
  console.log(`   ${licenseKey}`);
  console.log('');
  console.log('💡 使用说明:');
  console.log('   将以上License Key复制到系统的License激活页面即可');
}

// 运行主函数
if (require.main === module) {
  main();
}

// 导出函数（用于其他模块）
module.exports = {
  generateLicense,
  parseLicense
};
